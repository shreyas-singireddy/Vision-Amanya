"use client";

/**
 * AIConsultantInput — accessible message input bar for the Amnaya AI Property Consultant.
 */

import { type FormEvent, type KeyboardEvent, useRef } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

import { useAssistantStore } from "@store/assistant.store";
import { cn } from "@utils/cn";

export interface AIConsultantInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AIConsultantInput({ onSubmit, disabled, className }: AIConsultantInputProps) {
  const draft = useAssistantStore((s) => s.draft);
  const setDraft = useAssistantStore((s) => s.setDraft);
  const isLoading = useAssistantStore((s) => s.isLoading);
  const currentContext = useAssistantStore((s) => s.currentContext);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2 border-t border-stone-800/80 bg-stone-950 p-4", className)}
    >
      {/* Context indicator */}
      {currentContext.currentUnitId ? (
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Active context: Residence {currentContext.currentUnitId}</span>
          <button
            type="button"
            onClick={() => useAssistantStore.getState().updateContext({ currentUnitId: null })}
            className="text-stone-500 hover:text-stone-300 underline"
          >
            Clear context
          </button>
        </div>
      ) : null}

      <div className="relative flex items-center rounded-2xl border border-stone-800 bg-stone-900/90 pr-2 transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Amnaya AI about residences, views, floor plans..."
          disabled={isLoading || disabled}
          rows={1}
          className="max-h-32 min-h-12 w-full resize-none bg-transparent px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!draft.trim() || isLoading || disabled}
          aria-label="Send message"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
            draft.trim() && !isLoading
              ? "bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-md shadow-emerald-950/40"
              : "bg-stone-800 text-stone-600 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
