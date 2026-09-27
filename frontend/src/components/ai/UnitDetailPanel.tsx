"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, Eye, Calendar, MapPin } from "lucide-react";

export interface UnitDetailPanelProps {
  unitNumber: string;
  typology: string;
  tower: string;
  floor: number;
  view: string;
  facing?: string;
  areaSqft: number;
  price: number;
  score?: number;
  matchReasons?: string[];
  onSelect?: (unitNumber: string) => void;
  onVisit?: (unitNumber: string) => void;
}

export function UnitDetailPanel({
  unitNumber,
  typology,
  tower,
  floor,
  view,
  facing,
  areaSqft,
  price,
  score = 94,
  matchReasons = ["Within budget", "180-degree Lake View", "10th Floor"],
  onSelect,
  onVisit,
}: UnitDetailPanelProps) {
  const formattedPrice =
    price >= 10000000
      ? `₹${(price / 10000000).toFixed(2)} Cr`
      : `₹${(price / 100000).toFixed(2)} L`;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-accent-400">
            {tower} • Floor {floor}
          </span>
          <h3 className="font-serif text-xl font-bold text-neutral-100">
            Residence {unitNumber}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-400 border border-primary-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{Math.round(score)}% Match</span>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-neutral-400 block">Typology & Area</span>
          <span className="font-medium text-neutral-200">{typology} ({areaSqft.toLocaleString()} sq.ft.)</span>
        </div>
        <div>
          <span className="text-xs text-neutral-400 block">View & Facing</span>
          <span className="font-medium text-neutral-200">{view} • {facing || "North-East"}</span>
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between rounded-lg bg-neutral-950/60 px-3.5 py-2">
        <span className="text-xs text-neutral-400">All-Inclusive Indicative</span>
        <span className="font-serif text-lg font-bold text-accent-300">{formattedPrice}</span>
      </div>

      {matchReasons.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {matchReasons.map((r, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
              <Check className="h-3.5 w-3.5 text-primary-400" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-neutral-800">
        <Link
          href={`/residences/residence-${unitNumber}` as any}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-xs font-medium text-neutral-950 transition hover:bg-accent-400"
          onClick={() => onSelect?.(unitNumber)}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Explore Residence</span>
        </Link>
        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-neutral-700 p-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
          onClick={() => onVisit?.(unitNumber)}
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
