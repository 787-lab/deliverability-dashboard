import { getServerSupabaseForUser } from "./supabase/server";
import type { MonitorStatus } from "./data";

// The 4 monitor types the client-facing dashboard shows. Warmup and inbox
// placement aren't wired up yet (no cron worker produces results for them),
// so surfacing them here would just be permanent "No data" clutter.
export const PORTAL_MONITOR_TYPES = ["spf", "dkim", "dmarc", "domain_reputation"] as const;
export type PortalMonitorType = (typeof PORTAL_MONITOR_TYPES)[number];

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

export type PortalDomain = {
  id: string;
  domainName: string;
  isVerified: boolean;
  verificationToken: string;
};

export async function getMyDomains(): Promise<PortalDomain[]> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // RLS ("clients can read own domains") scopes this to the caller's
  // client — no explicit client_id filter needed here.
  const { data, error } = await supabase
    .from("domains")
    .select("id, domain_name, is_verified, verification_token")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    domainName: d.domain_name,
    isVerified: d.is_verified,
    verificationToken: d.verification_token,
  }));
}

export type PortalDomainStatus = {
  domainId: string;
  domainName: string;
  openAlertCount: number;
  lastCheckedAt: string | null;
  statuses: Record<PortalMonitorType, MonitorStatus>;
};

export async function getMyDomainStatuses(): Promise<PortalDomainStatus[]> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // RLS ("clients can read own domains") scopes this to the caller's
  // client, same as getMyDomains.
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
    resultsByDomain.get(row.domain_id)!.set(row.monitor_type, row);
  }

  return domains.map((domain) => {
    const domainResults = resultsByDomain.get(domain.id);
    const statuses = {} as Record<PortalMonitorType, MonitorStatus>;
    let lastCheckedAt: string | null = null;

    for (const monitorType of PORTAL_MONITOR_TYPES) {
      const result = domainResults?.get(monitorType);
      statuses[monitorType] = (result?.status as MonitorStatus) ?? "no_data";
      if (result?.checked_at && (!lastCheckedAt || result.checked_at > lastCheckedAt)) {
        lastCheckedAt = result.checked_at;
      }
    }

    return {
      domainId: domain.id,
      domainName: domain.domain_name,
      openAlertCount: openAlertCounts.get(domain.id) ?? 0,
      lastCheckedAt,
      statuses,
    };
  });
}
