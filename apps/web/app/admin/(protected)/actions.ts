"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server Actions are network-callable regardless of which page renders the
// button — the /admin layout gate doesn't protect these by itself, so every
// action here re-checks the admin email itself.
async function requireAdmin(): Promise<AdminActionResult> {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false, error: "Not authorized." };
  }
  return { ok: true };
}

export async function adminAddDomain(clientId: string, domainNameInput: string): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

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

export async function adminDeleteDomain(domainId: string): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  if (!domainId) {
    return { ok: false, error: "Missing domain." };
  }

  // check_results and alerts both cascade on domain deletion (0001_init_schema.sql),
  // so removing the domain row alone wipes its full history too.
  const admin = getServerSupabase();
  const { error } = await admin.from("domains").delete().eq("id", domainId);

  if (error) {
    return { ok: false, error: "Could not delete domain. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/domains");
  return { ok: true };
}

export async function adminAddClient(nameInput: string, contactEmailInput: string): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const name = nameInput.trim();
  if (!name) {
    return { ok: false, error: "Enter a client name." };
  }

  const contactEmail = contactEmailInput.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(contactEmail)) {
    return { ok: false, error: "Enter a valid contact email." };
  }

  const admin = getServerSupabase();
  const { error } = await admin.from("clients").insert({ name, contact_email: contactEmail });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A client with this contact email already exists." };
    }
    return { ok: false, error: "Could not add client. Please try again." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
