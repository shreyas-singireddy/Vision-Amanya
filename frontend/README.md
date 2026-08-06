# Vision Amanya — Frontend

Next.js 16 frontend for the Vision Amanya real estate website, backed by the
FastAPI API in [`../backend`](../backend).

> **Phase 6.2 — design system built.** Phase 6.1 delivered the production-grade
> architecture (routing, data, auth, state, theming, SEO). Phase 6.2 added the
> complete visual identity — design tokens, typography, and the reusable UI
> component library, documented in the live `/styleguide`. Business pages
> arrive in later phases (see [`docs/roadmap.md`](docs/roadmap.md)).

## Stack

- **Next.js 16** (App Router, `src/` dir, Turbopack, typed routes)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** with a design-token system (`@theme inline`)
- **Zustand** — client UI state (auth, theme, toasts, favourites, compare)
- **TanStack Query** — server-state caching, retries, invalidation
- **Axios** — HTTP client with envelope unwrapping, single-flight token
  refresh and idempotent retries
- **React Hook Form + Zod** — validated forms
- **Framer Motion** — motion primitives (reduced-motion aware)
- **Radix UI** — accessible primitives

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL / API_URL
npm run dev                  # http://localhost:3000
```

Scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (includes prettier as an ESLint rule) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | Public backend base (`http://localhost:8000/api/v1` in dev) |
| `API_URL` | yes | Server-only backend base for BFF route handlers |
| `SESSION_COOKIE_NAME` | no | httpOnly session cookie name (default `va_session`) |
| `SESSION_MAX_AGE_SECONDS` | no | Refresh-token TTL (default 30 days) |
| `SESSION_COOKIE_SECURE` | no | Set cookie `Secure` flag (default `true`) |
| `SESSION_COOKIE_DOMAIN` | no | Optional cookie domain |

`NEXT_PUBLIC_*` values are validated at build time by `src/lib/env.ts`; server
values by `src/lib/server/env.ts`.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full picture.
Short version:

- **BFF route handlers** (`src/app/api/*`) keep the refresh token in an
  httpOnly cookie and call the backend server-side — the browser never sees
  credentials.
- **API client** (`src/api/`) unwraps the backend envelope
  (`{ success, message, data, … }`) so services return plain data, retries
  idempotent requests, and performs single-flight `401 → refresh → retry`.
- **Services** (`src/services/`) are the only layer that knows endpoint URLs.
- **Stores** (`src/store/`) hold ephemeral client state; server state lives in
  TanStack Query.
- **Route groups**: `(marketing)` public, `(auth)` sign-in flows,
  `(protected)` gated by the session cookie.

## Docs

- [`docs/architecture.md`](docs/architecture.md) — layers, data flow, conventions
- [`docs/design-system.md`](docs/design-system.md) — tokens, typography, components
- [`docs/brand-guidelines.md`](docs/brand-guidelines.md) — palette rationale, voice, do/don't
- [`docs/motion-guidelines.md`](docs/motion-guidelines.md) — durations, easings, principles
- [`docs/auth-flow.md`](docs/auth-flow.md) — BFF authentication flow
- [`docs/roadmap.md`](docs/roadmap.md) — what is done and what comes next
