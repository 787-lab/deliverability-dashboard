import Link from "next/link";
import { BellIcon, CheckIcon, GlobeIcon, PulseIcon, ShieldIcon } from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { getDomainStatuses, MONITOR_LABELS, MONITOR_TYPES } from "@/lib/data";
import { CheckNowButton } from "./CheckNowButton";
import { DeleteDomainButton } from "./DeleteDomainButton";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const domains = await getDomainStatuses();
  const alertCount = domains.reduce((total, domain) => total + domain.openAlertCount, 0);
  const checks = domains.flatMap((domain) => MONITOR_TYPES.map((type) => domain.statuses[type].status));
  const passing = checks.filter((status) => status === "pass").length;
  const failing = checks.filter((status) => status === "fail" || status === "warning").length;
  const health = checks.length ? Math.round((passing / checks.length) * 100) : 0;

  const metrics = [
    { label: "Portfolio health", value: `${health}%`, note: `${passing} checks passing`, icon: PulseIcon, tone: "text-accent bg-accent-soft" },
    { label: "Monitored domains", value: String(domains.length), note: `${domains.filter(d => d.isActive).length} currently active`, icon: GlobeIcon, tone: "text-indigo-700 bg-indigo-50" },
    { label: "Open alerts", value: String(alertCount), note: alertCount ? "Requires review" : "No active incidents", icon: BellIcon, tone: alertCount ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50" },
    { label: "Checks at risk", value: String(failing), note: failing ? "Warning or failed" : "Infrastructure stable", icon: ShieldIcon, tone: failing ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Operations overview</p><h1 className="page-title mt-2 text-foreground">Deliverability control centre</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Live infrastructure health across every monitored client and sending domain.</p></div>
        <Link href="/admin/domains" className="primary-button">Manage domains <span aria-hidden="true">+</span></Link>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio metrics">
        {metrics.map(({label,value,note,icon:MetricIcon,tone})=><div key={label} className="app-card metric-card p-5"><div className="relative z-10 flex items-start justify-between"><div><p className="text-xs font-medium text-muted">{label}</p><p className="mt-3 text-3xl font-bold tracking-[-.04em] text-foreground">{value}</p><p className="mt-1.5 text-xs text-subtle">{note}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><MetricIcon className="h-5 w-5"/></span></div></div>)}
      </section>

      <section className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><div><h2 className="text-sm font-bold text-foreground">Domain health</h2><p className="mt-1 text-xs text-subtle">Current result from each monitoring worker</p></div><span className="hidden items-center gap-1.5 text-xs text-subtle sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Live status</span></div>
        {domains.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><GlobeIcon className="h-6 w-6"/></span><h3 className="mt-4 text-sm font-semibold text-foreground">No domains connected</h3><p className="mt-1 text-sm text-subtle">Add your first client domain to begin monitoring.</p><Link href="/admin/domains" className="primary-button mt-5">Add domain</Link></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead><tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.11em] text-subtle"><th className="px-6 py-3.5">Client / Domain</th>{MONITOR_TYPES.map(type=><th key={type} className="px-4 py-3.5">{MONITOR_LABELS[type]}</th>)}<th className="px-4 py-3.5 text-center">Alerts</th><th className="px-6 py-3.5 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {domains.map(domain=><tr key={domain.domainId} className="group transition-colors hover:bg-blue-50/30">
                  <td className="px-6 py-4"><Link href={`/admin/domains/${domain.domainId}`} className="block font-semibold text-foreground transition-colors hover:text-accent">{domain.domainName}</Link><span className="mt-1 block text-xs text-subtle">{domain.clientName}</span></td>
                  {MONITOR_TYPES.map(type=><td key={type} className="px-4 py-4"><StatusBadge status={domain.statuses[type].status}/></td>)}
                  <td className="px-4 py-4 text-center">{domain.openAlertCount ? <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-rose-50 px-2 text-xs font-bold text-rose-700">{domain.openAlertCount}</span> : <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckIcon className="h-3.5 w-3.5"/></span>}</td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><CheckNowButton domainId={domain.domainId}/><DeleteDomainButton domainId={domain.domainId} domainName={domain.domainName}/></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
