import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

/**
 * Rate limiters built on the shared Upstash Redis instance.
 *
 * We lazily construct one limiter per "bucket" and reuse it (Ratelimit keeps an
 * in-memory cache to avoid hammering Redis). If Redis isn't configured, the
 * helpers below fail open (allow the request) so local dev keeps working.
 */
const limiters = new Map<string, Ratelimit>();

type Bucket = "create" | "redirect";

function getLimiter(bucket: Bucket): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const existing = limiters.get(bucket);
  if (existing) return existing;

  const config: Record<Bucket, Ratelimit> = {
    // Creating links is expensive-ish (DB write + cache) → keep it modest.
    create: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "trimly:rl:create",
      analytics: true,
    }),
    // Redirects are hot but should still be abuse-protected per identifier.
    redirect: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "10 s"),
      prefix: "trimly:rl:redirect",
      analytics: true,
    }),
  };

  const limiter = config[bucket];
  limiters.set(bucket, limiter);
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  /** seconds the caller should wait before retrying (for Retry-After) */
  retryAfter: number;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check a rate limit. `identifier` is typically an IP address or `user:<id>`.
 * Fails open (success:true) when Redis is unavailable.
 */
export async function checkRateLimit(
  bucket: Bucket,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(bucket);
  if (!limiter) {
    return { success: true, retryAfter: 0, limit: 0, remaining: 0, reset: 0 };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return { success, retryAfter, limit, remaining, reset };
}

/** Build a standard 429 response with the correct headers. */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}
