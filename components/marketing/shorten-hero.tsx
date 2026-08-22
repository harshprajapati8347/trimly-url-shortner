"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuest } from "@/hooks/use-guest";

/**
 * Landing hero form (client). Decides where to send the user based on whether
 * they're authenticated (server-provided prop) or a guest (client cookie).
 */
export function ShortenHero({ isAuthed }: { isAuthed: boolean }) {
  const [longUrl, setLongUrl] = useState("");
  const { isGuest } = useGuest();
  const router = useRouter();

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    const target = isAuthed || isGuest ? "/dashboard" : "/auth";
    router.push(`${target}?createNew=${encodeURIComponent(longUrl)}`);
  };

  return (
    <form
      onSubmit={handleShorten}
      className="mt-10 flex flex-col items-center w-full gap-2"
    >
      <div className="sm:h-14 flex flex-col sm:flex-row w-full md:w-2/3 lg:w-1/2 gap-3">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="url"
            required
            placeholder="Enter your long URL here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="h-full w-full pl-10 py-4 text-base rounded-full border-muted-foreground/30 focus-visible:ring-primary/50"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-10 sm:h-full rounded-full shrink-0 text-base"
        >
          Shorten Now!
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        By creating a short link you agree to our{" "}
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline hover:text-primary">
          Terms
        </Link>
        .
      </p>
    </form>
  );
}
