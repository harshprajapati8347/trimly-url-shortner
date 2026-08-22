/** App-wide constants and env-derived config. */

/** Public base URL used to render short links (no trailing slash). */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Bare host (e.g. "trimly.iamharsh.in") shown in the create-link UI. */
export const APP_DOMAIN = APP_URL.replace(/^https?:\/\//, "");

/** Cookie that marks an anonymous "guest" session (readable server-side). */
export const GUEST_COOKIE = "trimly_guest";

/** localStorage keys for guest-only (non-persisted) data. */
export const GUEST_URLS_KEY = "guest_urls";
export const GUEST_CLICKS_KEY = "guest_clicks";

/** Max links a guest may create locally before being nudged to sign up. */
export const GUEST_LINK_LIMIT = 5;

/** Redis key builder for the slug -> destination cache. */
export const slugCacheKey = (slug: string) => `trimly:slug:${slug}`;

/** How long (seconds) a resolved slug stays cached. */
export const SLUG_CACHE_TTL = 60 * 60 * 24; // 24h
