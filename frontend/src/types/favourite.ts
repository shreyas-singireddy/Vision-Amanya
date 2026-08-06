/** Favourite DTOs mirroring `backend/app/schemas/favorite.py`. */

import type { ISODateTimeString, UUID } from "./api";

/** Payload for `POST /favorites`. */
export interface FavoriteCreate {
  property_id: UUID;
}

/** A saved property (`FavoriteResponse`). */
export interface Favorite {
  id: UUID;
  user_id: UUID;
  property_id: UUID;
  created_at: ISODateTimeString;
}

/** Result of a toggle/status call. */
export interface FavoriteToggleResponse {
  property_id: UUID;
  is_favorite: boolean;
}

/** Result of `GET /favorites/me/count`. */
export interface FavoriteCountResponse {
  count: number;
}
