"use server";

import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase";
import { getServerSupabaseForUser } from "@/lib/supabase/server";
import { verificationTxtRecord } from "@/lib/domain-verification";

export type CreateMyClientResult = { ok: true } | { ok: false; error: string };

export async function createMyClient(nameInput: string): Promise<CreateMyClientResult> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const name = nameInput.trim();
  if (!name) {
    return { ok: false, error: "Enter your company name." };
  }

  // There's no RLS insert policy on clients at all — creating a client is
  // sensitive enough that it should only happen through server-validated
  // paths like this one, not be open to whatever an authenticated session
  // could construct. Goes through the admin connection instead; user_id's
  // unique constraint (0004) still stops one login from ending up with two
  // client rows if this ever runs twice.
  const admin = getServerSupabase();
  const { error } = await admin.from("clients").insert({ name, contact_email: user.email, user_id: user.id });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "An account is already linked to this login." };
    }
    return { ok: false, error: "Could not create your account. Please try again." };
  }

  revalidatePath("/portal");
  return { ok: true };
}

export type AddDomainResult =
  | { ok: true; domainId: string; domainName: string; verificationToken: string }
  | { ok: false; error: string };

const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export async function addDomain(domainNameInput: string): Promise<AddDomainResult> {
  const domainName = domainNameInput.trim().toLowerCase();

  if (!DOMAIN_PATTERN.test(domainName)) {
    return { ok: false, error: "Enter a valid domain name, e.g. mail.yourcompany.com" };
  }

  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError) {
    return { ok: false, error: "Could not look up your account." };
  }
  if (!client) {
    return { ok: false, error: "Your login isn't linked to a client account yet. Contact Advazon." };
  }

  const { data: domain, error: insertError } = await supabase
    .from("domains")
    .insert({ client_id: client.id, domain_name: domainName })
    .select("id, domain_name, verification_token")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "This domain is already connected to your account." };
    }
    return { ok: false, error: "Could not add domain. Please try again." };
  }

  revalidatePath("/portal");

  return {
    ok: true,
    domainId: domain.id,
    domainName: domain.domain_name,
    verificationToken: domain.verification_token,
  };
}

export type VerifyDomainResult =
  | { ok: true; verified: true }
  | { ok: true; verified: false; reason: string }
  | { ok: false; error: string };

export async function verifyDomain(domainId: string): Promise<VerifyDomainResult> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  // RLS scopes this to domains the caller's client owns — a stranger's
  // domain ID just comes back null, same as "not found."
  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("id, domain_name, verification_token, is_verified")
    .eq("id", domainId)
    .maybeSingle();

  if (domainError) {
    return { ok: false, error: "Could not look up domain." };
  }
  if (!domain) {
    return { ok: false, error: "Domain not found." };
  }
  if (domain.is_verified) {
    return { ok: true, verified: true };
  }

  const { host, value } = verificationTxtRecord(domain.domain_name, domain.verification_token);

  let records: string[][] = [];
  try {
    records = await resolveTxt(host);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOTFOUND" && code !== "ENODATA") {
      return { ok: false, error: "DNS lookup failed. Please try again." };
    }
    // No TXT record there yet — falls through to the "not verified" reply below.
  }

  const found = records.some((chunks) => chunks.join("").trim() === value);

  if (!found) {
    return {
      ok: true,
      verified: false,
      reason: "TXT record not found yet. DNS changes can take a few hours to propagate.",
    };
  }

  // Write with the admin connection, not the caller's session — is_verified
  // must only ever flip because we independently confirmed DNS above, never
  // because a client wrote it themselves.
  const admin = getServerSupabase();
  const { error: updateError } = await admin
    .from("domains")
    .update({ is_verified: true, verified_at: new Date().toISOString() })
    .eq("id", domain.id);

  if (updateError) {
    return { ok: false, error: "Verified DNS but failed to save. Please try again." };
  }

  revalidatePath("/portal");

  return { ok: true, verified: true };
}
