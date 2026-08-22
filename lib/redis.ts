import { Redis } from "@upstash/redis";
import { slugCacheKey, SLUG_CACHE_TTL } from "@/lib/constants";
import type { CachedLink } from "@/lib/types";

/**
 * Upstash Redis singleton (REST-based → works in both the Edge and Node.js
 * runtimes, unlike a raw TCP redis client).
 *
 * If the env vars are absent (e.g. a fresh clone that hasn't set up Upstash yet)
 * we return `null` and every caller degrades gracefully to hitting Supabase
 * directly. This keeps the app runnable before Redis is configured.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  if (!client) {
    console.warn(
      "[redis] UPSTASH_REDIS_REST_URL/TOKEN not set — caching & rate limiting disabled."
    );
  }
  return client;
}

/** Read-through cache read: slug -> destination link. */
export async function getCachedLink(slug: string): Promise<CachedLink | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<CachedLink>(slugCacheKey(slug));
  } catch (err) {
    console.error("[redis] getCachedLink failed:", err);
    return null;
  }
}

/** Populate/refresh the slug cache. */
export async function setCachedLink(
  slug: string,
  link: CachedLink
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(slugCacheKey(slug), link, { ex: SLUG_CACHE_TTL });
  } catch (err) {
    console.error("[redis] setCachedLink failed:", err);
  }
}

/** Invalidate one or more slugs (called on create/update/delete). */
export async function invalidateLink(...slugs: (string | null | undefined)[]) {
  const redis = getRedis();
  if (!redis) return;
  const keys = slugs.filter(Boolean).map((s) => slugCacheKey(s as string));
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("[redis] invalidateLink failed:", err);
  }
}
