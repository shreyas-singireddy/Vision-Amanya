/**
 * Website-Wide AI Shared Context Model
 *
 * Provides typed context definitions for embedding contextual AI
 * throughout all pages of the Amnaya application.
 */

export enum AIContextType {
  PROJECT = "project",
  RESIDENCE = "residence",
  UNIT = "unit",
  FLOOR_PLAN = "floor_plan",
  VIEW = "view",
  LOCATION = "location",
  PRICING = "pricing",
  RECOMMENDATION = "recommendation",
  COMPARISON = "comparison",
  FINANCIAL = "financial",
  SITE_VISIT = "site_visit",
}

export type ContextSource =
  | "homepage"
  | "project_overview"
  | "residence_detail"
  | "unit_detail"
  | "floor_plan_viewer"
  | "3d_experience"
  | "location_map"
  | "pricing_table"
  | "recommendation_card"
  | "comparison_matrix"
  | "financial_calculator"
  | "site_visit_modal"
  | "global_launcher";

export interface AIContextPayload {
  page_type: AIContextType | string;
  page_id?: string | null;
  project_id?: string | null;
  residence_id?: string | null;
  unit_id?: string | null;
  floor_plan_id?: string | null;
  view_id?: string | null;
  location_id?: string | null;
  selected_units?: string[];
  user_preferences?: Record<string, unknown>;
  conversation_id?: string | null;
  context_source?: ContextSource | string;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_AI_CONTEXT: AIContextPayload = {
  page_type: AIContextType.PROJECT,
  project_id: "vision-amanya",
  context_source: "global_launcher",
};
