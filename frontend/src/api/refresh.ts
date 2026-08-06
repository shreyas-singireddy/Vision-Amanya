/** Single-flight access-token refresh orchestration.
 *
 * Concurrent 401s share one refresh call; the winner propagates the new token
 * to every waiter. If the refresh fails the in-memory token is cleared and a
 * registered "session expired" handler is invoked (the auth provider uses it
 * to redirect to /login).
 */

import { bffEndpoints } from "@constants/api-endpoints";

import { env } from "@lib/env";
import { tokenStore } from "@lib/token-store";

import type { TokenPair } from "@domain/auth";

export interface RefreshResult {
  accessToken: string;
  /** Epoch ms when the new access token expires. */
  expiresAt: number;
}

type SessionExpiredHandler = () => void;

let refreshPromise: Promise<RefreshResult> | null = null;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

/** Register the handler invoked when the refresh token is rejected. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

function absoluteRefreshUrl(): string {
  return `${env.NEXT_PUBLIC_APP_URL}${bffEndpoints.auth.refresh}`;
}

async function performRefresh(): Promise<RefreshResult> {
  const response = await fetch(absoluteRefreshUrl(), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: Partial<TokenPair>;
    message?: string;
  } | null;

  if (!response.ok || !payload?.success || !payload.data?.access_token) {
    tokenStore.clear();
    sessionExpiredHandler?.();
    const error = new Error(payload?.message ?? "Refresh failed");
    throw error;
  }

  const { access_token, expires_in } = payload.data;
  const expiresAt = expires_in ? Date.now() + expires_in * 1000 : null;
  tokenStore.set(access_token, expiresAt);

  return { accessToken: access_token, expiresAt: expiresAt ?? Date.now() };
}

/**
 * Return a fresh access token, deduplicating concurrent refresh calls.
 * If a refresh is already in flight, await it.
 */
export async function refreshAccessToken(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** True when a refresh is currently in flight. */
export function isRefreshing(): boolean {
  return refreshPromise !== null;
}
