import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { ArrowIcon, BellIcon, CheckIcon, ClockIcon, GlobeIcon, PulseIcon, ShieldIcon } from "@/components/Icons";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

const monitors = [
  { label: "SPF", title: "SPF validation", copy: "Record validity and RFC 10-lookup limit monitored continuously.", icon: ShieldIcon },
  { label: "DKIM", title: "DKIM integrity", copy: "Selector availability, signature health and key strength checks.", icon: CheckIcon },
  { label: "DMARC", title: "DMARC policy", copy: "Policy, alignment and reporting configuration tracked over time.", icon: PulseIcon },
  { label: "RBL", title: "Reputation watch", copy: "Blacklist monitoring across the reputation sources that matter.", icon: GlobeIcon },
];

export default async function HomePage() {
  const supabase = await getServerSupabaseForUser();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(user.email === process.env.ADMIN_EMAIL ? "/admin" : "/portal");

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <header className="relative z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Main navigation">
            <a href="#monitoring" className="transition-colors hover:text-foreground">Monitoring</a>
            <a href="#workflow" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          </nav>
          <Link href="/portal/login" className="secondary-button">Client login <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </header>

      <main>
        <section className="relative border-b border-border bg-[radial-gradient(circle_at_78%_28%,#d9edff_0,transparent_28%),linear-gradient(180deg,#fff_0%,#f5f9fe_100%)]">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(#b8cbe0_1px,transparent_1px),linear-gradient(90deg,#b8cbe0_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-accent shadow-sm">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"/><span className="relative h-2 w-2 rounded-full bg-emerald-500"/></span>
                Continuous infrastructure monitoring
              </div>
              <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,4.9rem)] font-bold leading-[.98] tracking-[-.06em] text-navy">
                Protect your sender reputation <span className="text-accent">before it slips.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
                advazon. monitors the DNS and reputation signals behind your outbound email, then alerts you the moment something needs attention.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/portal/login" className="primary-button px-5 py-3.5">Open client portal <ArrowIcon className="h-4 w-4" /></Link>
                <a href="#monitoring" className="secondary-button px-5 py-3.5">Explore monitoring</a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
                {['No credit card', 'Secure client access', 'Actionable alerts'].map(item => <span key={item} className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-600" />{item}</span>)}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -inset-8 rounded-full bg-blue-200/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_28px_80px_rgba(19,48,86,.16)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div><p className="text-xs font-semibold text-foreground">Domain health</p><p className="mt-0.5 text-[11px] text-subtle">mail.example.com</p></div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Healthy</span>
                </div>
                <div className="grid grid-cols-3 border-b border-border">
                  {[['96','Health score'],['4','Active monitors'],['0','Open alerts']].map(([value,label],i)=><div key={label} className={`p-5 ${i<2?'border-r border-border':''}`}><p className="text-2xl font-bold tracking-tight text-foreground">{value}{i===0&&<span className="text-sm text-subtle">%</span>}</p><p className="mt-1 text-[11px] text-subtle">{label}</p></div>)}
                </div>
                <div className="space-y-3 p-5">
                  {[['SPF record','Passing','8 / 10 lookups'],['DKIM signature','Passing','2048-bit key'],['DMARC policy','Protected','p=quarantine'],['Domain reputation','Clean','0 blacklist hits']].map(([name,status,detail])=><div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/70 p-3.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CheckIcon className="h-4 w-4"/></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{name}</p><p className="mt-0.5 text-[11px] text-subtle">{detail}</p></div><span className="text-[11px] font-semibold text-emerald-700">{status}</span></div>)}
                </div>
                <div className="flex items-center gap-2 border-t border-border bg-slate-50 px-5 py-3 text-[11px] text-subtle"><ClockIcon className="h-3.5 w-3.5"/>Last checked 4 minutes ago</div>
              </div>
            </div>
          </div>
        </section>

        <section id="monitoring" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl"><p className="eyebrow">Monitoring layer</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em] text-foreground sm:text-4xl">The signals that decide whether email reaches the inbox.</h2><p className="mt-4 text-base leading-7 text-muted">One clear view across the core authentication and reputation controls behind every sending domain.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {monitors.map(({label,title,copy,icon:MonitorIcon})=><article key={label} className="group rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"><MonitorIcon className="h-5 w-5"/></span><span className="font-mono text-[10px] font-semibold tracking-widest text-subtle">{label}</span></div><h3 className="mt-6 text-base font-bold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{copy}</p></article>)}
          </div>
        </section>

        <section id="workflow" className="border-y border-border bg-navy text-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Simple workflow</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl">From domain connection to actionable alert.</h2><p className="mt-5 max-w-lg leading-7 text-slate-300">The dashboard turns technical checks into a clear priority list, so your team knows what changed and what to fix first.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[['01','Connect','Add a sending domain and verify ownership with one DNS record.'],['02','Monitor','Workers check authentication and reputation on schedule.'],['03','Act','Critical changes appear in your portal and arrive by email.']].map(([number,title,copy])=><div key={number} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><span className="font-mono text-xs font-semibold text-blue-300">{number}</span><h3 className="mt-8 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p></div>)}
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[{icon:ShieldIcon,title:'Tenant-safe access',copy:'Supabase Auth and row-level policies keep each client restricted to their own domains.'},{icon:BellIcon,title:'Severity-first alerts',copy:'Warnings and critical incidents stay visible until the underlying issue is resolved.'},{icon:PulseIcon,title:'Built for continuity',copy:'Scheduled Railway workers and persistent history make monitoring independent from browser sessions.'}].map(({icon:InfoIcon,title,copy})=><div key={title} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><InfoIcon className="h-5 w-5"/></span><div><h3 className="font-semibold text-foreground">{title}</h3><p className="mt-1.5 text-sm leading-6 text-muted">{copy}</p></div></div>)}
        </section>
      </main>

      <footer className="border-t border-border bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Brand/><p className="text-xs text-subtle">© {new Date().getFullYear()} advazon. Professional deliverability monitoring.</p></div>
      </footer>
    </div>
  );
}
