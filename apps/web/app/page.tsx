import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

const FEATURES = [
  {
    title: "SPF",
    badge: "SP",
    description: "Validates your SPF record and flags it before you hit the 10 DNS-lookup limit.",
  },
  {
    title: "DKIM",
    badge: "DK",
    description: "Confirms your DKIM selector, signature, and key strength stay intact.",
  },
  {
    title: "DMARC",
    badge: "DM",
    description: "Tracks policy, alignment mode, and reporting addresses so spoofed mail gets caught.",
  },
  {
    title: "Domain Reputation",
    badge: "DR",
    description: "Watches major blacklists like Spamhaus and Barracuda for your sending domains.",
  },
];

const STEPS = [
  { title: "Add your domain", description: "From your portal, connect any sending domain in seconds." },
  {
    title: "Verify ownership",
    description: "Drop one TXT record at your DNS provider — we confirm it automatically.",
  },
  {
    title: "Get monitored",
    description: "Continuous checks run in the background, with alerts the moment something breaks.",
  },
];

const FAQS = [
  {
    question: "What exactly do you monitor?",
    answer:
      "SPF, DKIM, DMARC, and domain reputation (blacklist status) for every sending domain you connect, refreshed on a recurring schedule.",
  },
  {
    question: "How do I prove I own a domain?",
    answer:
      "Add the domain from your portal, then add the TXT record we give you at your DNS provider. Click Verify and we confirm it over DNS — no email or file upload needed.",
  },
  {
    question: "How am I notified when something breaks?",
    answer:
      "Alerts show up in your portal immediately and are also sent by email, with a severity level so you know what needs attention first.",
  },
  {
    question: "Can I monitor more than one domain?",
    answer: "Yes — connect as many sending domains as you need from your portal.",
  },
];

export default async function HomePage() {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(user.email === process.env.ADMIN_EMAIL ? "/admin" : "/portal");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">Advazon</div>
            <div className="text-[11px] font-medium tracking-wide text-subtle">DELIVERABILITY</div>
          </div>
        </div>
        <Link
          href="/portal/login"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Sign up / Login
        </Link>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center px-6 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold text-foreground">Know before your emails do.</h1>
          <p className="mt-4 max-w-xl text-base text-muted">
            Continuous SPF, DKIM, DMARC, and domain reputation monitoring for your sending domains — catch
            deliverability problems before they hit the inbox.
          </p>
          <Link
            href="/portal/login"
            className="mt-8 inline-block rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Sign up / Login
          </Link>
        </section>

        <section className="border-t border-border bg-surface px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-foreground">What we monitor</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-border bg-background p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent">
                    {feature.badge}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold text-foreground">How it works</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title}>
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-semibold text-foreground">Frequently asked questions</h2>
            <div className="mt-8 space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-border bg-background p-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-subtle">
        © {new Date().getFullYear()} Advazon. Deliverability monitoring for Advazon clients.
      </footer>
    </div>
  );
}
