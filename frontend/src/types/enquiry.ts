/** Enquiry DTOs mirroring `backend/app/schemas/enquiry.py`. */

import type { ISODateTimeString, UUID } from "./api";
import type { EnquiryStatus } from "./enums";

/** Payload for `POST /enquiries` (public lead capture). */
export interface EnquiryCreate {
  property_id?: UUID | null;
  project_id?: UUID | null;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  source?: string | null;
}

/** Enquiry representation (`EnquiryResponse`). */
export interface Enquiry {
  id: UUID;
  property_id?: UUID | null;
  project_id?: UUID | null;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  source?: string | null;
  status: EnquiryStatus;
  created_by?: UUID | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
  lead_id?: UUID | null;
}

/** Query params for `GET /enquiries`. */
export interface EnquiryListParams {
  page?: number;
  page_size?: number;
  status?: EnquiryStatus;
  property_id?: UUID;
  project_id?: UUID;
  q?: string;
}

/** Payload for `PATCH /enquiries/{id}`. */
export interface EnquiryUpdate {
  subject?: string | null;
  message?: string | null;
}

/** Payload for `PATCH /enquiries/{id}/status`. */
export interface EnquiryStatusUpdate {
  status: EnquiryStatus;
  notes?: string | null;
}
