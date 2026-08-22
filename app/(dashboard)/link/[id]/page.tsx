import { notFound } from "next/navigation";
import { LinkDetail } from "@/components/dashboard/link-detail";
import { getCurrentUser } from "@/lib/auth";
import { getClicksForUrl, getUrlById } from "@/lib/data/urls";
import type { ClickRecord, UrlRecord } from "@/lib/types";

export default async function LinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Authenticated: fetch on the server. Guest: hand off to the client, which
  // reads the link + clicks from localStorage.
  let url: UrlRecord | null = null;
  let stats: ClickRecord[] = [];

  if (user) {
    url = await getUrlById(id, user.id);
    if (!url) notFound();
    stats = await getClicksForUrl(id);
  }

  return (
    <LinkDetail
      id={id}
      isGuest={!user}
      initialUrl={url}
      initialStats={stats}
    />
  );
}
