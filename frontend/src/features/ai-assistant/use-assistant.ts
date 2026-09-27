"use client";

/** AI assistant feature — stateful chat wiring.
 *
 * Couples the assistant store to the typed service.
 */

import { useCallback } from "react";

import { assistantService } from "@services/assistant.service";
import { useAssistantStore } from "@store/assistant.store";

import type { AssistantMessageRequest, ChatMessage } from "@domain/assistant";

export function useAssistant() {
  const state = useAssistantStore();

  const send = useCallback(
    async (text: string) => {
      const conversationId = state.sessionId;
      state.appendUserMessage(text);
      state.setLoading(true);
      state.setError(null);
      try {
        const request: AssistantMessageRequest = {
          message: text,
          conversation_id: conversationId,
          context: state.currentContext,
        };
        const response = await assistantService.send(request);
        if (response.conversation_id) {
          state.setSessionId(response.conversation_id);
        }

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          session_id: response.conversation_id,
          role: "assistant",
          content: response.message,
          sources: {
            citations: response.citations,
            suggested_actions: response.suggested_actions,
            units: response.units,
            intent: response.intent,
            confidence: response.confidence,
          },
          created_at: new Date().toISOString(),
        };

        state.appendAssistantMessage(assistantMsg);
      } catch {
        state.setError("The AI Consultant is temporarily unavailable. Please try again.");
      } finally {
        state.setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.sessionId, state.currentContext]
  );

  return { ...state, send };
}
