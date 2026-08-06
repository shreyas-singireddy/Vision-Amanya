/** Axios interceptors: auth injection, envelope unwrapping, refresh + retry. */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiSuccessEnvelope } from "@domain/api";

import { logger } from "@lib/logger";
import { tokenStore } from "@lib/token-store";

import { normalizeError } from "./errors";
import { refreshAccessToken } from "./refresh";
import { backoffDelay, isRetryable, sleep } from "./retry";

/** Attach the in-memory access token and sensible defaults to every request. */
function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const accessToken = tokenStore.getAccessToken();
  if (accessToken && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!config.headers.has("Accept")) {
    config.headers.set("Accept", "application/json");
  }
  return config;
}

/**
 * Unwrap the backend success envelope so callers receive `data` directly.
 * Set `config.meta.raw = true` on a request to keep the full envelope.
 */
function responseSuccessInterceptor<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  const config = response.config as InternalAxiosRequestConfig;
  if (config.meta?.raw) return response;

  const data = response.data as unknown;
  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success?: boolean }).success === true &&
    "data" in data
  ) {
    (response as AxiosResponse<unknown>).data = (data as ApiSuccessEnvelope).data;
  }
  return response;
}

async function responseErrorInterceptor(
  error: AxiosError,
  instance: AxiosInstance
): Promise<AxiosResponse> {
  // Cancelled requests should never be refreshed/retried.
  if (axios.isCancel(error)) {
    return Promise.reject(error);
  }

  const config = error.config as InternalAxiosRequestConfig | undefined;
  if (!config) {
    return Promise.reject(normalizeError(error));
  }

  const status = error.response?.status ?? null;
  const method = (config.method ?? "get").toUpperCase();
  const isTimeout = error.code === AxiosError.ECONNABORTED;

  // --- 1) Single-flight token refresh, then retry the original request. ---
  if (status === 401 && !config.meta?.skipAuthRefresh && !config._retried && !config._isAuthCall) {
    try {
      const { accessToken } = await refreshAccessToken();
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      config._retried = true;
      logger.debug("Access token refreshed; retrying original request", {
        url: config.url,
      });
      return instance.request(config);
    } catch (refreshError) {
      return Promise.reject(normalizeError(refreshError));
    }
  }

  // --- 2) Automatic retry for transient failures (safe methods only). ---
  if (
    !isTimeout &&
    config.meta?.retry !== false &&
    isRetryable(method, status, config._retryCount ?? 0)
  ) {
    await sleep(backoffDelay(config._retryCount ?? 0));
    config._retryCount = (config._retryCount ?? 0) + 1;
    logger.debug(`Retrying ${method} ${config.url}`, {
      attempt: config._retryCount,
    });
    return instance.request(config);
  }

  // --- 3) Normalize everything else into typed errors. ---
  return Promise.reject(normalizeError(error));
}

/** Wire the interceptors onto an axios instance. */
export function installInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseSuccessInterceptor, (error) =>
    responseErrorInterceptor(error, instance)
  );
}
