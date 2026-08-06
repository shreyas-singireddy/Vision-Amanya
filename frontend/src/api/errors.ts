/** Typed error hierarchy for the API layer.
 *
 * Every failure that crosses the response interceptor is normalized into one
 * of these classes, so UI code can branch on `instanceof` / `error.code`
 * instead of poking at raw axios errors.
 */

import { AxiosError, isAxiosError } from "axios";

import type { ApiErrorPayload } from "./types";

/** Backend error codes (see `backend/app/core/exceptions.py`). */
export const ERROR_CODES = {
  UNAUTHORIZED: "unauthorized",
  TOKEN_EXPIRED: "token_expired",
  INVALID_TOKEN: "invalid_token",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation_error",
  RATE_LIMITED: "rate_limited",
  CONFLICT: "conflict",
  INTERNAL_ERROR: "internal_error",
  NETWORK_ERROR: "network_error",
  TIMEOUT: "timeout",
  CANCELLED: "cancelled",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId: string | null;
  isNetworkError: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: unknown;
      requestId?: string | null;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "unknown_error";
    this.details = options.details ?? null;
    this.requestId = options.requestId ?? null;
    this.isNetworkError = false;
  }
}

export class NetworkError extends ApiError {
  constructor(cause?: unknown) {
    super("Unable to reach the server. Check your connection and try again.", {
      status: 0,
      code: ERROR_CODES.NETWORK_ERROR,
      cause,
    });
    this.name = "NetworkError";
    this.isNetworkError = true;
  }
}

export class TimeoutError extends ApiError {
  constructor(cause?: unknown) {
    super("The request timed out. Please try again.", {
      status: 0,
      code: ERROR_CODES.TIMEOUT,
      cause,
    });
    this.name = "TimeoutError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = "Your session has expired. Please sign in again.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {}
  ) {
    super(message, { status: 401, code: ERROR_CODES.UNAUTHORIZED, ...options });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = "You don't have permission to do that.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {}
  ) {
    super(message, { status: 403, code: ERROR_CODES.FORBIDDEN, ...options });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = "The requested resource could not be found.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {}
  ) {
    super(message, { status: 404, code: ERROR_CODES.NOT_FOUND, ...options });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = "The operation conflicts with existing data.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {}
  ) {
    super(message, { status: 409, code: ERROR_CODES.CONFLICT, ...options });
    this.name = "ConflictError";
  }
}

export class ValidationError extends ApiError {
  /** Field → error messages, when the backend returns field-level detail. */
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "Some fields are invalid.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {},
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, { status: 422, code: ERROR_CODES.VALIDATION_ERROR, ...options });
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message = "Too many requests. Please slow down and try again later.",
    options: Partial<ConstructorParameters<typeof ApiError>[1]> = {}
  ) {
    super(message, { status: 429, code: ERROR_CODES.RATE_LIMITED, ...options });
    this.name = "RateLimitError";
  }
}

export class CancelledError extends ApiError {
  constructor(cause?: unknown) {
    super("The request was cancelled.", { status: 0, code: ERROR_CODES.CANCELLED, cause });
    this.name = "CancelledError";
  }
}

/** Extract field errors from the backend validation payload. */
function extractFieldErrors(details: unknown): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (typeof details !== "object" || details === null) return errors;
  const list = (details as { errors?: unknown }).errors;
  if (!Array.isArray(list)) return errors;
  for (const entry of list) {
    if (typeof entry !== "object" || entry === null) continue;
    const { loc, msg } = entry as { loc?: unknown; msg?: unknown };
    if (Array.isArray(loc)) {
      const field = loc.filter((part) => typeof part === "string").join(".");
      if (field && typeof msg === "string") {
        errors[field] = [...(errors[field] ?? []), msg];
      }
    }
  }
  return errors;
}

/** Map an HTTP status to the most specific error class. */
function errorForStatus(status: number, payload?: ApiErrorPayload): ApiError {
  switch (status) {
    case 401:
      return new UnauthorizedError(payload?.message, {
        details: payload?.details,
        requestId: payload?.request_id,
      });
    case 403:
      return new ForbiddenError(payload?.message, {
        details: payload?.details,
        requestId: payload?.request_id,
      });
    case 404:
      return new NotFoundError(payload?.message, {
        details: payload?.details,
        requestId: payload?.request_id,
      });
    case 409:
      return new ConflictError(payload?.message, {
        details: payload?.details,
        requestId: payload?.request_id,
      });
    case 422:
      return new ValidationError(
        payload?.message,
        { details: payload?.details, requestId: payload?.request_id },
        extractFieldErrors(payload?.details)
      );
    case 429:
      return new RateLimitError(payload?.message, {
        details: payload?.details,
        requestId: payload?.request_id,
      });
    default:
      return new ApiError(payload?.message ?? "Something went wrong.", {
        status,
        code: payload?.error_code,
        details: payload?.details,
        requestId: payload?.request_id,
      });
  }
}

/** Normalize any thrown value into an `ApiError`. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    if (axiosError.code === AxiosError.ECONNABORTED) return new TimeoutError(error);
    if (!axiosError.response) return new NetworkError(error);

    const payload = axiosError.response.data;
    return errorForStatus(axiosError.response.status, payload);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { cause: error });
  }

  return new ApiError("An unexpected error occurred.", { cause: error });
}
