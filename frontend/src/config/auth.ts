/** Authentication configuration.
 *
 * Centralizes cookie names, token behaviour and expiry thresholds so the BFF
 * route handlers, API interceptors and auth store all agree.
 */

export interface AuthConfig {
  /** Name of the httpOnly refresh-token cookie managed by the BFF. */
  sessionCookieName: string;
  /** Whether the session cookie is sent only over HTTPS. */
  sessionCookieSecure: boolean;
  /** Cookie `Domain` attribute (empty string = host-only). */
  sessionCookieDomain: string;
  /** Session cookie lifetime in seconds (refresh token TTL). */
  sessionMaxAgeSeconds: number;
  /** Cookie `SameSite` attribute. */
  sessionCookieSameSite: "lax" | "strict" | "none";
  /** Cookie `Path`. */
  sessionCookiePath: "/";
  /** Rotate the session cookie on every refresh. */
  sessionRotatesOnRefresh: true;
  /** Where guests land after a successful login. */
  defaultRedirectAfterLogin: "/dashboard";
  /** Where authenticated users land if they hit /login. */
  defaultRedirectAfterLogout: "/";
  /**
   * Refresh the access token silently this many seconds before it expires.
   * Keeps long-lived sessions alive without user-visible re-auth.
   */
  refreshBeforeExpirySeconds: 60;
  /** Attempt a silent refresh when the page is (re)hydrated. */
  silentRefreshOnHydration: true;
}

export const authConfig: AuthConfig = {
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "va_session",
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === "true",
  sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN ?? "",
  sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE_SECONDS ?? 2592000),
  sessionCookieSameSite: "lax",
  sessionCookiePath: "/",
  sessionRotatesOnRefresh: true,
  defaultRedirectAfterLogin: "/dashboard",
  defaultRedirectAfterLogout: "/",
  refreshBeforeExpirySeconds: 60,
  silentRefreshOnHydration: true,
};

/** The query-param name used by protected routes to return users to the page
 *  they were visiting (`/login?next=/properties/foo`). */
export const AUTH_RETURN_PARAM = "next";
