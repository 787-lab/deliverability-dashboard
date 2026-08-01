import { redirect } from "next/navigation";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export default async function PortalHome() {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="mb-2 text-lg font-semibold text-foreground">Welcome</h1>
      <p className="mb-4 text-sm text-muted">Logged in as {user.email}</p>
      <SignOutButton />
    </div>
  );
}
