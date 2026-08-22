"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        {error.message || "We couldn't load your dashboard. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </PageContainer>
  );
}
