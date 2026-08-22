import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getCurrentUser } from "@/lib/auth";
import { getClicksForUrls, getUrlsForUser } from "@/lib/data/urls";
import type { ClickRecord, UrlRecord } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Server-fetch read-heavy data for authed users. Guests get empty arrays and
  // hydrate from localStorage on the client.
  let urls: UrlRecord[] = [];
  let clicks: ClickRecord[] = [];
  if (user) {
    urls = await getUrlsForUser(user.id);
    clicks = await getClicksForUrls(urls.map((u) => u.id));
  }

  return (
    <Suspense>
      <DashboardClient user={user} initialUrls={urls} initialClicks={clicks} />
    </Suspense>
  );
}
