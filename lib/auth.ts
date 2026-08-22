import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/lib/types";

/**
 * Fetch the current authenticated user (server-side) as a serializable,
 * client-safe object. Returns null for anonymous/guest visitors.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: (user.user_metadata?.name as string) ?? null,
    avatarUrl: (user.user_metadata?.profile_pic as string) ?? null,
  };
}
