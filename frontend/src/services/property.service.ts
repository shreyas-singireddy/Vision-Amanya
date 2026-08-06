/** Property service — typed calls for property listings. */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type { PageResponse } from "@domain/api";
import type { Property, PropertyListParams } from "@domain/property";

import { toQueryString } from "@utils/pagination";

export class PropertyService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** List/search properties with filtering + pagination. */
  async list(params: PropertyListParams = {}): Promise<PageResponse<Property>> {
    return this.http.get<PageResponse<Property>>(
      `${apiEndpoints.properties.list}${toQueryString(params)}`
    );
  }

  /** Fetch a single property by id or slug. */
  async get(idOrSlug: string): Promise<Property> {
    return this.http.get<Property>(apiEndpoints.properties.detail(idOrSlug));
  }

  /** Fetch featured properties. */
  async featured(pageSize = 6): Promise<PageResponse<Property>> {
    return this.http.get<PageResponse<Property>>(
      `${apiEndpoints.properties.featured}${toQueryString({ page_size: pageSize, is_featured: true })}`
    );
  }

  /** Fetch related properties for a detail page. */
  async related(id: string, pageSize = 3): Promise<PageResponse<Property>> {
    return this.http.get<PageResponse<Property>>(
      `${apiEndpoints.properties.related(id)}${toQueryString({ page_size: pageSize })}`
    );
  }
}

export const propertyService = new PropertyService();
