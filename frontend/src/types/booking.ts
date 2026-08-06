/** Booking DTOs mirroring `backend/app/schemas/booking.py`. */

import type { ISODateTimeString, UUID } from "./api";
import type { BookingStatus, VisitType } from "./enums";

/** Payload for `POST /bookings`. */
export interface BookingCreate {
  property_id?: UUID | null;
  project_id?: UUID | null;
  scheduled_at: ISODateTimeString;
  duration_minutes?: number;
  visit_type?: VisitType;
  attendee_count?: number;
  notes?: string | null;
}

/** Payload for `PATCH /bookings/{id}`. */
export interface BookingUpdate {
  scheduled_at?: ISODateTimeString;
  duration_minutes?: number;
  visit_type?: VisitType;
  status?: BookingStatus;
  attendee_count?: number;
  cancellation_reason?: string | null;
  notes?: string | null;
}

/** Booking representation (`BookingResponse`). */
export interface Booking {
  id: UUID;
  booking_number: string;
  user_id?: UUID | null;
  enquiry_id?: UUID | null;
  property_id?: UUID | null;
  project_id?: UUID | null;
  agent_id?: UUID | null;
  scheduled_at: ISODateTimeString;
  duration_minutes: number;
  visit_type: VisitType;
  status: BookingStatus;
  cancellation_reason?: string | null;
  attendee_count: number;
  notes?: string | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

/** Query params for `GET /bookings`. */
export interface BookingListParams {
  page?: number;
  page_size?: number;
  status?: BookingStatus;
  property_id?: UUID;
  project_id?: UUID;
}
