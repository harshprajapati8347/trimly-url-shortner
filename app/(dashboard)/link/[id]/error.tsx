"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function LinkError({ reset }: { reset: () => void }) {
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-2xl font-bold">Couldn&apos;t load this link</h2>
      <p className="text-muted-foreground max-w-md">
        The link may have been deleted or you don&apos;t have access to it.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
