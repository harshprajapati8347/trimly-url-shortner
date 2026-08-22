import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/constants";

/**
 * Route guard for the protected area. Replaces the old client-side <RequireAuth>.
 * Allows authenticated users OR guests (guest flag lives in a cookie so it's
 * readable here on the server). Everyone else is bounced to /auth.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const isGuest = cookieStore.get(GUEST_COOKIE)?.value === "1";

  if (!user && !isGuest) redirect("/auth");

  return <>{children}</>;
}
