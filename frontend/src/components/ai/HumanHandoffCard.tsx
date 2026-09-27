"use client";

import React, { useState } from "react";
import { UserCheck, ShieldCheck, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

export interface HumanHandoffCardProps {
  conversationId?: string;
  reason?: string;
  title?: string;
  description?: string;
  onConnect?: (reason: string) => Promise<void> | void;
  onContinueAI?: () => void;
}

export function HumanHandoffCard({
  conversationId,
  reason = "explicit_human_request",
  title = "Speak with an Amnaya Consultant",
  description = "A member of our senior sales team can assist you with personalized guidance and private arrangements.",
  onConnect,
  onContinueAI,
}: HumanHandoffCardProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onConnect) {
        await onConnect(reason);
      }
      setConnected(true);
    } catch (err: any) {
      setError(err?.message || "Unable to initiate handoff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="my-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-emerald-100">
              Connected with Amnaya Sales Team
            </h4>
            <p className="mt-1 text-xs text-neutral-300">
              Your conversation context has been shared so you won't need to repeat your preferences. An Amnaya sales consultant will assist you shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs uppercase tracking-wider text-amber-400">
            Amnaya Executive Handoff
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Context Preserved</span>
        </div>
      </div>

      <h3 className="font-serif text-lg font-bold text-neutral-100">{title}</h3>
      <p className="mt-1 text-xs text-neutral-300">{description}</p>

      <div className="my-4 rounded-lg bg-neutral-950/60 p-3.5 border border-neutral-800/80">
        <p className="text-[11px] font-medium text-neutral-400 mb-2">
          A member of our sales team can help you with:
        </p>
        <ul className="space-y-1.5 text-xs text-neutral-200">
          <li className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">✓</span> Residence availability & real-time inventory
          </li>
          <li className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">✓</span> Pricing discussions & payment terms
          </li>
          <li className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">✓</span> Private site visits & guided tours
          </li>
          <li className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">✓</span> Custom spatial & architectural requirements
          </li>
        </ul>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/50 p-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading}
          className="flex w-full flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-xs font-semibold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
          <span>Connect Me With a Consultant</span>
        </button>

        {onContinueAI && (
          <button
            type="button"
            onClick={onContinueAI}
            className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-neutral-800 px-4 py-2.5 text-xs font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-800"
          >
            <span>Continue with AI</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
