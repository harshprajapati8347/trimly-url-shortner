"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarLoader } from "react-spinners";
import { UAParser } from "ua-parser-js";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { addGuestClick, resolveGuestSlug } from "@/lib/guest-store";

/**
 * Guest-mode redirect fallback.
 *
 * Server-known slugs are resolved + redirected in middleware.ts before this
 * page ever renders. We only get here for slugs that aren't in the DB/Redis —
 * i.e. guest links that live purely in this browser's localStorage. We resolve
 * them client-side, record a local click, then redirect.
 */
export default function SlugRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const link = resolveGuestSlug(params.slug);
    if (!link) {
      setNotFound(true);
      return;
    }

    const device = new UAParser(navigator.userAgent).getResult().device.type || "desktop";
    addGuestClick(link.id, { device });
    window.location.href = link.original_url;
  }, [params.slug]);

  if (notFound) {
    return (
      <PageContainer className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold">404</h1>
        <p className="text-muted-foreground max-w-md">
          This short link doesn&apos;t exist or has expired.
        </p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </PageContainer>
    );
  }

  return (
    <div className="w-full py-24 flex flex-col items-center gap-4">
      <BarLoader width={200} color="#36d7b7" />
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
}
