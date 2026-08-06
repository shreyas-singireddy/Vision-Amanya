# Architecture

This document describes the frontend foundation built in Phase 6.1. It is
intended as the mental model future page builders should follow.

## Layers

```
src/
  types/        Domain DTOs mirroring the backend schemas (alias: @domain/*)
  config/       Static config: site, navigation, auth, query defaults
  constants/    Endpoint URLs, route map, query keys, roles, design tokens
  lib/          env validation, logger, storage, SEO, motion, server cookies
  api/          Axios instance + interceptors (envelope unwrap, refresh, retry)
  services/     Backend access (auth, projects, properties, favourites, ...)
  store/        Zustand client state (auth, user, project, property, ui, ...)
  hooks/        Reusable client hooks (media query, debounce, focus trap, ...)
  providers/    React providers (Query, Theme, Toast, Root)
  components/   ui / motion / feedback / composite primitives
  features/     Feature-scoped hooks + schemas (auth, projects, properties, ...)
  app/          App Router: route groups, BFF route handlers, layouts, SEO files
```

Dependency direction is strictly inward-to-outward: `app` may import anything,
`features` may import `store`/`services`/`components`, and so on. Lower layers
never import higher ones.

## Path aliases

| Alias | Target |
| --- | --- |
| `@domain/*` | `src/types/*` |
| `@config/*` | `src/config/*` |
| `@constants/*` | `src/constants/*` |
| `@lib/*` | `src/lib/*` |
| `@services/*` | `src/services/*` |
| `@store/*` | `src/store/*` |
| `@hooks/*` | `src/hooks/*` |
| `@providers/*` | `src/providers/*` |
| `@components/*` | `src/components/*` |
| `@features/*` | `src/features/*` |
| `@utils/*` | `src/utils/*` |

> The alias was renamed from `@types/*` because it collided with TypeScript's
> global `@types` scope (TS6137).

## API contract

Every backend response is an envelope:

```jsonc
// success
{ "success": true, "message": "...", "data": { ... },
  "request_id": "...", "timestamp": "..." }
// failure
{ "success": false, "message": "...", "error_code": "validation_error",
  "details": { ... }, "request_id": "...", "timestamp": "..." }
```

Paginated lists return `{ items: [...], meta: { total, page, page_size, pages } }`.

The Axios response interceptor unwraps `data` so services receive plain data;
errors are normalized into the `ApiError` hierarchy in `src/api/errors.ts`
(`UnauthorizedError`, `ValidationError` with `fieldErrors`, etc.). UI code
branches on `instanceof` or `error.code`.

### 401 → refresh → retry

- The client never holds the refresh token; refresh happens through the BFF
  route `POST /api/auth/refresh` which reads the httpOnly cookie.
- On a 401 the interceptor triggers a **single-flight** refresh promise, waits
  for it, re-attaches the fresh access token and retries the original request
  once (`_retried` guard). `meta.skipAuthRefresh` opts a request out.
- Idempotent requests (safe methods) auto-retry with exponential backoff
  (`src/api/retry.ts`); mutations opt out with `meta: { retry: false }`.

## Auth model

- **BFF route handlers** (`src/app/api/auth/*`) own the refresh token and
  store it in the `httpOnly` `va_session` cookie (`SameSite=Lax`).
- Login/register return only `{ access_token, expires_in, token_type, user }`
  to the browser; the access token lives in memory (Zustand) and is re-stored
  after each refresh.
- `(protected)` route group gates pages server-side using the session cookie.
- When a refresh fails, the root provider redirects to `/login?next=...`.

See [`auth-flow.md`](auth-flow.md).

## Theming

All colours, radii, shadows, z-index, durations and easings are declared as
CSS custom properties in `src/app/globals.css`, re-exported to Tailwind
utilities via `@theme inline`, and mirrored quantitatively in
`src/constants/design-tokens.ts`. Dark mode is a `.dark` class on `<html>`
(`@custom-variant dark`), toggled by `ThemeProvider` with a pre-paint inline
script to avoid FOUC.

## Conventions

- Typed routes are enabled: import the route map from `@constants/routes` and
  never hardcode path strings.
- Metadata is built with `buildMetadata` from `@lib/seo` (canonical, OG,
  Twitter, JSON-LD).
- Server-only code imports `server-only` (e.g. `@lib/server/cookies`).
- Tailwind utility order and formatting are enforced by the Prettier ESLint
  rule — run `npm run lint` before finishing changes.
