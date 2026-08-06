/** Project service — typed calls for the project domain. */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type { PageResponse } from "@domain/api";
import type { Project, ProjectListParams } from "@domain/project";

import { toQueryString } from "@utils/pagination";

export class ProjectService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** List projects with filtering + pagination. */
  async list(params: ProjectListParams = {}): Promise<PageResponse<Project>> {
    return this.http.get<PageResponse<Project>>(
      `${apiEndpoints.projects.list}${toQueryString(params)}`
    );
  }

  /** Fetch a single project by id or slug. */
  async get(idOrSlug: string): Promise<Project> {
    return this.http.get<Project>(apiEndpoints.projects.detail(idOrSlug));
  }

  /** Fetch featured projects (homepage sections, etc.). */
  async featured(): Promise<PageResponse<Project>> {
    return this.http.get<PageResponse<Project>>(
      `${apiEndpoints.projects.featured}${toQueryString({ page_size: 3 })}`
    );
  }
}

export const projectService = new ProjectService();
