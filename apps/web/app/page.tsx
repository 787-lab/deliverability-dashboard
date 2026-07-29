import { getDomainStatuses, MONITOR_TYPES } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";

const MONITOR_LABELS: Record<(typeof MONITOR_TYPES)[number], string> = {
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
  domain_reputation: "Reputation",
  warmup: "Warmup",
  inbox_placement: "Inbox Placement",
};

export default async function StatusPage() {
  const domains = await getDomainStatuses();

  if (domains.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No domains yet. Add a client and domain in Supabase to see status here.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Domain Status</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Domain</th>
              {MONITOR_TYPES.map((monitorType) => (
                <th key={monitorType} className="px-4 py-3">
                  {MONITOR_LABELS[monitorType]}
                </th>
              ))}
              <th className="px-4 py-3">Open Alerts</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr key={domain.domainId} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-700">{domain.clientName}</td>
                <td className="px-4 py-3 font-medium">{domain.domainName}</td>
                {MONITOR_TYPES.map((monitorType) => (
                  <td key={monitorType} className="px-4 py-3">
                    <StatusBadge status={domain.statuses[monitorType].status} />
                  </td>
                ))}
                <td className="px-4 py-3">
                  {domain.openAlertCount > 0 ? (
                    <span className="font-medium text-red-700">{domain.openAlertCount}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
