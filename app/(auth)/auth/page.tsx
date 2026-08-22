import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Login / Signup" };

export default async function AuthPage() {
  // Already signed in? Skip the auth screen entirely.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <Suspense>
      <AuthPanel />
    </Suspense>
  );
}
