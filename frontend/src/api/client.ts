/** The application's HTTP client.
 *
 * A single axios instance whose interceptors handle authentication, envelope
 * unwrapping, token refresh and retries. The returned methods resolve to the
 * backend payload directly (`T`), not the envelope.
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { env } from "@lib/env";

import { installInterceptors } from "./interceptors";
import type { ApiClient } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

const instance: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

installInterceptors(instance);

/** Type-friendly client surface. All methods resolve to the payload type `T`. */
export const apiClient: ApiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await instance.get<T>(url, config)).data,
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await instance.post<T>(url, data, config)).data,
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await instance.put<T>(url, data, config)).data,
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await instance.patch<T>(url, data, config)).data,
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await instance.delete<T>(url, config)).data,
};

export type { ApiClient, BffResponse } from "./types";
export { instance as httpInstance };
