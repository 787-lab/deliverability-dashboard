import { getMyDomainStatuses } from "@/lib/portal-data";
import { MONITOR_TYPES, MONITOR_LABELS } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckNowButton } from "./CheckNowButton";

export async function DomainStatusSection() {
  const domains = await getMyDomainStatuses();

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-8 py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-background text-subtle">
          —
        </div>
        <p className="text-sm font-medium text-foreground">No domains yet</p>
        <p className="mt-1 text-sm text-subtle">Add one below to start monitoring it.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-xs font-medium uppercase tracking-wide text-subtle">
              <th className="px-5 py-3 font-medium">Domain</th>
              {MONITOR_TYPES.map((monitorType) => (
                <th key={monitorType} className="px-5 py-3 font-medium">
                  {MONITOR_LABELS[monitorType]}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">Open Alerts</th>
              <th className="px-5 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {domains.map((domain) => (
              <tr key={domain.domainId} className="transition-colors hover:bg-background">
                <td className="px-5 py-3.5 font-medium text-foreground">{domain.domainName}</td>
                {MONITOR_TYPES.map((monitorType) => (
                  <td key={monitorType} className="px-5 py-3.5">
                    <StatusBadge status={domain.statuses[monitorType]} />
                  </td>
                ))}
                <td className="px-5 py-3.5 text-right">
                  {domain.openAlertCount > 0 ? (
                    <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      {domain.openAlertCount}
                    </span>
                  ) : (
                    <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-background px-2 py-0.5 text-xs font-medium text-subtle">
                      0
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <CheckNowButton domainId={domain.domainId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
