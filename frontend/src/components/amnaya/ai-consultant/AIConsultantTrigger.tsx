"use client";

/**
 * AIConsultantTrigger — context-aware entry point buttons for opening the AI Property Consultant.
 *
 * Usage Modes:
 * 1. Mode "global": Persistent floating pill "Ask Amnaya"
 * 2. Mode "unit": Residence page button "Ask AI about this residence"
 * 3. Mode "floor_plan": Floor plan experience button "Ask about this floor plan"
 */

import { Sparkles } from "lucide-react";

import { useAssistantStore } from "@store/assistant.store";
import { cn } from "@utils/cn";

export interface AIConsultantTriggerProps {
  mode?: "global" | "unit" | "floor_plan";
  unitId?: string;
  floorPlanContext?: Record<string, unknown>;
  className?: string;
}

export function AIConsultantTrigger({
  mode = "global",
  unitId,
  floorPlanContext,
  className,
}: AIConsultantTriggerProps) {
  const open = useAssistantStore((s) => s.open);

  const handleClick = () => {
    open({
      currentUnitId: unitId ?? null,
      floorPlanMetadata: floorPlanContext ?? null,
      currentPage: typeof window !== "undefined" ? window.location.pathname : "/",
    });
  };

  if (mode === "unit") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-900/60 shadow-sm",
          className
        )}
      >
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <span>Ask AI about this residence</span>
      </button>
    );
  }

  if (mode === "floor_plan") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-stone-900/80 px-3.5 py-2 text-xs font-medium text-emerald-300 transition-all hover:border-emerald-400 hover:bg-stone-800",
          className
        )}
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span>Ask about this floor plan</span>
      </button>
    );
  }

  // Global floating entry point
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Ask Amnaya AI Property Consultant"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-stone-950/90 px-4 py-3 text-sm font-semibold text-stone-100 shadow-2xl backdrop-blur-md transition-all duration-300",
        "hover:border-emerald-400 hover:bg-stone-900 hover:scale-105 hover:shadow-emerald-950/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        className
      )}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <Sparkles className="h-4 w-4 text-emerald-400" />
      <span>Ask Amnaya</span>
    </button>
  );
}
