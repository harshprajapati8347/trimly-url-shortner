"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/lib/constants";
import { downloadImage } from "@/lib/download-image";
import type { UrlRecord } from "@/lib/types";

interface LinkCardProps {
  url: UrlRecord;
  onDelete: (id: string) => Promise<void>;
}

export function LinkCard({ url, onDelete }: LinkCardProps) {
  const [deleting, setDeleting] = useState(false);
  const slug = url.custom_url || url.short_url;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${APP_URL}/${slug}`);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = () => {
    setDeleting(true);
    toast.promise(
      onDelete(url.id).finally(() => setDeleting(false)),
      {
        loading: "Deleting link...",
        success: "Link deleted successfully!",
        error: "Error deleting link",
      }
    );
  };

  return (
    <Card className="flex flex-col md:flex-row gap-5 p-5 shadow-sm transition-all hover:shadow-md bg-card group border-border">
      {url.qr && (
        <div className="shrink-0 bg-white p-2 rounded-md self-start border flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url.qr} className="h-28 w-28 object-contain" alt="qr code" />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 space-y-2">
        <Link href={`/link/${url.id}`} className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight hover:text-primary hover:underline cursor-pointer truncate">
            {url.title}
          </span>
          <span className="text-lg text-primary font-medium hover:underline cursor-pointer truncate mt-1">
            {APP_URL}/{slug}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline cursor-pointer truncate mt-2">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{url.original_url}</span>
          </span>
          <span className="flex items-end font-light text-xs text-muted-foreground mt-4">
            {new Date(url.created_at).toLocaleString()}
          </span>
        </Link>
      </div>

      <div className="flex sm:flex-col gap-2 shrink-0 md:justify-start">
        <Button
          variant="outline"
          size="icon"
          title="Copy Link"
          onClick={handleCopy}
          className="hover:text-primary transition-colors"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Download QR"
          onClick={() =>
            downloadImage(url.qr, url.title).catch(() =>
              toast.error("Could not download QR code")
            )
          }
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          title="Delete Link"
          className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <BeatLoader size={5} color="white" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
