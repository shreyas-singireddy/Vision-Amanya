/**
 * AI assistant DTOs.
 *
 * The backend persists `chat_sessions` / `chat_messages` (see
 * `backend/app/models/chat.py`) but the streaming RAG endpoint is still being
 * wired to the LangChain workspace. These types describe the future contract;
 * endpoint paths live in `@constants/api-endpoints`.
 */

import type { ISODateTimeString, UUID } from "./api";
import type { ChatMessageRole, ChatSessionStatus } from "./enums";

/** A single conversational thread. */
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

/** One exchange inside a chat session. */
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
  /** Citation sources returned by the RAG pipeline. */
  sources?: Record<string, unknown> | null;
  feedback?: number | null;
  feedback_comment?: string | null;
  created_at: ISODateTimeString;
}

/** Payload for sending a new message. */
export interface AssistantMessageRequest {
  session_id?: UUID | null;
  content: string;
  persona?: string | null;
}

/** Streaming/non-streaming response of the assistant endpoint. */
export interface AssistantMessageResponse {
  message: ChatMessage;
  session_id: UUID;
}

/** Query params for `GET /assistant/sessions`. */
export interface ChatSessionListParams {
  page?: number;
  page_size?: number;
  status?: ChatSessionStatus;
}

/** Query params for `GET /assistant/sessions/{id}/messages`. */
export interface ChatMessageListParams {
  page?: number;
  page_size?: number;
}
