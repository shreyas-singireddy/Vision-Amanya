/** Server-only helpers for the BFF route handlers (httpOnly session cookie). */

import "server-only";

import { cookies } from "next/headers";

import { serverEnv } from "./env";

export interface SessionCookieOptions {
  /** Max-age in seconds (defaults to the configured refresh-token TTL). */
  maxAgeSeconds?: number;
  /** "lax" keeps the cookie on top-level navigations but not subresource GETs. */
  sameSite?: "lax" | "strict" | "none";
}

/** Base attributes shared by every session-cookie write. */
function baseAttributes(opts: SessionCookieOptions = {}): {
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  maxAge: number;
  domain?: string;
} {
  return {
    path: "/",
    httpOnly: true,
    secure: serverEnv.SESSION_COOKIE_SECURE,
    sameSite: opts.sameSite ?? "lax",
    maxAge: opts.maxAgeSeconds ?? serverEnv.SESSION_MAX_AGE_SECONDS,
    ...(serverEnv.SESSION_COOKIE_DOMAIN ? { domain: serverEnv.SESSION_COOKIE_DOMAIN } : {}),
  };
}

/** Store the refresh token in the httpOnly session cookie. */
export async function setSessionCookie(
  refreshToken: string,
  opts: SessionCookieOptions = {}
): Promise<void> {
  const store = await cookies();
  store.set(serverEnv.SESSION_COOKIE_NAME, refreshToken, baseAttributes(opts));
}

/** Read the refresh token from the session cookie. */
export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(serverEnv.SESSION_COOKIE_NAME)?.value ?? null;
}

/** Clear the session cookie (logout / refresh failure). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(serverEnv.SESSION_COOKIE_NAME);
}

export { serverEnv };
