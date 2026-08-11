import { getServerSupabase } from "./supabase";

export const MONITOR_TYPES = [
  "spf",
  "dkim",
  "dmarc",
  "domain_reputation",
  "warmup",
  "inbox_placement",
] as const;

export type MonitorType = (typeof MONITOR_TYPES)[number];
export type MonitorStatus = "pass" | "warning" | "fail" | "unknown" | "no_data";

export const MONITOR_LABELS: Record<MonitorType, string> = {
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
  domain_reputation: "Reputation",
  warmup: "Warmup",
  inbox_placement: "Inbox Placement",
};

export type ClientOption = { id: string; name: string };

export async function getClients(): Promise<ClientOption[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("clients").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export type ClientWithStatus = {
  id: string;
  name: string;
  contactEmail: string | null;
  isLinked: boolean;
  domainCount: number;
};

export async function getClientsWithStatus(): Promise<ClientWithStatus[]> {
  const supabase = getServerSupabase();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, contact_email, user_id")
    .order("name");
  if (clientsError) throw clientsError;

  const { data: domains, error: domainsError } = await supabase.from("domains").select("client_id");
  if (domainsError) throw domainsError;

  const domainCounts = new Map<string, number>();
  for (const domain of domains ?? []) {
    domainCounts.set(domain.client_id, (domainCounts.get(domain.client_id) ?? 0) + 1);
  }

  return (clients ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    contactEmail: client.contact_email,
    isLinked: client.user_id !== null,
    domainCount: domainCounts.get(client.id) ?? 0,
  }));
}

export type AdminDomainRow = {
  id: string;
  domainName: string;
  clientName: string;
  isVerified: boolean;
  createdAt: string;
};

export async function getAllDomains(): Promise<AdminDomainRow[]> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("domains")
    .select("id, domain_name, is_verified, created_at, clients(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((domain) => ({
    id: domain.id,
    domainName: domain.domain_name,
    clientName: (domain.clients as unknown as { name: string } | null)?.name ?? "Unknown",
    isVerified: domain.is_verified,
    createdAt: domain.created_at,
  }));
}

export type DomainStatusRow = {
  domainId: string;
  domainName: string;
  clientName: string;
  isActive: boolean;
  openAlertCount: number;
  statuses: Record<MonitorType, { status: MonitorStatus; checkedAt: string | null }>;
};

export async function getDomainStatuses(): Promise<DomainStatusRow[]> {
  const supabase = getServerSupabase();

  const { data: domains, error: domainsError } = await supabase
    .from("domains")
    .select("id, domain_name, is_active, clients(name)")
    .order("domain_name");
  if (domainsError) throw domainsError;
  if (!domains || domains.length === 0) return [];

  const domainIds = domains.map((d) => d.id);

  const { data: latestResults, error: resultsError } = await supabase
    .from("latest_check_results")
    .select("domain_id, monitor_type, status, checked_at")
    .in("domain_id", domainIds);
  if (resultsError) throw resultsError;

  const { data: openAlerts, error: alertsError } = await supabase
    .from("alerts")
    .select("domain_id")
    .eq("status", "open")
    .in("domain_id", domainIds);
  if (alertsError) throw alertsError;

  const openAlertCounts = new Map<string, number>();
  for (const alert of openAlerts ?? []) {
    openAlertCounts.set(alert.domain_id, (openAlertCounts.get(alert.domain_id) ?? 0) + 1);
  }

  const resultsByDomain = new Map<string, Map<string, { status: string; checked_at: string }>>();
  for (const row of latestResults ?? []) {
    if (!resultsByDomain.has(row.domain_id)) resultsByDomain.set(row.domain_id, new Map());
    resultsByDomain.get(row.domain_id)!.set(row.monitor_type, row);
  }

  return domains.map((domain) => {
    const domainResults = resultsByDomain.get(domain.id);
    const statuses = {} as DomainStatusRow["statuses"];
    for (const monitorType of MONITOR_TYPES) {
      const result = domainResults?.get(monitorType);
      statuses[monitorType] = result
        ? { status: result.status as MonitorStatus, checkedAt: result.checked_at }
        : { status: "no_data", checkedAt: null };
    }

    return {
      domainId: domain.id,
      domainName: domain.domain_name,
      clientName: (domain.clients as unknown as { name: string } | null)?.name ?? "Unknown",
      isActive: domain.is_active,
      openAlertCount: openAlertCounts.get(domain.id) ?? 0,
      statuses,
    };
  });
}

export type DomainDetail = {
  domainId: string;
  domainName: string;
  clientName: string;
  isActive: boolean;
  checks: {
    monitorType: MonitorType;
    status: MonitorStatus;
    checkedAt: string | null;
    score: number | null;
    details: Record<string, unknown>;
  }[];
  alerts: {
    id: string;
    monitorType: string;
    severity: string;
    status: string;
    message: string;
    createdAt: string;
    resolvedAt: string | null;
  }[];
};

export async function getDomainDetail(domainId: string): Promise<DomainDetail | null> {
  const supabase = getServerSupabase();

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("id, domain_name, is_active, clients(name)")
    .eq("id", domainId)
    .maybeSingle();
  if (domainError) throw domainError;
  if (!domain) return null;

  const { data: latestResults, error: resultsError } = await supabase
    .from("latest_check_results")
    .select("monitor_type, status, checked_at, score, details")
    .eq("domain_id", domainId);
  if (resultsError) throw resultsError;

  const resultsByMonitor = new Map(
    (latestResults ?? []).map((row) => [row.monitor_type, row])
  );

  const checks = MONITOR_TYPES.map((monitorType) => {
    const result = resultsByMonitor.get(monitorType);
    return {
      monitorType,
      status: (result?.status as MonitorStatus) ?? "no_data",
      checkedAt: result?.checked_at ?? null,
      score: result?.score ?? null,
      details: (result?.details as Record<string, unknown>) ?? {},
    };
  });

  const { data: alerts, error: alertsError } = await supabase
    .from("alerts")
    .select("id, monitor_type, severity, status, message, created_at, resolved_at")
    .eq("domain_id", domainId)
    .order("created_at", { ascending: false });
  if (alertsError) throw alertsError;

  return {
    domainId: domain.id,
    domainName: domain.domain_name,
    clientName: (domain.clients as unknown as { name: string } | null)?.name ?? "Unknown",
    isActive: domain.is_active,
    checks,
    alerts: (alerts ?? []).map((a) => ({
      id: a.id,
      monitorType: a.monitor_type,
      severity: a.severity,
      status: a.status,
      message: a.message,
      createdAt: a.created_at,
      resolvedAt: a.resolved_at,
    })),
  };
}

export type AlertRow = {
  id: string;
  domainName: string;
  clientName: string;
  monitorType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
};

export async function getAlerts(limit = 100): Promise<AlertRow[]> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("alerts")
    .select(
      "id, monitor_type, severity, status, message, created_at, resolved_at, domains(domain_name, clients(name))"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((alert) => {
    const domain = alert.domains as unknown as {
      domain_name: string;
      clients: { name: string } | null;
    } | null;
    return {
      id: alert.id,
      domainName: domain?.domain_name ?? "Unknown domain",
      clientName: domain?.clients?.name ?? "Unknown",
      monitorType: alert.monitor_type,
      severity: alert.severity,
      status: alert.status,
      message: alert.message,
      createdAt: alert.created_at,
      resolvedAt: alert.resolved_at,
    };
  });
}
