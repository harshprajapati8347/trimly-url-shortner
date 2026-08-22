import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLinkAction } from "@/lib/actions/urls";
import { getUrlsForUser } from "@/lib/data/urls";

/**
 * REST-style Route Handler for links, provided in parallel with the Server
 * Actions in lib/actions/urls.ts. Use this for programmatic/external callers
 * (scripts, integrations); the UI itself prefers the Server Actions.
 *
 * Auth, validation, rate limiting and cache-warming all live in
 * `createLinkAction`, so this handler is a thin REST wrapper over it.
 */
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await getUrlsForUser(user.id);
  return NextResponse.json({ urls });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await createLinkAction(body);
  if (!result.ok) {
    const status = result.retryAfter ? 429 : 400;
    const headers = result.retryAfter
      ? { "Retry-After": String(result.retryAfter) }
      : undefined;
    return NextResponse.json({ error: result.error }, { status, headers });
  }

  return NextResponse.json({ id: result.data.id }, { status: 201 });
}
