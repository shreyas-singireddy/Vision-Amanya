/** Shared/common DTOs mirroring `backend/app/schemas/common.py`. */

export type { PageMeta } from "./api";
export type { PageResponse } from "./api";

/** Sort direction accepted by the API. */
export type SortDirection = "asc" | "desc";

/** Sort specification: `{ field: "created_at", direction: "desc" }`. */
export interface OrderByParam {
  field: string;
  direction: SortDirection;
}

/** Every backend list endpoint accepts these query params. */
export interface ListParams {
  page?: number;
  page_size?: number;
  q?: string;
  sort_by?: string;
  sort_order?: SortDirection;
}

/** Params used to serialize query strings in service calls. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
