/** Assistant store — in-flight chat state for the AI assistant widget.
 *
 * Message history is fetched via TanStack Query; this store tracks only the
 * transient UI state of the current conversation (draft, streaming reply,
 * open/closed, focus).
 */

import { create } from "zustand";

import type { UUID } from "@domain/api";
import type { ChatMessage } from "@domain/assistant";

interface AssistantState {
  isOpen: boolean;
  /** Active session id (null for a brand-new conversation). */
  sessionId: UUID | null;
  /** Optimistic user message + placeholder assistant message while streaming. */
  messages: ChatMessage[];
  isStreaming: boolean;
  draft: string;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setSessionId: (sessionId: UUID | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendUserMessage: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setDraft: (draft: string) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  sessionId: null as UUID | null,
  messages: [] as ChatMessage[],
  isStreaming: false,
  draft: "",
};

export const useAssistantStore = create<AssistantState>()((set) => ({
  ...initialState,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setSessionId: (sessionId) => set({ sessionId }),
  setMessages: (messages) => set({ messages }),
  appendUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          session_id: state.sessionId ?? ("" as UUID),
          role: "user",
          content,
          created_at: new Date().toISOString(),
        },
      ],
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setDraft: (draft) => set({ draft }),
  reset: () => set(initialState),
}));
