/** Project DTOs mirroring `backend/app/schemas/project.py`. */

import type { ISODateString, ISODateTimeString, UUID } from "./api";
import type { ProjectStatus, ProjectType } from "./enums";

/** Public project representation (`ProjectResponse`). */
export interface Project {
  id: UUID;
  slug: string;
  name: string;
  description?: string | null;
  developer_name?: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  city?: string | null;
  state?: string | null;
  country: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  possession_date?: ISODateString | null;
  rera_number?: string | null;
  total_units?: number | null;
  total_area_acres?: number | null;
  is_featured: boolean;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

/** Query params for `GET /projects`. */
export interface ProjectListParams {
  page?: number;
  page_size?: number;
  q?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  city?: string;
  state?: string;
  is_featured?: boolean;
  sort_by?: string;
}

/** Payload for `POST /projects` (admin/agent). */
export interface ProjectCreate {
  name: string;
  slug?: string;
  description?: string | null;
  developer_name?: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  possession_date?: ISODateString | null;
  rera_number?: string | null;
  total_units?: number | null;
  total_area_acres?: number | null;
  is_featured?: boolean;
}

/** Payload for `PATCH /projects/{id}` (admin/agent). */
export type ProjectUpdate = Partial<ProjectCreate>;
