import { getServerSupabaseForUser } from "./supabase/server";

export type MyClient = { id: string; name: string };

export async function getMyClient(): Promise<MyClient | null> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("clients").select("id, name").eq("user_id", user.id).maybeSingle();
  if (error) throw error;

  return data;
}

export type PortalDomain = {
  id: string;
  domainName: string;
  isVerified: boolean;
  verificationToken: string;
};

export async function getMyDomains(): Promise<PortalDomain[]> {
  const supabase = await getServerSupabaseForUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // RLS ("clients can read own domains") scopes this to the caller's
  // client — no explicit client_id filter needed here.
  const { data, error } = await supabase
    .from("domains")
    .select("id, domain_name, is_verified, verification_token")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    domainName: d.domain_name,
    isVerified: d.is_verified,
    verificationToken: d.verification_token,
  }));
}
