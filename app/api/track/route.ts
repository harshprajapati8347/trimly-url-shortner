import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Async click-analytics ingestion.
 *
 * Called fire-and-forget from middleware.ts (`fetch(..., { keepalive: true })`)
 * so the visitor's redirect is never blocked on the DB write.
 *
 * Tradeoffs vs alternatives:
 *  - `after()` (next/server, stable in Next 15): would let us run this inline in
 *    middleware without a second network hop. We're on Next 14 here, so we use
 *    keepalive fetch instead. Migration note left in ARCHITECTURE.md.
 *  - A real queue (e.g. Upstash QStash / a background worker) would add
 *    durability + retries. See TODO(next-learning) below.
 *
 * Runs in the Node.js runtime because it uses the service-role Supabase client.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url_id, userAgent, city, country } = body as {
      url_id?: string;
      userAgent?: string;
      city?: string | null;
      country?: string | null;
    };

    if (!url_id) {
      return NextResponse.json(
        { error: "url_id is required" },
        { status: 400 },
      );
    }

    // Parse device type from the visitor's user-agent (forwarded by middleware).
    const parsed = new UAParser(userAgent ?? "").getResult();
    const device = parsed.device.type || "desktop";

    const supabase = createAdminClient();
    const { error } = await supabase.from("clicks").insert({
      url_id,
      city: city ?? null,
      country: country ?? null,
      device,
    });

    if (error) {
      console.error("[track] insert failed:", error.message);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    // TODO(next-learning): swap this direct insert for a durable queue
    // (Upstash QStash / a job table + worker) to get retries + backpressure,
    // and to batch high-volume click writes.

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track] error:", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
