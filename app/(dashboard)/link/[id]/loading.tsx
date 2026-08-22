import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function LinkLoading() {
  return (
    <PageContainer className="py-10">
      <div className="flex flex-col gap-8 sm:flex-row justify-between w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-6 sm:w-2/5">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-64 w-64" />
        </div>
        <div className="sm:w-3/5">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </PageContainer>
  );
}
