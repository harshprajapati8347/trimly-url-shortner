# Trimly — Architecture & Caching Notes

Trimly is a **Next.js 14 (App Router)** full-stack app. There is **no separate
backend server** — every piece of backend logic runs inside Next.js:

| Concern | Where it lives |
| --- | --- |
| Read pages (dashboard, link detail) | **Server Components** (`app/**/page.tsx`) |
| Form mutations (create/delete link) | **Server Actions** (`lib/actions/urls.ts`) |
| REST endpoints (programmatic) | **Route Handlers** (`app/api/**/route.ts`) |
| Redirects, auth refresh, rate limiting | **Middleware** (`middleware.ts`) |
| Fast slug lookups, rate-limit counters | **Upstash Redis** (`lib/redis.ts`, `lib/ratelimit.ts`) |

---

## Request flows

### Short-link redirect `/<slug>`

```
Browser → middleware.ts
  ├─ rate-limit per IP (Upstash) ── 429 + Retry-After if exceeded
  ├─ resolveSlug(slug)
  │     ├─ Redis GET trimly:slug:<slug>      (cache hit → done)
  │     └─ Supabase (service role) SELECT     (cache miss → backfill Redis)
  ├─ fire-and-forget POST /api/track (keepalive)  ← non-blocking analytics
  └─ 302 Redirect → original_url
```

If the slug is **not** found server-side it falls through to
`app/[slug]/page.tsx`, a client component that resolves **guest** links from
`localStorage` and redirects client-side.

### Create link

- **UI path:** `CreateLink` → `createLinkAction` Server Action → validate (Zod)
  → rate-limit (per-user + per-IP) → Supabase insert (RLS, as the user) → warm
  Redis cache → `revalidatePath('/dashboard')`.
- **Programmatic path:** `POST /api/urls` → same `createLinkAction`.

---

## Caching strategy — what is cached where

| Layer | What | TTL / Invalidation |
| --- | --- | --- |
| **Redis** (`trimly:slug:*`) | slug → `{ id, original_url }` | `SLUG_CACHE_TTL` (24h). Warmed on create; deleted on delete via `invalidateLink()`. |
| **Next.js fetch cache** | external `fetch()` GETs | Not heavily used; our reads go through the Supabase client, not `fetch`. Redirects use Redis instead. |
| **React `cache()`** | per-request memoization | Could wrap `getCurrentUser()` to dedupe within one render pass (see TODO below). |
| **Route segment cache** | Server Component output | All data routes are dynamic (`cookies()`/`getUser()`), so they render on demand. Marketing pages are effectively static. |

**Invalidation rules**
- Create link → `setCachedLink(slug)` (warm) + `revalidatePath('/dashboard')`.
- Delete link → `invalidateLink(short_url, custom_url)` + `revalidatePath('/dashboard')`.
- Update link (future) → invalidate old slug, warm new slug.

**Why Redis for redirects?** Redirects are the hottest path and must be fast +
edge-friendly. Upstash is REST-based so it works in the Edge middleware runtime,
and it doubles as the rate-limit store.

---

## Rate limiting

`lib/ratelimit.ts` builds `@upstash/ratelimit` sliding windows on the shared
Redis instance:

- `create`: 10 / 60s per `user:<id>` and per `ip:<addr>`.
- `redirect`: 60 / 10s per `ip:<addr>` (checked in middleware).

All limiters **fail open** when Redis env vars are missing so local dev keeps
working. Exceeded limits return **429** with a **`Retry-After`** header.

---

## Async click analytics

The redirect must never block on the DB write, so middleware fires
`fetch('/api/track', { keepalive: true })` without awaiting. `/api/track`
parses the user-agent (`ua-parser-js`), reads forwarded geo headers, and inserts
the click with the service-role client.

**Tradeoff:** on Next 15 we could use `after()` from `next/server` to run the
write inline after the response instead of a second network hop. We're on Next
14, so we use `keepalive`. A durable **queue** (Upstash QStash / job table +
worker) would add retries + batching — see the TODO below.

---

## TODO(next-learning) — future explorations

- **Queues / background jobs:** replace the direct insert in `app/api/track/route.ts`
  with Upstash QStash or a `job` table + worker for retries and batching.
- **Realtime click updates:** subscribe to Supabase Realtime `postgres_changes`
  on `clicks` in `components/dashboard/link-detail.tsx` to live-update charts.
- **Edge functions:** promote the redirect resolver to a dedicated Edge Route
  Handler, independent of the app deployment.
- **Observability:** add tracing/metrics in `middleware.ts` (cache hit-rate,
  redirect latency, 429 counts) via OpenTelemetry / Axiom.
- **React `cache()`:** memoize `getCurrentUser()` per request to dedupe the
  `getUser()` call across layout + page.
