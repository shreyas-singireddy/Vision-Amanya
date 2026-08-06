"use client";

/** AI assistant feature — stateful chat wiring.
 *
 * The backend RAG endpoint is not wired yet (Phase 6+). This hook couples the
 * assistant store to the typed service so the chat UI (under
 * `src/app/(protected)/assistant`) only has to render store state.
 */

import { useCallback } from "react";

import { assistantService } from "@services/assistant.service";

import { useAssistantStore } from "@store/assistant.store";

import type { AssistantMessageRequest } from "@domain/assistant";

export function useAssistant() {
  const state = useAssistantStore();

  const send = useCallback(
    async (content: string) => {
      const sessionId = state.sessionId;
      state.appendUserMessage(content);
      state.setStreaming(true);
      try {
        const request: AssistantMessageRequest = { content, session_id: sessionId };
        const response = await assistantService.send(request);
        state.setSessionId(response.session_id);
      } catch {
        // The UI layer owns surfacing failures to the user.
        throw new Error("The assistant is unavailable right now. Please try again.");
      } finally {
        state.setStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.sessionId]
  );

  return { ...state, send };
}
