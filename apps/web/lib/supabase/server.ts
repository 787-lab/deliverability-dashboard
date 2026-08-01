import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client that reads the logged-in user's session from cookies —
// distinct from lib/supabase.ts, which uses the service role key and bypasses
// auth entirely for the admin dashboard. Use this one for anything under
// /portal, where requests should only see what that specific client owns.
export async function getServerSupabaseForUser() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies — the
          // middleware (middleware.ts) handles refreshing the session instead.
        }
      },
    },
  });
}
