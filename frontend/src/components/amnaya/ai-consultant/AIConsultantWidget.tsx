"use client";

/**
 * AIConsultantWidget — production-grade Amnaya AI Property Consultant drawer shell.
 *
 * Implements luxury glassmorphism UI, conversation persistence, error fallback,
 * responsive mobile/desktop layout, and integration with `assistantService`.
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, RotateCcw, Sparkles, X } from "lucide-react";

import {
  ApiError,
  ForbiddenError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
} from "@api/errors";
import { apiEndpoints } from "@constants/api-endpoints";
import { assistantService } from "@services/assistant.service";
import { useAssistantStore } from "@store/assistant.store";
import type { AISuggestedAction, ChatMessage } from "@domain/assistant";

import { AIConsultantWelcome } from "./AIConsultantWelcome";
import { AIConsultantMessage } from "./AIConsultantMessage";
import { AIConsultantInput } from "./AIConsultantInput";

import { cn } from "@utils/cn";

export interface AIConsultantWidgetProps {
  className?: string;
}

const ASSISTANT_ENDPOINT_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}${apiEndpoints.assistant.send}`;

/** Distinguish failure classes so guests get actionable, elegant guidance. */
function assistantUserMessage(err: unknown): string {
  if (err instanceof NetworkError) {
    return "Amnaya Intelligence can't reach the server right now. Please check your connection and try again.";
  }
  if (err instanceof TimeoutError) {
    return "Amnaya Intelligence is taking longer than usual to respond. Please try again in a moment.";
  }
  if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return "Your session could not be verified. Please refresh the page and try again.";
  }
  if (err instanceof ValidationError) {
    return "That message couldn't be processed. Please rephrase it and try again.";
  }
  if (err instanceof RateLimitError) {
    return "You're sending messages a little too quickly. Please pause briefly and try again.";
  }
  if (err instanceof ApiError && err.status >= 500) {
    return "Amnaya Intelligence hit a temporary snag on our side. Please try again shortly.";
  }
  if (err instanceof ApiError && err.message) {
    return err.message;
  }
  return "Unable to connect to Amnaya Intelligence. Please check your connection and try again.";
}

/** Development-only diagnostic payload: URL, status, code, backend body. */
function assistantDiagnostics(err: unknown): Record<string, unknown> {
  const base: Record<string, unknown> = { url: ASSISTANT_ENDPOINT_URL };
  if (err instanceof ApiError) {
    return {
      ...base,
      kind: err.isNetworkError ? "network" : err instanceof TimeoutError ? "timeout" : "http",
      status: err.status || null,
      code: err.code,
      requestId: err.requestId,
      backendResponse: err.details,
      message: err.message,
      cause: err.cause,
    };
  }
  return { ...base, kind: "unknown", raw: err };
}

export function AIConsultantWidget({ className }: AIConsultantWidgetProps) {
  const router = useRouter();

  const isOpen = useAssistantStore((s) => s.isOpen);
  const close = useAssistantStore((s) => s.close);
  const sessionId = useAssistantStore((s) => s.sessionId);
  const setSessionId = useAssistantStore((s) => s.setSessionId);
  const messages = useAssistantStore((s) => s.messages);
  const appendUserMessage = useAssistantStore((s) => s.appendUserMessage);
  const appendAssistantMessage = useAssistantStore((s) => s.appendAssistantMessage);
  const currentContext = useAssistantStore((s) => s.currentContext);
  const isLoading = useAssistantStore((s) => s.isLoading);
  const setLoading = useAssistantStore((s) => s.setLoading);
  const error = useAssistantStore((s) => s.error);
  const setError = useAssistantStore((s) => s.setError);
  const reset = useAssistantStore((s) => s.reset);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* Auto scroll to bottom when new messages arrive */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* Handle sending query message */
  const handleSendMessage = async (text: string) => {
    appendUserMessage(text);
    setLoading(true);
    setError(null);

    try {
      const response = await assistantService.send({
        conversation_id: sessionId,
        message: text,
        context: currentContext,
      });

      if (response.conversation_id) {
        setSessionId(response.conversation_id);
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

      appendAssistantMessage(assistantMsg);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AI Consultant] Request failed:", assistantDiagnostics(err));
      }
      setError(assistantUserMessage(err));
    }
  };

  /* Handle interactive action chips */
  const handleActionClick = (action: AISuggestedAction) => {
    if (action.action_type === "navigate" && typeof action.payload.url === "string") {
      router.push(action.payload.url as Parameters<typeof router.push>[0]);
    } else if (action.action_type === "chat_prompt" && typeof action.payload.prompt === "string") {
      handleSendMessage(action.payload.prompt);
    } else if (action.action_type === "site_visit") {
      handleSendMessage("I would like to schedule a private site visit.");
    } else if (action.action_type === "compare") {
      router.push("/properties");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-label="Amnaya AI Property Consultant"
      role="dialog"
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-stone-950/95 shadow-2xl backdrop-blur-xl border-l border-stone-800 transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800/80 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/60 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wide text-stone-100">
              Amnaya Intelligence
            </h3>
            <p className="text-xs text-stone-400">AI Property Consultant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            title="Reset conversation"
            aria-label="Reset conversation"
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-200"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close consultant"
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scroll-smooth">
        {messages.length === 0 ? (
          <AIConsultantWelcome onSelectPrompt={handleSendMessage} />
        ) : (
          messages.map((msg) => (
            <AIConsultantMessage key={msg.id} message={msg} onActionClick={handleActionClick} />
          ))
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center gap-3 py-3 text-stone-400 text-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 animate-pulse">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1">
              <span>Formulating recommendation</span>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        ) : null}

        {/* Error Fallback State */}
        {error ? (
          <div className="my-2 flex items-center justify-between rounded-xl border border-rose-900/40 bg-rose-950/30 p-3 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) handleSendMessage(lastUserMsg.content);
              }}
              className="flex items-center gap-1 underline text-rose-200 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Input bar */}
      <AIConsultantInput onSubmit={handleSendMessage} />
    </div>
  );
}
