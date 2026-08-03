import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

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

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold text-foreground">Know before your emails do.</h1>
          <p className="mt-4 text-base text-muted">
            Continuous SPF, DKIM, DMARC, and domain reputation monitoring for your sending domains —
            catch deliverability problems before they hit the inbox.
          </p>
          <Link
            href="/portal/login"
            className="mt-8 inline-block rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Sign up / Login
          </Link>
        </div>
      </main>
    </div>
  );
}
