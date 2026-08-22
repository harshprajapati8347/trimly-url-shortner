"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { DeviceStats } from "@/components/dashboard/device-stats";
import { LocationStats } from "@/components/dashboard/location-stats";
import { deleteLinkAction } from "@/lib/actions/urls";
import {
  deleteGuestUrl,
  getGuestClicksForUrl,
  getGuestUrl,
} from "@/lib/guest-store";
import { APP_URL } from "@/lib/constants";
import { downloadImage } from "@/lib/download-image";
import type { ClickRecord, UrlRecord } from "@/lib/types";

interface LinkDetailProps {
  id: string;
  isGuest: boolean;
  initialUrl: UrlRecord | null;
  initialStats: ClickRecord[];
}

export function LinkDetail({
  id,
  isGuest,
  initialUrl,
  initialStats,
}: LinkDetailProps) {
  const router = useRouter();
  const [url, setUrl] = useState<UrlRecord | null>(initialUrl);
  const [stats, setStats] = useState<ClickRecord[]>(initialStats);
  const [deleting, setDeleting] = useState(false);

  // TODO(next-learning): live click updates. Subscribe to Supabase Realtime
  // (postgres_changes on the `clicks` table filtered by url_id) here and push
  // new rows into `stats` so the analytics update without a refresh.

  // Guests resolve everything from localStorage.
  useEffect(() => {
    if (isGuest) {
      const guestUrl = getGuestUrl(id);
      if (!guestUrl) {
        router.replace("/dashboard");
        return;
      }
      setUrl(guestUrl);
      setStats(getGuestClicksForUrl(id));
    }
  }, [id, isGuest, router]);

  if (!url) {
    return (
      <PageContainer className="py-24 text-center text-muted-foreground">
        Loading link…
      </PageContainer>
    );
  }

  const slug = url.custom_url || url.short_url;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${APP_URL}/${slug}`);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = () => {
    setDeleting(true);
    const run = async () => {
      if (isGuest) {
        deleteGuestUrl(id);
      } else {
        const res = await deleteLinkAction(id);
        if (!res.ok) throw new Error(res.error);
      }
      router.push("/dashboard");
      router.refresh();
    };
    toast.promise(run().finally(() => setDeleting(false)), {
      loading: "Deleting link...",
      success: "Link deleted successfully!",
      error: "Error deleting link",
    });
  };

  return (
    <PageContainer className="py-10">
      <div className="flex flex-col gap-8 sm:flex-row justify-between w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            {url.title}
          </span>
          <a
            href={`${APP_URL}/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-lg sm:text-3xl text-primary font-bold hover:underline break-all"
          >
            {APP_URL}/{slug}
          </a>
          <a
            href={url.original_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:underline text-muted-foreground break-all"
          >
            <LinkIcon className="h-4 w-4 shrink-0" />
            {url.original_url}
          </a>
          <span className="flex items-end font-light text-sm text-muted-foreground">
            Created on {new Date(url.created_at).toLocaleString()}
          </span>

          <div className="flex gap-2 w-full mt-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1 sm:flex-none">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadImage(url.qr, url.title).catch(() =>
                  toast.error("Could not download QR code")
                )
              }
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" /> QR
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <BeatLoader size={5} color="white" /> : <Trash className="h-4 w-4" />}
            </Button>
          </div>

          {url.qr && (
            <Card className="w-full sm:w-auto p-4 overflow-hidden flex items-center justify-center bg-white mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url.qr}
                className="w-full max-w-[250px] object-contain"
                alt="qr code"
              />
            </Card>
          )}
        </div>

        <div className="sm:w-3/5 flex flex-col gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold">Analytics</CardTitle>
            </CardHeader>
            {stats.length > 0 ? (
              <CardContent className="flex flex-col gap-6">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.length}</p>
                  </CardContent>
                </Card>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Location Data</h3>
                  <LocationStats stats={stats} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Device Info</h3>
                  <DeviceStats stats={stats} />
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                No clicks recorded yet for this URL.
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
