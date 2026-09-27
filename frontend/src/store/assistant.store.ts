/**
 * Assistant store — state management for the Amnaya AI Property Consultant.
 *
 * Tracks open state, active conversation id, context (current unit, page, project),
 * in-flight messages, streaming/loading indicators, suggested actions, and error handling.
 */

import { create } from "zustand";

import type { UUID } from "@domain/api";
import type { AIChatContext, AISuggestedAction, ChatMessage } from "@domain/assistant";

interface AssistantState {
  isOpen: boolean;
  /** Active session / conversation UUID. */
  sessionId: UUID | null;
  /** Conversation message history. */
  messages: ChatMessage[];
  /** Context parameters automatically injected into AI queries. */
  currentContext: AIChatContext;
  /** Quick action chips returned by the latest AI response. */
  suggestedActions: AISuggestedAction[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  draft: string;

  open: (initialContext?: Partial<AIChatContext>) => void;
  close: () => void;
  toggle: () => void;
  setSessionId: (sessionId: UUID | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendUserMessage: (content: string) => ChatMessage;
  appendAssistantMessage: (msg: ChatMessage) => void;
  updateContext: (ctx: Partial<AIChatContext>) => void;
  setSuggestedActions: (actions: AISuggestedAction[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setDraft: (draft: string) => void;
  reset: () => void;
}

const initialContext: AIChatContext = {
  currentPage: typeof window !== "undefined" ? window.location.pathname : "/",
  currentUnitId: null,
  currentProjectId: "vision-amanya",
  floorPlanMetadata: null,
};

const initialState = {
  isOpen: false,
  sessionId: null as UUID | null,
  messages: [] as ChatMessage[],
  currentContext: initialContext,
  suggestedActions: [] as AISuggestedAction[],
  isStreaming: false,
  isLoading: false,
  error: null as string | null,
  draft: "",
};

export const useAssistantStore = create<AssistantState>()((set) => ({
  ...initialState,

  open: (initialContextOverride) =>
    set((state) => ({
      isOpen: true,
      currentContext: {
        ...state.currentContext,
        ...initialContextOverride,
      },
    })),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setSessionId: (sessionId) => set({ sessionId }),
  setMessages: (messages) => set({ messages }),
  appendUserMessage: (content) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: "" as UUID,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, userMsg],
      error: null,
    }));
    return userMsg;
  },
  appendAssistantMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
      isLoading: false,
      isStreaming: false,
    })),
  updateContext: (ctx) =>
    set((state) => ({
      currentContext: {
        ...state.currentContext,
        ...ctx,
      },
    })),
  setSuggestedActions: (actions) => set({ suggestedActions: actions }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false, isStreaming: false }),
  setDraft: (draft) => set({ draft }),
  reset: () => set(initialState),
}));
