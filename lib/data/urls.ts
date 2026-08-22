import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ClickRecord, UrlRecord } from "@/lib/types";

/**
 * Server-only read helpers for the dashboard & link-detail Server Components.
 * These run as the authenticated user (RLS-protected) via the cookie-bound
 * server client. Guest data lives in localStorage and is handled client-side.
 */

export async function getUrlsForUser(userId: string): Promise<UrlRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load URLs");
  return (data ?? []) as UrlRecord[];
}

export async function getUrlById(
  id: string,
  userId: string
): Promise<UrlRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Short URL not found");
  return (data as UrlRecord) ?? null;
}

export async function getClicksForUrls(
  urlIds: string[]
): Promise<ClickRecord[]> {
  if (!urlIds.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("[data] getClicksForUrls:", error.message);
    return [];
  }
  return (data ?? []) as ClickRecord[];
}

export async function getClicksForUrl(urlId: string): Promise<ClickRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", urlId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getClicksForUrl:", error.message);
    return [];
  }
  return (data ?? []) as ClickRecord[];
}
