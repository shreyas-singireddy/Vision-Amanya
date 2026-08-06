/** API client internal types + axios config augmentation. */

import type { AxiosRequestConfig, AxiosResponse } from "axios";

import type { ApiErrorEnvelope, BffResult, RequestMeta } from "@domain/api";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Per-request behaviour controls understood by the interceptors. */
    meta?: RequestMeta;
  }

  export interface InternalAxiosRequestConfig {
    meta?: RequestMeta;
    /** Internal: request was retried after a token refresh. */
    _retried?: boolean;
    /** Internal: number of automatic retries already attempted. */
    _retryCount?: number;
    /** Internal: true when the request is the auth-refresh call itself. */
    _isAuthCall?: boolean;
  }
}

/** Shape of a raw axios error carrying an API envelope payload. */
export type ApiErrorPayload = ApiErrorEnvelope;

/** Response interceptor rewrites `response.data` to the unwrapped payload. */
export type NormalizedResponse<T = unknown> = AxiosResponse<T>;

/** The public, type-friendly surface of the HTTP client. */
export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

/** BFF route-handler responses reuse the backend envelope shape. */
export type BffResponse<T> = BffResult<T>;

export type { BffResult };
