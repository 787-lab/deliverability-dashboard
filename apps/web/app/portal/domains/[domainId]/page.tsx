import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowIcon, CheckIcon, ClockIcon, PulseIcon, ShieldIcon } from "@/components/Icons";
import { SeverityBadge, StatusBadge } from "@/components/StatusBadge";
import { MONITOR_LABELS, type MonitorType } from "@/lib/data";
import { calculateHealthScore, getMonitorRecommendation, MONITOR_DESCRIPTIONS } from "@/lib/monitoring";
import { getMyDomainDetail } from "@/lib/portal-data";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { CheckNowButton } from "../../CheckNowButton";
import { PrintReportButton } from "../../PrintReportButton";

function formatDate(iso: string | null) {
  if (!iso) return "Not checked yet";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatMetricDate(iso: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}

function formatMetricTime(iso: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function DetailList({ monitorType, details, score }: { monitorType: MonitorType; details: Record<string, unknown>; score: number | null }) {
  const lines: { label: string; value: string }[] = [];

  if (monitorType === "spf") {
    if (details.record) lines.push({ label: "Published record", value: String(details.record) });
    if (details.lookup_count !== undefined) lines.push({ label: "DNS lookups", value: `${details.lookup_count} / 10` });
  }
  if (monitorType === "dkim") {
    if (details.selector) lines.push({ label: "Selector", value: String(details.selector) });
    if (score !== null) lines.push({ label: "Key strength", value: `${score}-bit` });
  }
  if (monitorType === "dmarc") {
    if (details.policy) lines.push({ label: "Policy", value: String(details.policy) });
    if (details.subdomain_policy) lines.push({ label: "Subdomain policy", value: String(details.subdomain_policy) });
    if (details.pct !== undefined) lines.push({ label: "Enforcement", value: `${details.pct}%` });
    const rua = Array.isArray(details.rua) ? details.rua.map(String) : [];
    if (rua.length) lines.push({ label: "Aggregate reports", value: rua.join(", ") });
  }
  if (monitorType === "domain_reputation") {
    const listedOn = Array.isArray(details.listed_on) ? details.listed_on.map(String) : [];
    lines.push({ label: "Blocklist status", value: listedOn.length ? listedOn.join(", ") : "Clear across checked sources" });
  }

  if (!lines.length) return <p className="text-sm text-subtle">No technical evidence is available yet.</p>;

  return (
    <dl className="space-y-2.5">
      {lines.map((line) => (
        <div key={line.label} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
          <dt className="text-xs font-medium text-subtle">{line.label}</dt>
          <dd className="break-all font-mono text-xs leading-5 text-muted">{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ClientDomainDetailPage({ params }: { params: Promise<{ domainId: string }> }) {
  const supabase = await getServerSupabaseForUser();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { domainId } = await params;
  const domain = await getMyDomainDetail(domainId);
  if (!domain) notFound();

  const healthScore = calculateHealthScore(domain.checks);
  const openAlerts = domain.alerts.filter((alert) => alert.status === "open");
  const reportingChecks = domain.checks.filter((check) => check.status !== "no_data").length;
  const lastChecked = domain.checks.map((check) => check.checkedAt).filter((date): date is string => Boolean(date)).sort().at(-1) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent">
            <span className="rotate-180"><ArrowIcon className="h-4 w-4" /></span> All domains
          </Link>
          <p className="eyebrow mt-6">Domain report</p>
          <h1 className="page-title mt-2 break-all">{domain.domainName}</h1>
          <p className="mt-2 text-sm text-muted">Current authentication, reputation, warmup, and placement signals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3"><PrintReportButton /><CheckNowButton domainId={domain.domainId} /></div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Domain health summary">
        {[
          { label: "Health score", value: healthScore === null ? "—" : `${healthScore}%`, note: "Based on reporting checks", icon: PulseIcon, tone: "bg-accent-soft text-accent" },
          { label: "Signal coverage", value: `${reportingChecks}/6`, note: "Monitoring sources reporting", icon: ShieldIcon, tone: "bg-cyan-50 text-cyan-700" },
          { label: "Open alerts", value: String(openAlerts.length), note: openAlerts.length ? "Action required" : "No active incidents", icon: CheckIcon, tone: openAlerts.length ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700" },
          { label: "Last checked", value: lastChecked ? formatMetricDate(lastChecked) : "Not yet", note: lastChecked ? `Updated at ${formatMetricTime(lastChecked)}` : "Run the first check", icon: ClockIcon, tone: "bg-indigo-50 text-indigo-700" },
        ].map(({ label, value, note, icon: MetricIcon, tone }) => (
          <div key={label} className="app-card metric-card p-5"><div className="relative z-10 flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-3 truncate text-2xl font-bold tracking-[-.04em] text-foreground">{value}</p><p className="mt-1.5 text-xs text-subtle">{note}</p></div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><MetricIcon className="h-5 w-5" /></span></div></div>
        ))}
      </section>

      <section>
        <div className="mb-4"><h2 className="text-base font-bold text-foreground">Monitoring evidence and next actions</h2><p className="mt-1 text-sm text-muted">Deterministic recommendations based on the latest worker result.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {domain.checks.map((check) => {
            const recommendation = getMonitorRecommendation(check);
            return (
              <article key={check.monitorType} className="app-card flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-foreground">{MONITOR_LABELS[check.monitorType]}</h3><p className="mt-1.5 text-sm leading-6 text-muted">{MONITOR_DESCRIPTIONS[check.monitorType]}</p></div><StatusBadge status={check.status} /></div>
                <div className="my-5 border-t border-border" />
                <DetailList monitorType={check.monitorType} details={check.details} score={check.score} />
                <div className={`mt-5 rounded-xl border p-4 ${check.status === "fail" ? "border-rose-200 bg-rose-50/70" : check.status === "warning" ? "border-amber-200 bg-amber-50/70" : "border-blue-100 bg-blue-50/60"}`}>
                  <p className="text-xs font-bold uppercase tracking-[.1em] text-foreground">{recommendation.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{recommendation.action}</p>
                </div>
                <p className="mt-auto pt-4 text-xs text-subtle">Last result: {formatDate(check.checkedAt)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 sm:px-6"><h2 className="text-sm font-bold text-foreground">Alert history</h2><p className="mt-1 text-xs text-subtle">Recorded incidents for this domain, newest first</p></div>
        {domain.alerts.length === 0 ? (
          <div className="px-6 py-12 text-center"><p className="text-sm font-semibold text-foreground">No alerts recorded</p><p className="mt-1 text-sm text-subtle">Incidents will appear here when a monitored signal changes.</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.11em] text-subtle"><th className="px-5 py-3">Severity</th><th className="px-5 py-3">Monitor</th><th className="px-5 py-3">Message</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Opened</th></tr></thead><tbody className="divide-y divide-border">{domain.alerts.map((alert) => <tr key={alert.id} className="align-top"><td className="px-5 py-4"><SeverityBadge severity={alert.severity} /></td><td className="px-5 py-4 font-medium uppercase text-muted">{alert.monitorType.replaceAll("_", " ")}</td><td className="px-5 py-4 text-muted">{alert.message}</td><td className="px-5 py-4 capitalize text-muted">{alert.status}</td><td className="px-5 py-4 whitespace-nowrap text-muted">{formatDate(alert.createdAt)}</td></tr>)}</tbody></table></div>
        )}
      </section>

      <footer className="hidden border-t border-border pt-5 text-xs text-subtle print:block">Generated by advazon. Deliverability on {formatDate(new Date().toISOString())}. Monitoring data is directional and should be reviewed alongside mailbox-provider and sending-platform data.</footer>
    </div>
  );
}
