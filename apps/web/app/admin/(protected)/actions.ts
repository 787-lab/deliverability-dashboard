"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

export type AdminAddDomainResult = { ok: true } | { ok: false; error: string };

const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export async function adminAddDomain(clientId: string, domainNameInput: string): Promise<AdminAddDomainResult> {
  // Server Actions are network-callable regardless of which page renders the
  // button — the /admin layout gate doesn't protect this by itself, so the
  // admin check has to happen here too.
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false, error: "Not authorized." };
  }

  if (!clientId) {
    return { ok: false, error: "Select a client." };
  }

  const domainName = domainNameInput.trim().toLowerCase();
  if (!DOMAIN_PATTERN.test(domainName)) {
    return { ok: false, error: "Enter a valid domain name, e.g. mail.client.com" };
  }

  const admin = getServerSupabase();
  const { error } = await admin.from("domains").insert({
    client_id: clientId,
    domain_name: domainName,
    is_verified: true,
    verified_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "This domain is already connected for that client." };
    }
    return { ok: false, error: "Could not add domain. Please try again." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
