import { createAdminClient } from "@/lib/supabase/admin";
import { getCachedLink, setCachedLink } from "@/lib/redis";
import type { CachedLink } from "@/lib/types";

/**
 * Slug resolution used by the redirect path (middleware + guest fallback API).
 *
 * This module is intentionally free of `next/headers` so it stays usable from
 * the Edge middleware runtime. It only depends on Upstash Redis (REST) and the
 * service-role Supabase client, both of which run on the Edge.
 */

/** Generate a random 6-char base36 slug. */
export function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * Resolve a public slug (short_url or custom_url) to its destination.
 * Read-through cache: Redis first, then Supabase (and backfill the cache).
 */
export async function resolveSlug(slug: string): Promise<CachedLink | null> {
  const cached = await getCachedLink(slug);
  if (cached) return cached;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${slug},custom_url.eq.${slug}`)
    .maybeSingle();

  if (error) {
    console.error("[links] resolveSlug DB error:", error.message);
    return null;
  }
  if (!data) return null;

  const link: CachedLink = { id: data.id, original_url: data.original_url };
  await setCachedLink(slug, link);
  return link;
}
