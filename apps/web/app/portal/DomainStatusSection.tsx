import { getMyDomainStatuses } from "@/lib/portal-data";
import { MONITOR_TYPES, MONITOR_LABELS } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckNowButton } from "./CheckNowButton";

export async function DomainStatusSection() {
  const domains = await getMyDomainStatuses();

  if (domains.length === 0) {
    return (
      <div className="app-card flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">+</div>
        <p className="text-sm font-semibold text-foreground">No domains connected</p>
        <p className="mt-1 text-sm text-subtle">Add a sending domain below to start monitoring it.</p>
      </div>
    );
  }

  return (
    <section className="app-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><div><h2 className="text-sm font-bold text-foreground">Your domain health</h2><p className="mt-1 text-xs text-subtle">Latest checks across your monitored domains</p></div><span className="hidden items-center gap-1.5 text-xs text-subtle sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Live status</span></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.11em] text-subtle">
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
              <tr key={domain.domainId} className="transition-colors hover:bg-blue-50/30">
                <td className="px-5 py-4 font-semibold text-foreground">{domain.domainName}</td>
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
    </section>
  );
}
