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
  statuses: Record<MonitorType, MonitorStatus>;
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
    .select("domain_id, monitor_type, status")
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

  const resultsByDomain = new Map<string, Map<string, string>>();
  for (const row of latestResults ?? []) {
    if (!resultsByDomain.has(row.domain_id)) resultsByDomain.set(row.domain_id, new Map());
    resultsByDomain.get(row.domain_id)!.set(row.monitor_type, row.status);
  }

  return domains.map((domain) => {
    const domainResults = resultsByDomain.get(domain.id);
    const statuses = {} as Record<MonitorType, MonitorStatus>;

    for (const monitorType of MONITOR_TYPES) {
      statuses[monitorType] = (domainResults?.get(monitorType) as MonitorStatus) ?? "no_data";
    }

    return {
      domainId: domain.id,
      domainName: domain.domain_name,
      openAlertCount: openAlertCounts.get(domain.id) ?? 0,
      statuses,
    };
  });
}
