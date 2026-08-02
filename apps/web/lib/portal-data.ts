import { getServerSupabaseForUser } from "./supabase/server";

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
