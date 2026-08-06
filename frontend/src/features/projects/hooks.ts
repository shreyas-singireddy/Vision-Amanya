"use client";

/** Project feature — TanStack Query hooks for the project domain. */

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@constants/query-keys";

import { projectService } from "@services/project.service";

import type { ProjectListParams } from "@domain/project";

export function useProjectList(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useProjectFeatured() {
  return useQuery({
    queryKey: queryKeys.projects.featured,
    queryFn: () => projectService.featured(),
  });
}

export function useProjectDetail(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(idOrSlug),
    queryFn: () => projectService.get(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}
