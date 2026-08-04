import { redirect } from "next/navigation";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { getMyClient } from "@/lib/portal-data";
import { SignOutButton } from "./SignOutButton";
import { AddDomainForm } from "./AddDomainForm";
import { DomainList } from "./DomainList";
import { OnboardingForm } from "./OnboardingForm";

export default async function PortalHome() {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const client = await getMyClient();

  if (!client) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <OnboardingForm />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-md space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">Welcome</h1>
        <p className="mb-4 text-sm text-muted">Logged in as {user.email}</p>
        <SignOutButton />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Your domains</h2>
        <DomainList />
      </div>

      <AddDomainForm />
    </div>
  );
}
