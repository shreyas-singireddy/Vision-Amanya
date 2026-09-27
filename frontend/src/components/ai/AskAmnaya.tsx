"use client";

/**
 * AskAmnaya — Global Luxury Floating AI Launcher & Hero Assistant Entry Point.
 *
 * Adheres strictly to Amnaya's dark glassmorphic design system with gold accents.
 */

import React from "react";
import { Sparkles, Bot } from "lucide-react";
import { useAIContext } from "@providers/AIContextProvider";

interface AskAmnayaProps {
  variant?: "floating" | "hero" | "inline";
  label?: string;
  className?: string;
  initialPrompt?: string;
}

export function AskAmnaya({
  variant = "floating",
  label = "Ask Amnaya",
  className = "",
  initialPrompt,
}: AskAmnayaProps) {
  const { openDrawer, activeContext } = useAIContext();

  const handleOpen = () => {
    openDrawer(initialPrompt);
  };

  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={handleOpen}
          aria-label="Open Amnaya AI Consultant"
          className="group relative flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-neutral-950/90 px-4 py-3 text-sm font-medium text-amber-200 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-400 hover:bg-neutral-900 hover:shadow-amber-500/20 hover:scale-105 active:scale-95"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-neutral-950 shadow-md">
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="font-serif tracking-wider font-semibold group-hover:text-amber-100">
            {label}
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
        </button>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`my-4 flex flex-col items-center ${className}`}>
        <button
          onClick={handleOpen}
          className="group relative inline-flex items-center gap-3 rounded-xl border border-amber-500/30 bg-neutral-900/80 px-6 py-4 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-amber-400 hover:bg-neutral-900 hover:shadow-amber-500/20"
        >
          <Bot className="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
          <div className="text-left">
            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Curious about Amnaya?
            </div>
            <div className="font-serif text-sm font-semibold text-neutral-100 group-hover:text-amber-200">
              {label} — Instant AI Property Insights
            </div>
          </div>
          <Sparkles className="ml-2 h-4 w-4 text-amber-400 opacity-70 group-hover:opacity-100" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleOpen}
      className={`inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-neutral-900/60 px-4 py-2 text-xs font-semibold text-amber-300 backdrop-blur-md hover:border-amber-400 hover:bg-neutral-800 ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
      <span>{label}</span>
    </button>
  );
}
