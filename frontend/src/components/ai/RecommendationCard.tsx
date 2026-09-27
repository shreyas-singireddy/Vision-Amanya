"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Eye, Calendar } from "lucide-react";

export interface UnitRecommendationProps {
  unitNumber: string;
  typology: string;
  tower: string;
  floor: number;
  view: string;
  orientation?: string;
  areaSqft: number;
  price: number;
  score: number;
  recommendationType?: string;
  matchReasons: string[];
  tradeoffs?: string[];
  onSelect?: (unitNumber: string) => void;
  onCompare?: (unitNumber: string) => void;
  onVisit?: (unitNumber: string) => void;
  onReject?: (unitNumber: string) => void;
}

export function RecommendationCard({
  unitNumber,
  typology,
  tower,
  floor,
  view,
  areaSqft,
  price,
  score,
  recommendationType = "best_match",
  matchReasons,
  tradeoffs = [],
  onSelect,
  onCompare,
  onVisit,
  onReject,
}: UnitRecommendationProps) {
  const formattedPrice =
    price >= 10000000
      ? `₹${(price / 10000000).toFixed(2)} Cr`
      : `₹${(price / 100000).toFixed(2)} L`;

  const badgeText =
    recommendationType === "best_view"
      ? "Best Lake View"
      : recommendationType === "best_value"
      ? "Best Value"
      : recommendationType === "best_area"
      ? "Most Spacious"
      : "Top Match";

  return (
    <div className="group relative rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg backdrop-blur-md transition-all hover:border-accent-500/50 hover:shadow-accent-950/20">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-semibold text-neutral-100">
            Residence {unitNumber}
          </span>
          <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 text-xs font-medium text-accent-400 border border-accent-500/20">
            {typology}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-400 border border-primary-500/20">
          <Sparkles className="h-3.5 w-3.5 text-primary-400" />
          <span>{Math.round(score)}% Match</span>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="mt-3.5 grid grid-cols-2 gap-3 text-sm text-neutral-300">
        <div>
          <span className="text-xs text-neutral-400 block">Tower & Floor</span>
          <span className="font-medium text-neutral-200">{tower} • Floor {floor}</span>
        </div>
        <div>
          <span className="text-xs text-neutral-400 block">Area & View</span>
          <span className="font-medium text-neutral-200">{areaSqft.toLocaleString()} sq.ft. • {view}</span>
        </div>
      </div>

      {/* Pricing Banner */}
      <div className="mt-3 flex items-baseline justify-between rounded-lg bg-neutral-950/60 px-3.5 py-2">
        <span className="text-xs text-neutral-400">All-Inclusive Indicative</span>
        <span className="font-serif text-base font-bold text-accent-300">{formattedPrice}</span>
      </div>

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {matchReasons.slice(0, 3).map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
              <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary-400" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-800">
        <Link
          href={`/residences/residence-${unitNumber}` as any}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-center text-xs font-medium text-neutral-200 transition hover:bg-neutral-700"
          onClick={() => onSelect?.(unitNumber)}
        >
          Explore Residence
        </Link>

        <Link
          href={`/residences?unit=${unitNumber}` as any}
          className="rounded-lg border border-accent-500/40 bg-accent-500/10 px-3 py-2 text-center text-xs font-medium text-accent-300 transition hover:bg-accent-500/20"
        >
          View on Floor Plan
        </Link>

        <button
          type="button"
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800"
          onClick={() => onCompare?.(unitNumber)}
        >
          Compare
        </button>

        {onReject && (
          <button
            type="button"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
            onClick={() => onReject(unitNumber)}
            title="Not interested in this unit"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
