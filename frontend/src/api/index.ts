/** Barrel export for the API foundation. */

export { apiClient, httpInstance } from "./client";
export type { ApiClient, BffResponse, BffResult } from "./types";
export {
  ApiError,
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  CancelledError,
  ERROR_CODES,
  normalizeError,
} from "./errors";
export type { ErrorCode } from "./errors";
export { refreshAccessToken, isRefreshing, setSessionExpiredHandler } from "./refresh";
export { retryConfig, isRetryable, backoffDelay } from "./retry";
