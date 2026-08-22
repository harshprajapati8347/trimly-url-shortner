import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </PageContainer>
  );
}
