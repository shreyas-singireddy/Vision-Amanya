/** Review DTOs mirroring `backend/app/schemas/review.py`. */

import type { ISODateTimeString, UUID } from "./api";
import type { ReviewStatus } from "./enums";

/** Payload for `POST /reviews`. */
export interface ReviewCreate {
  property_id?: UUID | null;
  project_id?: UUID | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  pros?: string | null;
  cons?: string | null;
}

/** Payload for `PATCH /reviews/{id}`. */
export interface ReviewUpdate {
  rating?: number;
  title?: string | null;
  body?: string | null;
  pros?: string | null;
  cons?: string | null;
}

/** Review representation (`ReviewResponse`). */
export interface Review {
  id: UUID;
  user_id: UUID;
  property_id?: UUID | null;
  project_id?: UUID | null;
  booking_id?: UUID | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  pros?: string | null;
  cons?: string | null;
  status: ReviewStatus;
  is_verified_purchase: boolean;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

/** Query params for `GET /reviews`. */
export interface ReviewListParams {
  page?: number;
  page_size?: number;
  property_id?: UUID;
  project_id?: UUID;
  status?: ReviewStatus;
  rating?: number;
}
