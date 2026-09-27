/**
 * AI Assistant DTOs & Structured Response Contracts.
 *
 * Synchronized with FastAPI backend AI router schemas (`backend/app/schemas/ai.py`).
 */

import type { ISODateTimeString, UUID } from "./api";
import type { ChatMessageRole, ChatSessionStatus } from "./enums";

export type AIResponseType =
  | "text"
  | "unit_recommendation"
  | "unit_comparison"
  | "floor_plan"
  | "site_visit"
  | "lead_capture"
  | "handoff"
  | "error";

export interface AIChatContext {
  page_type?: string | null;
  page_id?: string | null;
  project_id?: string | null;
  residence_id?: string | null;
  unit_id?: string | null;
  floor_plan_id?: string | null;
  view_id?: string | null;
  location_id?: string | null;
  selected_units?: string[];
  context_source?: string | null;
  user_preferences?: Record<string, unknown> | null;
  currentPage?: string | null;
  currentUnitId?: string | null;
  currentProjectId?: string | null;
  floorPlanMetadata?: Record<string, unknown> | null;
}

export interface AICitation {
  document_title: string;
  document_type?: string | null;
  snippet: string;
  source_url?: string | null;
  page_number?: number | null;
}

export interface AISuggestedAction {
  label: string;
  action_type: "navigate" | "chat_prompt" | "open_modal" | "site_visit" | "compare" | string;
  payload: Record<string, unknown>;
}

export interface AIStructuredResponse {
  conversation_id: UUID;
  message: string;
  response_type: AIResponseType;
  intent: string;
  confidence: number;
  citations: AICitation[];
  suggested_actions: AISuggestedAction[];
  units: Record<string, unknown>[];
  floor_plan_context?: Record<string, unknown> | null;
  lead_context?: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

export interface ChatSession {
  id: UUID;
  user_id?: UUID | null;
  guest_id?: string | null;
  persona?: string | null;
  status: ChatSessionStatus;
  started_at: ISODateTimeString;
  ended_at?: ISODateTimeString | null;
  message_count: number;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface ChatMessage {
  id: UUID;
  session_id: UUID;
  role: ChatMessageRole;
  content: string;
  tokens_prompt?: number | null;
  tokens_completion?: number | null;
  tokens_total?: number | null;
  model?: string | null;
  latency_ms?: number | null;
  sources?: Record<string, unknown> | null;
  structured_response?: AIStructuredResponse | null;
  feedback?: number | null;
  feedback_comment?: string | null;
  created_at: ISODateTimeString;
}

export interface AssistantMessageRequest {
  conversation_id?: UUID | null;
  message: string;
  context?: AIChatContext | null;
  guest_id?: string | null;
}

export interface AILeadCaptureRequest {
  conversation_id?: UUID | null;
  full_name: string;
  phone: string;
  email?: string | null;
  preferred_unit_id?: string | null;
  notes?: string | null;
}

export interface AISiteVisitRequest {
  conversation_id?: UUID | null;
  full_name: string;
  phone: string;
  email?: string | null;
  preferred_date: string;
  preferred_unit_id?: string | null;
  notes?: string | null;
}
