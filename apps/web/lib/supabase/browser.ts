import { createBrowserClient } from "@supabase/ssr";

// Uses the anon key — safe for the browser. Row-level security (once wired
// up) is what actually restricts what a logged-in client can read/write.
export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
