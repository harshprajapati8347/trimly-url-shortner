"use client";

import {
  APP_URL,
  GUEST_CLICKS_KEY,
  GUEST_LINK_LIMIT,
  GUEST_URLS_KEY,
} from "@/lib/constants";
import { generateShortCode } from "@/lib/links";
import type { ClickRecord, UrlRecord } from "@/lib/types";
import type { CreateLinkInput } from "@/lib/validations";

/**
 * Guest data store — everything here is browser-local (localStorage) and is
 * NEVER persisted to Supabase. This preserves the original app's "try without
 * signup" experience while keeping anonymous data off our servers.
 */

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function guestQr(slug: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `${APP_URL}/${slug}`
  )}`;
}

export function getGuestUrls(): UrlRecord[] {
  return read<UrlRecord>(GUEST_URLS_KEY);
}

export function getGuestUrl(id: string): UrlRecord | null {
  return getGuestUrls().find((u) => String(u.id) === String(id)) ?? null;
}

export function createGuestUrl(input: CreateLinkInput): UrlRecord {
  const urls = getGuestUrls();
  if (urls.length >= GUEST_LINK_LIMIT) {
    throw new Error(
      `Guests can only create up to ${GUEST_LINK_LIMIT} links. Create an account for more.`
    );
  }
  const shortUrl = generateShortCode();
  const slug = input.customUrl || shortUrl;
  const record: UrlRecord = {
    id: generateShortCode() + generateShortCode(),
    title: input.title,
    user_id: null,
    original_url: input.longUrl,
    custom_url: input.customUrl || null,
    short_url: shortUrl,
    qr: guestQr(slug),
    created_at: new Date().toISOString(),
  };
  write(GUEST_URLS_KEY, [record, ...urls]);
  return record;
}

export function deleteGuestUrl(id: string) {
  write(
    GUEST_URLS_KEY,
    getGuestUrls().filter((u) => String(u.id) !== String(id))
  );
}

export function resolveGuestSlug(slug: string): UrlRecord | null {
  return (
    getGuestUrls().find(
      (u) => u.short_url === slug || u.custom_url === slug
    ) ?? null
  );
}

export function getGuestClicks(): ClickRecord[] {
  return read<ClickRecord>(GUEST_CLICKS_KEY);
}

export function getGuestClicksForUrl(urlId: string): ClickRecord[] {
  return getGuestClicks().filter((c) => String(c.url_id) === String(urlId));
}

export function addGuestClick(
  urlId: string,
  data: { city?: string; country?: string; device?: string }
) {
  const clicks = getGuestClicks();
  const click: ClickRecord = {
    id: generateShortCode() + generateShortCode(),
    url_id: urlId,
    city: data.city ?? "Unknown",
    country: data.country ?? "Unknown",
    device: data.device ?? "desktop",
    created_at: new Date().toISOString(),
  };
  write(GUEST_CLICKS_KEY, [click, ...clicks]);
}
