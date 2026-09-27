"use client";

/**
 * ContextualAIButton — Context-Aware CTA Component.
 *
 * Embedded into Residence, Unit, Floor Plan, 3D View, Location, Pricing,
 * Recommendation, and Comparison views to open the AI Chat Drawer pre-configured
 * with the exact page context and initial prompt.
 */

import React from "react";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { useAIContext } from "@providers/AIContextProvider";
import { AIContextType } from "@lib/ai/ai-context";

interface ContextualAIButtonProps {
  contextType: AIContextType | string;
  contextId?: string | null;
  label?: string;
  initialPrompt?: string;
  variant?: "primary" | "secondary" | "subtle" | "card";
  className?: string;
  metadata?: Record<string, unknown>;
}

export function ContextualAIButton({
  contextType,
  contextId,
  label,
  initialPrompt,
  variant = "primary",
  className = "",
  metadata,
}: ContextualAIButtonProps) {
  const { openDrawer } = useAIContext();

  const getDefaultLabel = () => {
    switch (contextType) {
      case AIContextType.RESIDENCE:
        return "Ask About This Residence";
      case AIContextType.UNIT:
        return "Ask About This Unit";
      case AIContextType.FLOOR_PLAN:
        return "Ask About This Floor Plan";
      case AIContextType.VIEW:
        return "Ask About This View";
      case AIContextType.LOCATION:
        return "Ask About Connectivity";
      case AIContextType.PRICING:
      case AIContextType.FINANCIAL:
        return "Ask About Affordability";
      case AIContextType.RECOMMENDATION:
        return "Explain Why This Matches";
      case AIContextType.COMPARISON:
        return "Ask About This Comparison";
      default:
        return "Ask Amnaya AI";
    }
  };

  const buttonText = label || getDefaultLabel();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const overrideContext: Record<string, unknown> = {
      page_type: contextType,
      context_source: "contextual_button",
    };

    if (contextType === AIContextType.UNIT) overrideContext.unit_id = contextId;
    if (contextType === AIContextType.RESIDENCE) overrideContext.residence_id = contextId;
    if (contextType === AIContextType.FLOOR_PLAN) overrideContext.floor_plan_id = contextId;
    if (contextType === AIContextType.VIEW) overrideContext.view_id = contextId;
    if (contextType === AIContextType.LOCATION) overrideContext.location_id = contextId;
    if (metadata) overrideContext.metadata = metadata;

    openDrawer(initialPrompt || buttonText, overrideContext);
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={`group flex w-full items-center justify-between rounded-xl border border-amber-500/30 bg-neutral-900/90 px-4 py-3 text-sm font-semibold text-amber-200 backdrop-blur-md transition-all hover:border-amber-400 hover:bg-neutral-850 hover:text-amber-100 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-12" />
          <span>{buttonText}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-amber-400/70 transition-transform group-hover:translate-x-1" />
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/80 px-4 py-2 text-xs font-semibold text-neutral-200 backdrop-blur-md transition-all hover:border-amber-500/50 hover:text-amber-300 ${className}`}
      >
        <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
        <span>{buttonText}</span>
      </button>
    );
  }

  if (variant === "subtle") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-400/90 underline-offset-4 hover:text-amber-300 hover:underline ${className}`}
      >
        <Sparkles className="h-3 w-3" />
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 px-5 py-2.5 text-sm font-serif font-semibold text-amber-200 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-amber-400 hover:text-amber-100 hover:shadow-amber-500/10 hover:scale-102 active:scale-98 ${className}`}
    >
      <Sparkles className="h-4 w-4 text-amber-400" />
      <span>{buttonText}</span>
    </button>
  );
}
