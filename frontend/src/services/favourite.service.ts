/** Favourite service — typed calls for saved properties. */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type { PageResponse, UUID } from "@domain/api";
import type { FavoriteCountResponse, FavoriteToggleResponse } from "@domain/favourite";
import type { Property } from "@domain/property";

import { toQueryString } from "@utils/pagination";

export class FavouriteService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** List the caller's saved properties (paginated). */
  async list(page = 1, pageSize = 20): Promise<PageResponse<Property>> {
    return this.http.get<PageResponse<Property>>(
      `${apiEndpoints.favourites.list}${toQueryString({ page, page_size: pageSize })}`
    );
  }

  /** Toggle a property in the caller's saved list. */
  async toggle(propertyId: UUID): Promise<FavoriteToggleResponse> {
    return this.http.post<FavoriteToggleResponse>(
      apiEndpoints.favourites.toggle,
      { property_id: propertyId },
      { meta: { retry: false } }
    );
  }

  /** Check whether the caller has saved a property. */
  async status(propertyId: UUID): Promise<FavoriteToggleResponse> {
    return this.http.get<FavoriteToggleResponse>(apiEndpoints.favourites.status(propertyId));
  }

  /** Number of properties the caller has saved. */
  async count(): Promise<FavoriteCountResponse> {
    return this.http.get<FavoriteCountResponse>(apiEndpoints.favourites.count);
  }
}

export const favouriteService = new FavouriteService();
