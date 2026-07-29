import { getAlerts } from "@/lib/data";
import { SeverityBadge } from "@/components/StatusBadge";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No alerts yet.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Alert History</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Monitor</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Opened</th>
              <th className="px-4 py-3">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id} className="border-b border-gray-100 last:border-0 align-top">
                <td className="px-4 py-3">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-4 py-3 text-gray-700">{alert.clientName}</td>
                <td className="px-4 py-3 font-medium">{alert.domainName}</td>
                <td className="px-4 py-3 uppercase text-gray-500">{alert.monitorType}</td>
                <td className="px-4 py-3 text-gray-700">{alert.message}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{alert.status}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(alert.createdAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(alert.resolvedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
