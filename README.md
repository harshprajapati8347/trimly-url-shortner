# Trimly

A modern **URL Shortener with Analytics**, built as a **Next.js 14 (App Router)
full-stack** application — **Next.js itself is the backend** (Route Handlers,
Server Actions, Middleware). No separate Node/Express server.

Trimly lets you create short URLs, track clicks, and view link performance
through a clean dashboard — with a Redis-backed redirect cache and rate limiting.

---

## Features

- Shorten long URLs instantly
- Link analytics with Recharts (clicks, device, location)
- Authentication via Supabase (`@supabase/ssr`, cookie-based)
- **Guest Mode** (try without signup — data stays in your browser)
- Light / Dark / System theme (`next-themes`, no flash)
- Cookie consent management
- Toast notifications (Sonner)
- Fully responsive shadcn/ui interface
- **Redis-backed redirect cache** + **rate limiting** (Upstash)
- Async, non-blocking click-analytics pipeline

---

## Tech Stack

**Framework:** Next.js 14 (App Router) · TypeScript
**UI:** Tailwind CSS · shadcn/ui · Recharts · Lucide
**Backend (all in Next.js):** Route Handlers · Server Actions · Middleware
**Data:** Supabase (Postgres + Auth + Storage)
**Cache / Rate limit:** Upstash Redis + `@upstash/ratelimit`
**Validation:** Zod (+ react-hook-form)

---

## Project structure

```
app/
├─ layout.tsx                # root layout: theme, header/footer, toaster
├─ globals.css
├─ not-found.tsx
├─ (marketing)/              # /, /privacy, /terms
├─ (auth)/auth/              # /auth (login / signup / guest)
├─ (dashboard)/              # protected: /dashboard, /link/[id] (+ loading/error)
├─ [slug]/                   # guest-mode redirect fallback (client)
└─ api/
   ├─ track/route.ts         # async click ingestion
   └─ urls/route.ts          # REST create/list

components/                  # ui/ (shadcn) + feature/layout components
lib/
├─ supabase/{client,server,admin,middleware}.ts
├─ actions/urls.ts           # Server Actions (create/delete)
├─ data/urls.ts              # server-only reads
├─ redis.ts · ratelimit.ts · links.ts
├─ validations.ts (Zod) · types.ts · constants.ts
hooks/use-guest.ts
middleware.ts                # session refresh + redirect + rate limit
docs/ARCHITECTURE.md         # caching & backend design notes
```

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```
# Supabase — Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis — https://console.upstash.com → Redis → REST API
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | Your base URL (`http://localhost:3000` in dev) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Console → your DB → REST API |

> Redis is optional in dev: without it, caching and rate limiting **fail open**
> and the app still runs (redirects hit Supabase directly).

### 3. Database

Trimly expects two Supabase tables and two Storage buckets:

- `urls(id, title, user_id, original_url, custom_url, short_url, qr, created_at)`
- `clicks(id, url_id, city, country, device, created_at)`
- Storage buckets: `profile_pic` (public), `qrs` (legacy — QRs now use an external generator)

Add RLS policies so users can only read/write their own `urls` (and the
`clicks` for those urls). The server uses the **service role** only for public
redirect resolution and anonymous click writes.

### 4. Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

---

## Guest Mode

Anonymous users can create and test links without signing up. Guest links and
clicks are stored **only in `localStorage`** (never sent to Supabase). A cookie
(`trimly_guest`) marks the guest session so the server-side route guard lets
guests into the dashboard. Guest slug redirects are resolved client-side in
`app/[slug]/page.tsx` (the server-side middleware only knows about DB links).

---

## Backend / Redis / rate-limiting learning notes

See **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** for the full write-up:

- **Redis read-through cache** for slug → destination lookups (fast redirects).
- **Rate limiting** (`@upstash/ratelimit`) on create (per-user + per-IP) and
  redirect (per-IP), returning `429` + `Retry-After`.
- **Async click pipeline** via `fetch(..., { keepalive: true })` from middleware
  to `/api/track` (with a note on `after()` and queues for the future).
- **Caching invalidation** rules for create/update/delete.
- `TODO(next-learning)` markers for queues, realtime, edge functions, and
  observability.

---

## Privacy

Trimly collects limited device and approximate-location data for link
analytics. See the in-app [Privacy Policy](/privacy).

---

## Project purpose

A learning-focused project exploring **Next.js App Router full-stack patterns**,
**Supabase SSR auth**, and **serverless Redis (Upstash) caching + rate limiting**
— all without a standalone backend server.
