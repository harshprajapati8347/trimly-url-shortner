import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client (SERVER ONLY).
 *
 * Bypasses Row Level Security — used for operations that must not depend on the
 * caller's session, e.g. resolving a public short link to its destination and
 * writing anonymous click events during a redirect.
 *
 * NEVER import this from a client component. The service role key is only ever
 * read from a non-`NEXT_PUBLIC_` env var so it can't leak to the browser bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
