import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { getMyClient, getMyDomainStatuses, getMyOpenAlerts } from "@/lib/portal-data";
import { MONITOR_TYPES } from "@/lib/data";
import { calculateHealthScore } from "@/lib/monitoring";
import { BellIcon, CheckIcon, GlobeIcon, PulseIcon } from "@/components/Icons";
import { SeverityBadge } from "@/components/StatusBadge";
import { SignOutButton } from "./SignOutButton";
import { AddDomainForm } from "./AddDomainForm";
import { DomainStatusSection } from "./DomainStatusSection";
import { OnboardingForm } from "./OnboardingForm";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatMetricDate(iso: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}

function formatMetricTime(iso: string) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export default async function PortalHome() {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const [client, domains, openAlerts] = await Promise.all([
    getMyClient(),
    getMyDomainStatuses(),
    getMyOpenAlerts(),
  ]);

  if (!client) {
    return (
      <div className="mx-auto mt-12 max-w-lg">
        <OnboardingForm defaultName={typeof user.user_metadata.company_name === "string" ? user.user_metadata.company_name : ""} />
      </div>
    );
  }

  const checks = domains.flatMap((domain) => MONITOR_TYPES.map((type) => domain.statuses[type]));
  const healthScore = calculateHealthScore(checks);
  const monitoredChecks = checks.filter((check) => check.status !== "no_data").length;
  const passingChecks = checks.filter((check) => check.status === "pass").length;
  const latestCheck = checks
    .map((check) => check.checkedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  const metrics = [
    {
      label: "Health score",
      value: healthScore === null ? "—" : `${healthScore}%`,
      note: healthScore === null ? "Run the first domain check" : `${passingChecks} checks passing`,
      icon: PulseIcon,
      tone: "bg-accent-soft text-accent",
    },
    {
      label: "Monitored domains",
      value: String(domains.length),
      note: `${monitoredChecks} of ${checks.length} signals reporting`,
      icon: GlobeIcon,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Open alerts",
      value: String(openAlerts.length),
      note: openAlerts.length ? "Review the priority list" : "No active incidents",
      icon: BellIcon,
      tone: openAlerts.length ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Last checked",
      value: latestCheck ? formatMetricDate(latestCheck) : "Not yet",
      note: latestCheck ? `Updated at ${formatMetricTime(latestCheck)}` : "Monitoring is ready",
      icon: CheckIcon,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Client workspace</p><h1 className="page-title mt-2">{client.name}</h1><p className="mt-2 text-sm text-muted">Live health for your sending infrastructure.</p></div>
        <div className="flex items-center gap-3"><span className="hidden text-xs text-subtle sm:block">{user.email}</span><SignOutButton /></div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Account health summary">
        {metrics.map(({ label, value, note, icon: MetricIcon, tone }) => (
          <div key={label} className="app-card metric-card p-5">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-3 truncate text-2xl font-bold tracking-[-.04em] text-foreground">{value}</p><p className="mt-1.5 text-xs text-subtle">{note}</p></div>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><MetricIcon className="h-5 w-5" /></span>
            </div>
          </div>
        ))}
      </section>

      {openAlerts.length > 0 && (
        <section className="app-card overflow-hidden">
          <div className="border-b border-border px-5 py-4 sm:px-6"><h2 className="text-sm font-bold text-foreground">Priority issues</h2><p className="mt-1 text-xs text-subtle">Open incidents that may affect sending performance</p></div>
          <div className="divide-y divide-border">
            {openAlerts.slice(0, 6).map((alert) => (
              <Link key={alert.id} href={`/portal/domains/${alert.domainId}`} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-blue-50/30 sm:flex-row sm:items-center sm:px-6">
                <SeverityBadge severity={alert.severity} />
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{alert.domainName}</p><p className="mt-1 text-sm text-muted">{alert.message}</p></div>
                <span className="text-xs text-subtle">{formatDate(alert.createdAt)}</span>
              </Link>
            ))}
          </div>
          {openAlerts.length > 6 && <p className="border-t border-border px-5 py-3 text-xs text-subtle sm:px-6">Showing 6 of {openAlerts.length} open alerts.</p>}
        </section>
      )}

      <DomainStatusSection domains={domains} />
      <div className="max-w-2xl">
        <AddDomainForm />
      </div>
    </div>
  );
}
