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
      clientName: (domain.clients as { name: string } | null)?.name ?? "Unknown",
      isActive: domain.is_active,
      openAlertCount: openAlertCounts.get(domain.id) ?? 0,
      statuses,
    };
  });
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
    const domain = alert.domains as { domain_name: string; clients: { name: string } | null } | null;
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
