/**
 * Shared domain types for Trimly.
 * These mirror the Supabase `urls` and `clicks` tables and are reused across
 * Server Components, Route Handlers and Server Actions.
 */

export interface UrlRecord {
  id: string;
  title: string;
  /** null for guest/anonymous links (which never actually reach the DB) */
  user_id: string | null;
  original_url: string;
  /** optional user-chosen vanity slug */
  custom_url: string | null;
  /** auto-generated 6-char slug */
  short_url: string;
  /** URL to a QR code image */
  qr: string;
  created_at: string;
}

export interface ClickRecord {
  id: string;
  url_id: string;
  city: string | null;
  country: string | null;
  device: string | null;
  created_at: string;
}

/** Payload written to the async click-tracking endpoint. */
export interface ClickEventInput {
  url_id: string;
  city?: string | null;
  country?: string | null;
  device?: string | null;
}

/** Minimal shape cached in Redis for a slug -> destination lookup. */
export interface CachedLink {
  id: string;
  original_url: string;
}

/** Standard error envelope returned by Route Handlers. */
export interface ApiError {
  error: string;
}

/** Serializable, client-safe subset of the Supabase auth user. */
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}
