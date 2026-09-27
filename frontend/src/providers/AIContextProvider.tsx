"use client";

/**
 * AIContextProvider — React Context Provider managing website-wide contextual AI state.
 *
 * Automatically tracks route changes, updates page context while preserving active conversation thread,
 * and manages global drawer state and contextual suggested prompts.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { assistantService } from "@services/assistant.service";
import type { AIStructuredResponse } from "@domain/assistant";

import {
  type AIContextPayload,
  AIContextType,
  DEFAULT_AI_CONTEXT,
} from "../lib/ai/ai-context";
import {
  type ContextualPrompt,
  getSuggestedPromptsForContext,
} from "../lib/ai/suggested-prompts";

interface AIContextState {
  activeContext: AIContextPayload;
  activeConversationId: string | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  suggestedPrompts: ContextualPrompt[];
  lastResponse: AIStructuredResponse | null;
  setAIContext: (ctx: Partial<AIContextPayload>) => void;
  getAIContext: () => AIContextPayload;
  updateAIContext: (updates: Partial<AIContextPayload>) => void;
  clearAIContext: () => void;
  openDrawer: (initialPrompt?: string, overrideContext?: Partial<AIContextPayload>) => void;
  closeDrawer: () => void;
  sendQuery: (message: string, overrideContext?: Partial<AIContextPayload>) => Promise<AIStructuredResponse | null>;
  setConversationId: (id: string | null) => void;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

export function AIContextProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [activeContext, setActiveContextState] = useState<AIContextPayload>(DEFAULT_AI_CONTEXT);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<AIStructuredResponse | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Derive context from route path automatically
  useEffect(() => {
    if (!pathname) return;

    let derivedContext: Partial<AIContextPayload> = {
      context_source: "navigation",
    };

    if (pathname === "/") {
      derivedContext = {
        page_type: AIContextType.PROJECT,
        project_id: "vision-amanya",
        context_source: "homepage",
      };
    } else if (pathname.startsWith("/residences")) {
      const parts = pathname.split("/").filter(Boolean);
      derivedContext = {
        page_type: AIContextType.RESIDENCE,
        residence_id: parts[1] || null,
        context_source: "residence_detail",
      };
    } else if (pathname.startsWith("/properties") || pathname.startsWith("/units")) {
      const parts = pathname.split("/").filter(Boolean);
      derivedContext = {
        page_type: AIContextType.UNIT,
        unit_id: parts[1] || null,
        context_source: "unit_detail",
      };
    } else if (pathname.startsWith("/location")) {
      derivedContext = {
        page_type: AIContextType.LOCATION,
        context_source: "location_map",
      };
    } else if (pathname.startsWith("/amenities") || pathname.startsWith("/masterplan")) {
      derivedContext = {
        page_type: AIContextType.PROJECT,
        context_source: "project_overview",
      };
    }

    setActiveContextState((prev) => ({
      ...prev,
      ...derivedContext,
    }));
  }, [pathname]);

  const setAIContext = useCallback((ctx: Partial<AIContextPayload>) => {
    setActiveContextState((prev) => ({
      ...prev,
      ...ctx,
    }));
  }, []);

  const getAIContext = useCallback((): AIContextPayload => {
    return activeContext;
  }, [activeContext]);

  const updateAIContext = useCallback((updates: Partial<AIContextPayload>) => {
    setActiveContextState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearAIContext = useCallback(() => {
    setActiveContextState(DEFAULT_AI_CONTEXT);
  }, []);

  const openDrawer = useCallback(
    (initialPrompt?: string, overrideContext?: Partial<AIContextPayload>) => {
      if (overrideContext) {
        setAIContext(overrideContext);
      }
      if (initialPrompt) {
        setPendingPrompt(initialPrompt);
      }
      setIsDrawerOpen(true);
    },
    [setAIContext]
  );

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const sendQuery = useCallback(
    async (
      message: string,
      overrideContext?: Partial<AIContextPayload>
    ): Promise<AIStructuredResponse | null> => {
      setIsLoading(true);
      try {
        const mergedContext = {
          ...activeContext,
          ...overrideContext,
          conversation_id: activeConversationId || undefined,
        };

        const res = await assistantService.send({
          conversation_id: activeConversationId || undefined,
          message,
          context: {
            page_type: mergedContext.page_type,
            page_id: mergedContext.page_id,
            project_id: mergedContext.project_id,
            residence_id: mergedContext.residence_id,
            unit_id: mergedContext.unit_id,
            floor_plan_id: mergedContext.floor_plan_id,
            view_id: mergedContext.view_id,
            location_id: mergedContext.location_id,
            selected_units: mergedContext.selected_units,
            context_source: mergedContext.context_source,
            user_preferences: mergedContext.user_preferences,
            currentPage: pathname,
            currentUnitId: mergedContext.unit_id,
            currentProjectId: mergedContext.project_id,
          },
        });

        if (res.conversation_id && res.conversation_id !== activeConversationId) {
          setActiveConversationId(res.conversation_id);
        }

        setLastResponse(res);
        return res;
      } catch (err) {
        console.error("AIContextProvider error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeContext, activeConversationId, pathname]
  );

  const suggestedPrompts = useMemo(() => {
    return getSuggestedPromptsForContext(activeContext.page_type);
  }, [activeContext.page_type]);

  const value = useMemo(
    () => ({
      activeContext,
      activeConversationId,
      isDrawerOpen,
      isLoading,
      suggestedPrompts,
      lastResponse,
      setAIContext,
      getAIContext,
      updateAIContext,
      clearAIContext,
      openDrawer,
      closeDrawer,
      sendQuery,
      setConversationId: setActiveConversationId,
      pendingPrompt,
      setPendingPrompt,
    }),
    [
      activeContext,
      activeConversationId,
      isDrawerOpen,
      isLoading,
      suggestedPrompts,
      lastResponse,
      setAIContext,
      getAIContext,
      updateAIContext,
      clearAIContext,
      openDrawer,
      closeDrawer,
      sendQuery,
      pendingPrompt,
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext(): AIContextState & { pendingPrompt: string | null; setPendingPrompt: (p: string | null) => void } {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error("useAIContext must be used within an AIContextProvider");
  }
  return ctx as AIContextState & { pendingPrompt: string | null; setPendingPrompt: (p: string | null) => void };
}
