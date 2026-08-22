"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Link2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { CreateLink } from "@/components/dashboard/create-link";
import { LinkCard } from "@/components/dashboard/link-card";
import { deleteLinkAction } from "@/lib/actions/urls";
import {
  deleteGuestUrl,
  getGuestClicks,
  getGuestUrls,
} from "@/lib/guest-store";
import type { AuthUser, ClickRecord, UrlRecord } from "@/lib/types";

interface DashboardClientProps {
  user: AuthUser | null;
  initialUrls: UrlRecord[];
  initialClicks: ClickRecord[];
}

/**
 * Client shell for the dashboard.
 *  - Authenticated: seeded with server-fetched `initialUrls`/`initialClicks`
 *    (re-synced whenever the server re-renders after router.refresh()).
 *  - Guest: loads links/clicks from localStorage on mount.
 */
export function DashboardClient({
  user,
  initialUrls,
  initialClicks,
}: DashboardClientProps) {
  const router = useRouter();
  const isGuest = !user;
  const [urls, setUrls] = useState<UrlRecord[]>(initialUrls);
  const [clicks, setClicks] = useState<ClickRecord[]>(initialClicks);
  const [query, setQuery] = useState("");

  // Keep authed state in sync with fresh server props.
  useEffect(() => {
    if (!isGuest) {
      setUrls(initialUrls);
      setClicks(initialClicks);
    }
  }, [initialUrls, initialClicks, isGuest]);

  // Guests: hydrate from localStorage (data never leaves the browser).
  useEffect(() => {
    if (isGuest) {
      setUrls(getGuestUrls());
      setClicks(getGuestClicks());
    }
  }, [isGuest]);

  const handleDelete = async (id: string) => {
    if (isGuest) {
      deleteGuestUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      return;
    }
    const res = await deleteLinkAction(id);
    if (!res.ok) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    setUrls((prev) => prev.filter((u) => u.id !== id));
    router.refresh();
  };

  const filtered = urls.filter((u) =>
    u.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageContainer className="flex flex-col gap-8 py-10 w-full max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{urls.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clicks.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          My Links
        </h1>
        <CreateLink isGuest={isGuest} />
      </div>

      {urls.length > 0 ? (
        <div className="relative">
          <Input
            type="text"
            placeholder="Filter Links..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-md"
          />
          <Filter className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={Link2}
            title="No links created yet"
            description={
              isGuest
                ? "You're browsing as a guest. Your links are saved locally in this browser only."
                : "Create your first shortened URL to start tracking analytics."
            }
          />
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((url) => (
          <LinkCard key={url.id} url={url} onDelete={handleDelete} />
        ))}
      </div>
    </PageContainer>
  );
}
