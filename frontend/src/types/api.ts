/**
 * API contract types.
 *
 * Mirrors the envelope emitted by the FastAPI backend (`app/core/response.py`).
 * Every backend response is either a success envelope or an error envelope.
 */

/** Unique resource identifier (UUID string as returned by the API). */
export type UUID = string;

/** ISO-8601 datetime string (e.g. `2026-08-07T10:30:00+05:30`). */
export type ISODateTimeString = string;

/** ISO-8601 date string (e.g. `2026-08-07`). */
export type ISODateString = string;

/** Success envelope — what the backend returns for 2xx responses. */
export interface ApiSuccessEnvelope<TData = unknown> {
  success: true;
  message: string;
  data: TData;
  request_id: string | null;
  timestamp: ISODateTimeString;
}

/** Error envelope — what the backend returns for 4xx/5xx responses. */
export interface ApiErrorEnvelope {
  success: false;
  message: string;
  error_code: string;
  details: unknown;
  request_id: string | null;
  timestamp: ISODateTimeString;
  status_code?: number;
}

/** Union of every backend envelope. */
export type ApiEnvelope<TData = unknown> = ApiSuccessEnvelope<TData> | ApiErrorEnvelope;

/** Pagination metadata attached to every list response. */
export interface PageMeta {
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/** Generic paginated payload. */
export interface PageResponse<TItem> {
  items: TItem[];
  meta: PageMeta;
}

/** Optional extra metadata carried by a request. */
export interface RequestMeta {
  /** Enable automatic retry for idempotent, safe requests (default true). */
  retry?: boolean;
  /** Skip the automatic 401 → refresh → retry flow (e.g. auth endpoints). */
  skipAuthRefresh?: boolean;
  /** Do not unwrap the success envelope (returns the full envelope). */
  raw?: boolean;
}

/** Standard payload wrapper for BFF route-handler responses. */
export interface BffResult<TData = unknown> {
  success: boolean;
  message?: string;
  data?: TData;
  error_code?: string;
}
