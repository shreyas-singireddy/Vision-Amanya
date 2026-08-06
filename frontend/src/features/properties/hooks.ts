"use client";

/** Properties feature — TanStack Query hooks for the listing domain. */

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@constants/query-keys";

import { propertyService } from "@services/property.service";

import type { PropertyListParams } from "@domain/property";

export function usePropertyList(params: PropertyListParams = {}) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertyService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function usePropertyFeatured(pageSize = 6) {
  return useQuery({
    queryKey: queryKeys.properties.list({ is_featured: true, page_size: pageSize }),
    queryFn: () => propertyService.featured(pageSize),
  });
}

export function usePropertyDetail(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(idOrSlug),
    queryFn: () => propertyService.get(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useRelatedProperties(id: string, pageSize = 3) {
  return useQuery({
    queryKey: [...queryKeys.properties.all, "related", id],
    queryFn: () => propertyService.related(id, pageSize),
    enabled: Boolean(id),
  });
}
