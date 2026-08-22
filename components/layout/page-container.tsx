import { cn } from "@/lib/utils";

/** Shared max-width + horizontal padding wrapper (server component). */
export function PageContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
