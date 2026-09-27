/**
 * AI Assistant Service — typed API client for the Amnaya AI Property Consultant.
 */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type {
  AILeadCaptureRequest,
  AISiteVisitRequest,
  AIStructuredResponse,
  AssistantMessageRequest,
  ChatSession,
} from "@domain/assistant";

export class AssistantService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** Send a query message to the AI Consultant and receive a structured response. */
  async send(payload: AssistantMessageRequest): Promise<AIStructuredResponse> {
    return this.http.post<AIStructuredResponse>(apiEndpoints.assistant.send, payload, {
      timeout: 120_000,
    });
  }

  /** Create a new AI conversation thread. */
  async createSession(guestId?: string): Promise<ChatSession> {
    return this.http.post<ChatSession>(apiEndpoints.assistant.sessions, {
      guest_id: guestId,
    });
  }

  /** Fetch an existing AI conversation session with full message history. */
  async getSession(id: string): Promise<ChatSession> {
    return this.http.get<ChatSession>(apiEndpoints.assistant.session(id));
  }

  /** End/close an AI conversation session. */
  async deleteSession(id: string): Promise<void> {
    return this.http.delete<void>(apiEndpoints.assistant.session(id));
  }

  /** Submit an AI-qualified lead capture request. */
  async captureLead(payload: AILeadCaptureRequest): Promise<{ lead_id: string; status: string }> {
    return this.http.post<{ lead_id: string; status: string }>(
      apiEndpoints.assistant.lead,
      payload
    );
  }

  /** Submit an AI-qualified site visit request. */
  async requestSiteVisit(
    payload: AISiteVisitRequest
  ): Promise<{ enquiry_id: string; status: string }> {
    return this.http.post<{ enquiry_id: string; status: string }>(
      apiEndpoints.assistant.siteVisit,
      payload
    );
  }
}

export const assistantService = new AssistantService();
