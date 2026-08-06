/** Lead DTOs mirroring `backend/app/schemas/lead.py`. */

import type { ISODateTimeString, UUID } from "./api";
import type { InterestType, LeadPriority, LeadStatus } from "./enums";

/** Lead representation. */
export interface Lead {
  id: UUID;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  interest_type: InterestType;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_locality?: string | null;
  source?: string | null;
  notes?: string | null;
  assigned_agent_id?: UUID | null;
  created_by?: UUID | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

/** Query params for `GET /leads`. */
export interface LeadListParams {
  page?: number;
  page_size?: number;
  status?: LeadStatus;
  priority?: LeadPriority;
  assigned_agent_id?: UUID;
  q?: string;
}
