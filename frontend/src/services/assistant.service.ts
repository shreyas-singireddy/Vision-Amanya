/** AI assistant service — typed calls for the future AI/RAG assistant.
 *
 * NOTE: The backend `/assistant` endpoints are not implemented yet (Phase 6+).
 * This service is the contract surface the AI chat UI will consume; it is
 * intentionally thin so wiring the real API later is a one-file change.
 */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type { PageResponse } from "@domain/api";
import type {
  AssistantMessageRequest,
  AssistantMessageResponse,
  ChatMessage,
  ChatMessageListParams,
  ChatSession,
  ChatSessionListParams,
} from "@domain/assistant";

import { toQueryString } from "@utils/pagination";

export class AssistantService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** Send a message and receive the assistant reply. */
  async send(payload: AssistantMessageRequest): Promise<AssistantMessageResponse> {
    return this.http.post<AssistantMessageResponse>(apiEndpoints.assistant.send, payload, {
      timeout: 120_000,
    });
  }

  /** List the caller's assistant sessions. */
  async listSessions(params: ChatSessionListParams = {}): Promise<PageResponse<ChatSession>> {
    return this.http.get<PageResponse<ChatSession>>(
      `${apiEndpoints.assistant.sessions}${toQueryString(params)}`
    );
  }

  /** Fetch a session with its message history. */
  async getSession(id: string): Promise<ChatSession> {
    return this.http.get<ChatSession>(apiEndpoints.assistant.session(id));
  }

  /** Fetch a session's message history. */
  async messages(
    sessionId: string,
    params: ChatMessageListParams = {}
  ): Promise<PageResponse<ChatMessage>> {
    return this.http.get<PageResponse<ChatMessage>>(
      `${apiEndpoints.assistant.messages(sessionId)}${toQueryString(params)}`
    );
  }
}

export const assistantService = new AssistantService();
