"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (cookie-backed via @supabase/ssr).
 *
 * Used only where we genuinely need client-side Supabase: interactive auth
 * (login/signup/logout with a file upload) and client-side auth state.
 * All read-heavy data access happens on the server instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
