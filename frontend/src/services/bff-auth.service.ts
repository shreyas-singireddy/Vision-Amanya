/** BFF auth service — server-side calls to the FastAPI auth endpoints.
 *
 * Used exclusively by the `/api/auth/*` route handlers. Keeps the backend
 * base URL, request shaping and error normalization in one place so the route
 * handlers stay thin.
 */

import "server-only";

import { apiEndpoints } from "@constants/api-endpoints";

import { serverEnv } from "@lib/server/env";

import type { ApiErrorEnvelope } from "@domain/api";
import type { AuthResponse, LoginRequest, RegisterRequest, TokenPair } from "@domain/auth";

export interface BffAuthResult<T> {
  ok: true;
  data: T;
  status: number;
}

export interface BffAuthError {
  ok: false;
  status: number;
  message: string;
  errorCode?: string | null;
}

export type BffAuthResponse<T> = BffAuthResult<T> | BffAuthError;

interface BackendEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error_code?: string | null;
  request_id?: string | null;
}

async function callBackend<T>(path: string, payload: object): Promise<BffAuthResponse<T>> {
  let response: globalThis.Response;
  try {
    response = await fetch(`${serverEnv.API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, message: "Backend unreachable." };
  }

  const body = (await response.json().catch(() => null)) as BackendEnvelope<T> | null;

  if (!response.ok || !body?.success) {
    const errorPayload = body as ApiErrorEnvelope | null;
    return {
      ok: false,
      status: response.status,
      message: errorPayload?.message ?? "Request failed.",
      errorCode: errorPayload?.error_code,
    };
  }

  return { ok: true, status: response.status, data: body.data as T };
}

/** Exchange credentials for a token pair + user. */
export function bffLogin(payload: LoginRequest): Promise<BffAuthResponse<AuthResponse>> {
  return callBackend<AuthResponse>(apiEndpoints.auth.login, payload);
}

/** Register and receive a token pair + user. */
export function bffRegister(payload: RegisterRequest): Promise<BffAuthResponse<AuthResponse>> {
  return callBackend<AuthResponse>(apiEndpoints.auth.register, payload);
}

/** Exchange a refresh token for a fresh pair (returns the pair only). */
export function bffRefresh(refreshToken: string): Promise<BffAuthResponse<{ token: TokenPair }>> {
  return callBackend<{ token: TokenPair }>(apiEndpoints.auth.refresh, {
    refresh_token: refreshToken,
  });
}

/** Revoke a refresh token server-side. */
export function bffLogout(
  refreshToken: string | null
): Promise<BffAuthResponse<{ revoked: number | boolean }>> {
  return callBackend<{ revoked: number | boolean }>(apiEndpoints.auth.logout, {
    refresh_token: refreshToken,
  });
}
