"use client";

/**
 * AIConsultantMessage — message component rendering user queries and structured AI responses.
 *
 * Supports formatted text, structured residence cards, action chips, and citations.
 */

import { ArrowUpRight, FileText, Sparkles, User } from "lucide-react";
import Link from "next/link";

import type { AISuggestedAction, ChatMessage } from "@domain/assistant";
import { cn } from "@utils/cn";

export interface AIConsultantMessageProps {
  message: ChatMessage;
  onActionClick?: (action: AISuggestedAction) => void;
  className?: string;
}

export function AIConsultantMessage({
  message,
  onActionClick,
  className,
}: AIConsultantMessageProps) {
  const isUser = message.role === "user";
  const sources = message.sources as Record<string, unknown> | undefined;

  const citations = (sources?.citations as Array<Record<string, unknown>>) ?? [];
  const suggestedActions = (sources?.suggested_actions as AISuggestedAction[]) ?? [];
  const units = (sources?.units as Array<Record<string, unknown>>) ?? [];

  return (
    <div
      className={cn("flex w-full gap-3 py-3", isUser ? "justify-end" : "justify-start", className)}
    >
      {!isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-3 rounded-2xl p-4 text-sm leading-relaxed",
          isUser
            ? "bg-emerald-900/40 text-stone-100 border border-emerald-700/30 rounded-tr-xs"
            : "bg-stone-900/80 text-stone-200 border border-stone-800 rounded-tl-xs shadow-md"
        )}
      >
        {/* Main Text Content */}
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Structured Units (if unit recommendation intent) */}
        {!isUser && units.length > 0 ? (
          <div className="mt-1 flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Recommended Residences
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {units.map((unit, idx) => (
                <Link
                  key={idx}
                  href={`/residences/residence-${unit.unit_number}`}
                  className="group flex flex-col justify-between rounded-xl border border-stone-800 bg-stone-950/60 p-3 transition-all hover:border-emerald-500/40 hover:bg-stone-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-stone-400">
                        {String(unit.tower)} · Floor {String(unit.floor)}
                      </span>
                      <h4 className="font-serif text-base font-semibold text-stone-100 group-hover:text-emerald-400">
                        Unit {String(unit.unit_number)}
                      </h4>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-stone-500 group-hover:text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/60 pt-2">
                    <span>{String(unit.typology)}</span>
                    <span className="font-semibold text-stone-300">
                      {Number(unit.area_sqft).toLocaleString()} sq.ft.
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Citations */}
        {!isUser && citations.length > 0 ? (
          <div className="mt-1 flex flex-col gap-1 border-t border-stone-800/80 pt-2">
            {citations.map((cite, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-400">
                <FileText className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="font-medium text-stone-300">{String(cite.document_title)}</span>
                <span className="text-stone-500">— {String(cite.snippet)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Suggested Action Chips */}
        {!isUser && suggestedActions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2 pt-1">
            {suggestedActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onActionClick?.(action)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-900/50"
              >
                <span>{action.label}</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-800 text-stone-300">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
