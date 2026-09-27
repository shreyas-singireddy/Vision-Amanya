"use client";

/**
 * AIConsultantWelcome — Amnaya Intelligence premium welcome state.
 *
 * Displays editorial typography, brand invitation, and quick suggestion chips.
 */

import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

import { useAssistantStore } from "@store/assistant.store";
import { cn } from "@utils/cn";

export interface AIConsultantWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

const INITIAL_PROMPT_SUGGESTIONS = [
  {
    label: "Find my ideal residence",
    prompt: "Can you recommend a residence based on my family size and preferences?",
    icon: Sparkles,
  },
  {
    label: "Explore 3 BHK residences",
    prompt: "What 3 BHK typologies and floor options are available at Amnaya?",
    icon: Compass,
  },
  {
    label: "Explore lake-view residences",
    prompt: "Show me high-floor residences with unobstructed views of Osman Sagar lake.",
    icon: ArrowUpRight,
  },
  {
    label: "Compare residences",
    prompt: "How does 3 BHK Type B (2,100 sq.ft.) compare to 3 BHK Type C (2,590 sq.ft.)?",
    icon: Compass,
  },
  {
    label: "Schedule a private visit",
    prompt: "I would like to schedule a private site visit at Khajaguda, Hyderabad.",
    icon: Sparkles,
  },
];

export function AIConsultantWelcome({ onSelectPrompt, className }: AIConsultantWelcomeProps) {
  const currentContext = useAssistantStore((s) => s.currentContext);

  return (
    <div className={cn("flex flex-col gap-6 p-6 sm:p-8", className)}>
      {/* Brand Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-emerald-400 uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Amnaya Intelligence</span>
        </div>

        <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-100 sm:text-3xl">
          Discover a residence that fits the way you want to live.
        </h2>

        <p className="text-sm font-light leading-relaxed text-stone-400">
          Your personal architectural guide to 420 luxury 3 BHK lake-facing residences at Khajaguda,
          Hyderabad.
        </p>

        {currentContext.currentUnitId ? (
          <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Context Active: Residence {currentContext.currentUnitId}</span>
          </div>
        ) : null}
      </div>

      {/* Prompts list */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-medium tracking-wider text-stone-500 uppercase">
          Suggested Conversations
        </span>

        <div className="grid gap-2">
          {INITIAL_PROMPT_SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className={cn(
                  "group flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-3.5 text-left transition-all duration-200",
                  "hover:border-emerald-500/40 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-emerald-950/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-700/50 bg-stone-800/50 text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-950/30">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-stone-200 group-hover:text-white">
                    {item.label}
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-stone-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
