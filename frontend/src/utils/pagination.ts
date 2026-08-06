/** Query-string serialization for list endpoints. */

import type { PageMeta } from "@domain/common";

/** Serialize params into a `URLSearchParams`-ready record, dropping empties. */
export function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Clamp/validate a requested page number against pagination metadata. */
export function normalizePage(page: number, meta?: PageMeta): number {
  if (!meta) return Math.max(1, page);
  return Math.min(Math.max(1, page), Math.max(1, meta.pages));
}

/** Number of page indices to show around the current page. */
export function buildPageNumbers(current: number, pages: number, radius = 1): number[] {
  const start = Math.max(1, current - radius);
  const end = Math.min(pages, current + radius);
  const pagesList: number[] = [];
  for (let page = start; page <= end; page += 1) pagesList.push(page);
  return pagesList;
}
