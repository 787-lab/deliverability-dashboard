import { redirect } from "next/navigation";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { getMyClient } from "@/lib/portal-data";
import { SignOutButton } from "./SignOutButton";
import { AddDomainForm } from "./AddDomainForm";
import { DomainStatusSection } from "./DomainStatusSection";
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
    <div className="mx-auto mt-16 max-w-4xl space-y-6">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">Welcome</h1>
        <p className="mb-4 text-sm text-muted">Logged in as {user.email}</p>
        <SignOutButton />
      </div>

      <DomainStatusSection />

      <div className="mx-auto max-w-md">
        <AddDomainForm />
      </div>
    </div>
  );
}
