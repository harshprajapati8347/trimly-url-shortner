import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { resolveSlug } from "@/lib/links";
import { checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

/**
 * Middleware responsibilities (all backend logic — no separate server):
 *  1. Refresh the Supabase auth session on every request (cookie sync).
 *  2. Resolve public short links (`/<slug>`) via Redis → Supabase and 302 to
 *     their destination, firing a non-blocking click-tracking request.
 *  3. Rate-limit the redirect path per IP (returns 429 + Retry-After).
 *
 * Guest links (localStorage-only) are NOT known to the server, so unknown slugs
 * fall through to `app/[slug]/page.tsx`, which handles the guest-mode redirect
 * client-side.
 */

// App routes that must never be treated as a redirect slug.
const RESERVED = new Set([
  "auth",
  "dashboard",
  "link",
  "privacy",
  "terms",
  "api",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

// TODO(next-learning): observability. Wrap resolve/redirect with timing spans
// and structured logs (e.g. OpenTelemetry / Vercel Analytics / Axiom) to track
// cache hit-rate, redirect latency, and 429 counts.
// TODO(next-learning): edge functions. This middleware already runs at the edge;
// a natural next step is a dedicated Edge Route Handler for the redirect so it
// can be geographically distributed independently of the app.

export async function middleware(request: NextRequest) {
  // 1. Always refresh the auth session first.
  const { supabaseResponse } = await updateSession(request);

  const { pathname, origin } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  const isSlugCandidate =
    segments.length === 1 &&
    !RESERVED.has(segments[0]) &&
    !segments[0].includes(".");

  if (isSlugCandidate) {
    const slug = segments[0];

    // 3. Rate-limit redirects per IP (abuse protection).
    const rl = await checkRateLimit("redirect", `ip:${getClientIp(request)}`);
    if (!rl.success) return rateLimitResponse(rl);

    // 2. Read-through resolve (Redis → Supabase).
    const link = await resolveSlug(slug);

    if (link) {
      // Fire-and-forget click tracking. keepalive lets the request outlive the
      // redirect so we never block the user. We forward the visitor's UA + geo
      // headers because the internal fetch wouldn't otherwise carry them.
      const payload = JSON.stringify({
        url_id: link.id,
        userAgent: request.headers.get("user-agent") ?? "",
        referrer: request.headers.get("referer") ?? "",
        city: request.headers.get("x-vercel-ip-city") ?? null,
        country: request.headers.get("x-vercel-ip-country") ?? null,
      });

      void fetch(`${origin}/api/track`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Analytics must never break the redirect.
      });

      return NextResponse.redirect(new URL(link.original_url), { status: 302 });
    }
    // Not found server-side → fall through to the guest-mode client fallback.
  }

  return supabaseResponse;
}

export const config = {
  // Run on everything except Next internals, the API (called by us), and static
  // asset files. This still covers `/<slug>` redirect paths.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
