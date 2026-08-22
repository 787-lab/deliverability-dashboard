"use client";

import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="secondary-button !py-2"
    >
      Sign out
    </button>
  );
}
