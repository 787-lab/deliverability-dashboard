import { getMyDomainStatuses, PORTAL_MONITOR_TYPES, type PortalMonitorType } from "@/lib/portal-data";
import { StatusBadge } from "@/components/StatusBadge";

const MONITOR_LABELS: Record<PortalMonitorType, string> = {
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
  domain_reputation: "Reputation",
};

function formatCheckedAt(iso: string | null) {
  if (!iso) return "Not checked yet";
  return new Date(iso).toLocaleString();
}

export async function DomainStatusSection() {
  const domains = await getMyDomainStatuses();

  if (domains.length === 0) {
    // AddDomainForm/DomainList already cover the empty state below.
    return null;
  }

  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Domain status</h2>
      <div className="space-y-4">
        {domains.map((domain) => (
          <div key={domain.domainId} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{domain.domainName}</span>
              {domain.openAlertCount > 0 ? (
                <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  {domain.openAlertCount} open alert{domain.openAlertCount === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-background px-2 py-0.5 text-xs font-medium text-subtle">
                  0 open alerts
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {PORTAL_MONITOR_TYPES.map((monitorType) => (
                <div key={monitorType} className="flex items-center gap-1.5">
                  <span className="text-xs text-subtle">{MONITOR_LABELS[monitorType]}</span>
                  <StatusBadge status={domain.statuses[monitorType]} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-subtle">Last checked: {formatCheckedAt(domain.lastCheckedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
