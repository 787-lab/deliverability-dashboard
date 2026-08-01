import Link from "next/link";
import { notFound } from "next/navigation";
import { getDomainDetail, MonitorType } from "@/lib/data";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";

const MONITOR_LABELS: Record<MonitorType, string> = {
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
  domain_reputation: "Domain Reputation",
  warmup: "Warmup",
  inbox_placement: "Inbox Placement",
};

function formatDate(iso: string | null) {
  if (!iso) return <span className="text-subtle">—</span>;
  return new Date(iso).toLocaleString();
}

function DetailLines({
  monitorType,
  details,
  score,
}: {
  monitorType: MonitorType;
  details: Record<string, unknown>;
  score: number | null;
}) {
  const lines: { label: string; value: string }[] = [];

  if (monitorType === "spf") {
    if (details.record) lines.push({ label: "Record", value: String(details.record) });
    if (details.lookup_count !== undefined)
      lines.push({ label: "DNS lookups", value: `${details.lookup_count} / 10` });
  } else if (monitorType === "dmarc") {
    if (details.policy) lines.push({ label: "Policy", value: String(details.policy) });
    if (details.subdomain_policy)
      lines.push({ label: "Subdomain policy", value: String(details.subdomain_policy) });
    if (details.pct !== undefined) lines.push({ label: "Enforcement", value: `${details.pct}%` });
    const rua = details.rua as string[] | undefined;
    if (rua?.length) lines.push({ label: "Aggregate reports (rua)", value: rua.join(", ") });
    const ruf = details.ruf as string[] | undefined;
    if (ruf?.length) lines.push({ label: "Forensic reports (ruf)", value: ruf.join(", ") });
  } else if (monitorType === "dkim") {
    if (score !== null) lines.push({ label: "Key strength", value: `${score}-bit` });
  } else if (monitorType === "domain_reputation") {
    const listedOn = details.listed_on as string[] | undefined;
    lines.push({
      label: "Blacklist status",
      value: listedOn?.length ? `Listed on ${listedOn.join(", ")}` : "Not listed on any checked blacklist",
    });
  }

  const errors = details.errors as string[] | undefined;
  if (errors?.length) lines.push({ label: "Notes", value: errors.join("; ") });

  if (lines.length === 0)
    return (
      <div className="rounded-md border border-dashed border-border-strong bg-background px-3 py-2.5 text-xs text-subtle">
        No data yet
      </div>
    );

  return (
    <dl className="space-y-1.5">
      {lines.map((line) => (
        <div key={line.label} className="text-sm">
          <dt className="inline text-subtle">{line.label}: </dt>
          <dd className="inline break-all font-mono text-xs text-muted">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  const domain = await getDomainDetail(domainId);

  if (!domain) notFound();

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" strokeWidth={2}>
          <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Status
      </Link>

      <div className="mt-3 mb-8">
        <h1 className="text-xl font-semibold text-foreground">{domain.domainName}</h1>
        <p className="mt-1 text-sm text-muted">{domain.clientName}</p>
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Monitor Details</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {domain.checks.map((check) => (
          <div key={check.monitorType} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{MONITOR_LABELS[check.monitorType]}</span>
              <StatusBadge status={check.status} />
            </div>
            <DetailLines monitorType={check.monitorType} details={check.details} score={check.score} />
            <p className="mt-3 border-t border-border pt-2.5 text-xs text-subtle">
              Checked: {formatDate(check.checkedAt)}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Alert History</h2>
      {domain.alerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center text-sm text-subtle">
          No alerts for this domain.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-xs font-medium uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">Severity</th>
                  <th className="px-5 py-3 font-medium">Monitor</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Opened</th>
                  <th className="px-5 py-3 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {domain.alerts.map((alert) => (
                  <tr key={alert.id} className="align-top transition-colors hover:bg-background">
                    <td className="px-5 py-3.5">
                      <SeverityBadge severity={alert.severity} />
                    </td>
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
