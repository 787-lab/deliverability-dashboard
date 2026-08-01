import { getAlerts } from "@/lib/data";
import { SeverityBadge } from "@/components/StatusBadge";

function formatDate(iso: string | null) {
  if (!iso) return <span className="text-subtle">—</span>;
  return new Date(iso).toLocaleString();
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Alert History</h1>
        <p className="mt-1 text-sm text-muted">Every threshold breach across monitored domains, newest first.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-8 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No alerts yet</p>
          <p className="mt-1 text-sm text-subtle">Alerts will show up here as soon as a monitor flags an issue.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-xs font-medium uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Severity</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">Monitor</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Opened</th>
                  <th className="px-5 py-3 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="align-top transition-colors hover:bg-background">
                    <td className="px-5 py-3.5">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">{alert.clientName}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{alert.domainName}</td>
                    <td className="px-5 py-3.5 uppercase text-subtle">{alert.monitorType}</td>
                    <td className="px-5 py-3.5 text-muted">{alert.message}</td>
                    <td className="px-5 py-3.5 capitalize text-muted">{alert.status}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">{formatDate(alert.createdAt)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">{formatDate(alert.resolvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
