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
      <div className="mx-auto mt-12 max-w-lg">
        <OnboardingForm />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Client workspace</p><h1 className="page-title mt-2">{client.name}</h1><p className="mt-2 text-sm text-muted">Live health for your sending infrastructure.</p></div>
        <div className="flex items-center gap-3"><span className="hidden text-xs text-subtle sm:block">{user.email}</span><SignOutButton /></div>
      </div>
      <DomainStatusSection />
      <div className="max-w-2xl">
        <AddDomainForm />
      </div>
    </div>
  );
}
