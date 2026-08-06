/** Property DTOs mirroring `backend/app/schemas/property.py`. */

import type { ISODateString, ISODateTimeString, UUID } from "./api";
import type { FurnishingStatus, ListingStatus, ListingType, PropertyImageType } from "./enums";

/** A property image backed by a file upload. */
export interface PropertyImage {
  id: UUID;
  file_upload_id: UUID;
  caption?: string | null;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  image_type: PropertyImageType;
}

/** One recorded price change. */
export interface PriceHistory {
  id: UUID;
  price_before?: number | null;
  price_after?: number | null;
  change_reason?: string | null;
  effective_from: ISODateString;
  created_at: ISODateTimeString;
}

/** Public property representation (`PropertyResponse`). */
export interface Property {
  id: UUID;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  project_id?: UUID | null;
  category_id?: UUID | null;
  listing_agent_id?: UUID | null;
  listing_type: ListingType;
  listing_status: ListingStatus;
  price?: number | null;
  price_per_sqft?: number | null;
  is_price_on_request: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  floor_area_sqft?: number | null;
  built_up_area_sqft?: number | null;
  carpet_area_sqft?: number | null;
  total_floors?: number | null;
  floor_number?: number | null;
  furnished?: FurnishingStatus | null;
  maintenance_charge?: number | null;
  security_deposit?: number | null;
  city?: string | null;
  state?: string | null;
  country: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  features?: Record<string, unknown> | null;
  video_url?: string | null;
  virtual_tour_url?: string | null;
  view_count: number;
  is_featured: boolean;
  is_active: boolean;
  published_at?: ISODateTimeString | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
  images: PropertyImage[];
  project_name?: string | null;
  amenities: string[];
}

/** Sort options accepted by `GET /properties`. */
export type PropertySort = "newest" | "price_asc" | "price_desc" | "featured" | "popular";

/** Query params for `GET /properties`. */
export interface PropertyListParams {
  q?: string;
  city?: string;
  state?: string;
  project_id?: UUID;
  category_id?: UUID;
  listing_type?: ListingType;
  listing_status?: ListingStatus;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  furnished?: FurnishingStatus;
  is_featured?: boolean;
  sort_by?: PropertySort;
  page?: number;
  page_size?: number;
}

/** Payload for `POST /properties` (admin/agent). */
export interface PropertyCreate {
  title: string;
  slug?: string;
  description?: string | null;
  summary?: string | null;
  project_id?: UUID | null;
  category_id?: UUID | null;
  listing_agent_id?: UUID | null;
  listing_type: ListingType;
  listing_status: ListingStatus;
  price?: number | null;
  price_per_sqft?: number | null;
  is_price_on_request?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  floor_area_sqft?: number | null;
  built_up_area_sqft?: number | null;
  carpet_area_sqft?: number | null;
  total_floors?: number | null;
  floor_number?: number | null;
  furnished?: FurnishingStatus | null;
  possession_status?: string | null;
  maintenance_charge?: number | null;
  security_deposit?: number | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  features?: Record<string, unknown> | null;
  is_featured?: boolean;
}

/** Payload for `PATCH /properties/{id}` (admin/agent). */
export type PropertyUpdate = Partial<PropertyCreate>;
