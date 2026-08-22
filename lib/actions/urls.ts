"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { invalidateLink, setCachedLink } from "@/lib/redis";
import { generateShortCode } from "@/lib/links";
import { checkRateLimit } from "@/lib/ratelimit";
import { createLinkSchema } from "@/lib/validations";
import { APP_URL } from "@/lib/constants";

/**
 * Server Actions vs Route Handlers — the tradeoff:
 *  - We use Server Actions for these form-driven mutations (create/delete) that
 *    are always invoked from our own React UI. They give us progressive
 *    enhancement, typed inputs, and free CSRF protection with less boilerplate
 *    than a fetch()+Route Handler round-trip.
 *  - The REST-style Route Handler at /api/urls exists in parallel for
 *    programmatic/external callers (see app/api/urls/route.ts).
 */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; retryAfter?: number };

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "127.0.0.1"
  );
}

function buildQrUrl(slug: string): string {
  const target = `${APP_URL}/${slug}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    target
  )}`;
}

export async function createLinkAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  // 1. Validate
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { title, longUrl, customUrl } = parsed.data;

  // 2. Auth (guests never reach here — they persist to localStorage client-side)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to create links." };

  // 3. Rate limit per-user AND per-IP (defence in depth)
  const ip = await getClientIp();
  for (const id of [`user:${user.id}`, `ip:${ip}`]) {
    const rl = await checkRateLimit("create", id);
    if (!rl.success) {
      return {
        ok: false,
        error: "Too many links created. Please wait a moment.",
        retryAfter: rl.retryAfter,
      };
    }
  }

  // 4. Insert
  const shortUrl = generateShortCode();
  const slug = customUrl || shortUrl;
  const { data, error } = await supabase
    .from("urls")
    .insert({
      title,
      user_id: user.id,
      original_url: longUrl,
      custom_url: customUrl || null,
      short_url: shortUrl,
      qr: buildQrUrl(slug),
    })
    .select("id, original_url")
    .single();

  if (error) {
    // 23505 = unique violation (custom slug already taken)
    if (error.code === "23505") {
      return { ok: false, error: "That custom link is already taken." };
    }
    return { ok: false, error: error.message };
  }

  // 5. Warm the redirect cache so the new link is instantly fast
  await setCachedLink(slug, { id: data.id, original_url: data.original_url });
  if (customUrl && customUrl !== shortUrl) {
    await setCachedLink(shortUrl, { id: data.id, original_url: data.original_url });
  }

  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id } };
}

export async function deleteLinkAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  // Grab slugs first so we can invalidate the redirect cache afterwards.
  const { data: existing } = await supabase
    .from("urls")
    .select("short_url, custom_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("urls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Unable to delete link." };

  await invalidateLink(existing?.short_url, existing?.custom_url);
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}
