import "server-only";

import { createClient } from "@supabase/supabase-js";

// Server-only: uses the service role key, which bypasses row-level security.
// Never import this file from a Client Component — the "server-only" import
// above makes the build fail if that happens by mistake.
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }

  return createClient(url, key);
}
