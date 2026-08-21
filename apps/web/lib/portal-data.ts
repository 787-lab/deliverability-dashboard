import { getServerSupabaseForUser } from "./supabase/server";
import { MONITOR_TYPES, type MonitorType, type MonitorStatus } from "./data";

export type MyClient = { id: string; name: string };

export async function getMyClient(): Promise<MyClient | null> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("clients").select("id, name").eq("user_id", user.id).maybeSingle();
  if (error) throw error;

  return data;
}

export type PortalDomainStatus = {
  domainId: string;
  domainName: string;
  openAlertCount: number;
  statuses: Record<MonitorType, { status: MonitorStatus; checkedAt: string | null }>;
};

export async function getMyDomainStatuses(): Promise<PortalDomainStatus[]> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // RLS ("clients can read own domains") scopes this to the caller's client
  // — no explicit client_id filter needed here.
  const { data: domains, error: domainsError } = await supabase
    .from("domains")
    .select("id, domain_name")
    .order("domain_name");
  if (domainsError) throw domainsError;
  if (!domains || domains.length === 0) return [];

  const domainIds = domains.map((d) => d.id);

  // RLS added in 0008 scopes both of these to the caller's own domains too
  // — a stranger's domain_id in domainIds (there shouldn't be one) would
  // just come back empty, not leak another client's rows.
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
    resultsByDomain.get(row.domain_id)!.set(row.monitor_type, row.status);
  }

  return domains.map((domain) => {
    const domainResults = resultsByDomain.get(domain.id);
    const statuses = {} as PortalDomainStatus["statuses"];

    for (const monitorType of MONITOR_TYPES) {
      const result = domainResults?.get(monitorType);
      statuses[monitorType] = result
        ? { status: result.status as MonitorStatus, checkedAt: result.checked_at }
        : { status: "no_data", checkedAt: null };
    }

    return {
      domainId: domain.id,
      domainName: domain.domain_name,
      openAlertCount: openAlertCounts.get(domain.id) ?? 0,
      statuses,
    };
  });
}

export type PortalAlert = {
  id: string;
  domainId: string;
  domainName: string;
  monitorType: string;
  severity: string;
  message: string;
  createdAt: string;
};

export async function getMyOpenAlerts(limit = 100): Promise<PortalAlert[]> {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("alerts")
    .select("id, domain_id, monitor_type, severity, message, created_at, domains(domain_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((alert) => ({
    id: alert.id,
    domainId: alert.domain_id,
    domainName: (alert.domains as unknown as { domain_name: string } | null)?.domain_name ?? "Unknown domain",
    monitorType: alert.monitor_type,
    severity: alert.severity,
    message: alert.message,
    createdAt: alert.created_at,
  }));
}

export type PortalDomainDetail = {
  domainId: string;
  domainName: string;
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

export async function getMyDomainDetail(domainId: string): Promise<PortalDomainDetail | null> {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("id, domain_name, is_active")
    .eq("id", domainId)
    .maybeSingle();
  if (domainError) throw domainError;
  if (!domain) return null;

  const [{ data: latestResults, error: resultsError }, { data: alerts, error: alertsError }] =
    await Promise.all([
      supabase
        .from("latest_check_results")
        .select("monitor_type, status, checked_at, score, details")
        .eq("domain_id", domainId),
      supabase
        .from("alerts")
        .select("id, monitor_type, severity, status, message, created_at, resolved_at")
        .eq("domain_id", domainId)
        .order("created_at", { ascending: false }),
    ]);
  if (resultsError) throw resultsError;
  if (alertsError) throw alertsError;

  const resultByMonitor = new Map((latestResults ?? []).map((result) => [result.monitor_type, result]));

  return {
    domainId: domain.id,
    domainName: domain.domain_name,
    isActive: domain.is_active,
    checks: MONITOR_TYPES.map((monitorType) => {
      const result = resultByMonitor.get(monitorType);
      return {
        monitorType,
        status: (result?.status as MonitorStatus) ?? "no_data",
        checkedAt: result?.checked_at ?? null,
        score: result?.score ?? null,
        details: (result?.details as Record<string, unknown>) ?? {},
      };
    }),
    alerts: (alerts ?? []).map((alert) => ({
      id: alert.id,
      monitorType: alert.monitor_type,
      severity: alert.severity,
      status: alert.status,
      message: alert.message,
      createdAt: alert.created_at,
      resolvedAt: alert.resolved_at,
    })),
  };
}
