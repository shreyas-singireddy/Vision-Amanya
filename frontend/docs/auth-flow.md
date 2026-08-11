# BFF Authentication Flow

The frontend never stores credentials. The refresh token is kept in an
`httpOnly` cookie managed by Next.js route handlers, and the access token
lives in memory on the client.

## Route map

| Route handler             | Purpose                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login`    | Validate credentials → backend login → set cookie → return `{ access_token, expires_in, token_type, user }` |
| `POST /api/auth/register` | Create account → set cookie → return token pair + user                                                      |
| `POST /api/auth/refresh`  | Read cookie → backend refresh → rotate cookie → return new access token                                     |
| `POST /api/auth/logout`   | Read cookie → best-effort backend revoke → clear cookie                                                     |
| `GET /api/auth/session`   | Returns `{ authenticated }` based on cookie presence                                                        |

All handlers are `nodejs` runtime with `dynamic = "force-dynamic"` and use the
helpers in `src/lib/server/cookies.ts` plus `bff*` functions in
`src/services/bff-auth.service.ts`.

## Cookie

- Name: `va_session` (configurable via `SESSION_COOKIE_NAME`).
- Attributes: `httpOnly`, `SameSite=Lax`, `Secure` in production
  (`SESSION_COOKIE_SECURE`), `Max-Age` = refresh-token TTL (default 30 days),
  optional `SESSION_COOKIE_DOMAIN`.
- Content: the raw refresh token from the backend.

## Login (browser → BFF → backend)

```
UI form ──POST /api/auth/login──▶ Route handler
                                      │ bffLogin({email,password})
                                      ▼
                                 FastAPI POST /auth/login
                                      │ {access_token, refresh_token, ...}
                                      ▼
                       setSessionCookie(refresh_token)
                                      │
                 Response: { access_token, expires_in, token_type, user }
```

The client then hydrates the auth store with the user and stores the access
token in memory (`src/store/auth.store.ts`).

## Silent refresh (client)

When any request returns 401, the Axios response interceptor
(`src/api/interceptors.ts`) performs a **single-flight** call to
`POST /api/auth/refresh`, applies the new access token to the interceptor's
defaults, and retries the original request once. Concurrent 401s share the
same refresh promise.

## Session expiry

If refresh fails (invalid/expired token), the BFF clears the cookie, the
interceptor reports a `UnauthorizedError`, and `RootProvider`'s session-expired
handler redirects to `/login?next=<current-path>`.

## Route protection

The `(protected)` route group layout checks for the session cookie and
redirects guests to `/login?next=<pathname>` (pathname provided by the proxy
via the `x-pathname` header). This is the first line of defence; real account
pages should verify the session again in page/route-handler logic since
layouts do not re-run on client-side navigation.

## Security notes

- `NEXT_PUBLIC_*` env vars are public by definition — never put secrets there.
- The access token is never persisted to `localStorage`; it lives in memory
  only and is re-issued on refresh.
- CSRF exposure is limited by `SameSite=Lax`; the refresh endpoint is a
  side-effect-free token exchange with no cookie-triggered state change.
