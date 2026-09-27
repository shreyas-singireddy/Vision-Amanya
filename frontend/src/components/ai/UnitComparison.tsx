"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, Eye, Calendar, ArrowRight } from "lucide-react";

export interface ComparedUnitData {
  unitNumber: string;
  typology: string;
  tower: string;
  floor: number;
  view: string;
  orientation?: string;
  areaSqft: number;
  price: number;
  pricePerSqft?: number;
  score?: number;
  advantages?: string[];
  tradeoffs?: string[];
}

export interface UnitComparisonProps {
  units: ComparedUnitData[];
  recommendedUnit?: string;
  recommendationReason?: string;
  onSelect?: (unitNumber: string) => void;
  onVisit?: (unitNumber: string) => void;
}

export function UnitComparison({
  units,
  recommendedUnit,
  recommendationReason,
  onSelect,
  onVisit,
}: UnitComparisonProps) {
  if (!units || units.length === 0) return null;

  const formatPrice = (p: number) =>
    p >= 10000000 ? `₹${(p / 10000000).toFixed(2)} Cr` : `₹${(p / 100000).toFixed(2)} L`;

  return (
    <div className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-serif text-lg font-semibold text-neutral-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-400" />
          Residence Side-by-Side Comparison
        </h3>
        <span className="text-xs text-neutral-400">{units.length} Residences</span>
      </div>

      {/* Comparison Grid Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300 border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-xs text-neutral-400">
              <th className="py-2.5 px-3 font-medium">Dimension</th>
              {units.map((u) => (
                <th key={u.unitNumber} className="py-2.5 px-3 font-semibold text-neutral-200">
                  Unit {u.unitNumber} {recommendedUnit === u.unitNumber && "⭐ Best Match"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Typology</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 font-medium text-neutral-200">
                  {u.typology}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Match Score</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 font-semibold text-primary-400">
                  {u.score ? `${Math.round(u.score)}%` : "N/A"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Price (Indicative)</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 font-serif font-bold text-accent-300">
                  {formatPrice(u.price)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Rate / sq.ft.</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 text-neutral-300">
                  {u.pricePerSqft ? `₹${u.pricePerSqft.toLocaleString()}/sq.ft.` : "N/A"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Area</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 text-neutral-200">
                  {u.areaSqft.toLocaleString()} sq.ft.
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">Tower & Floor</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 text-neutral-200">
                  {u.tower} • Floor {u.floor}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-neutral-400">View & Orientation</td>
              {units.map((u) => (
                <td key={u.unitNumber} className="py-2.5 px-3 text-neutral-200">
                  {u.view} • {u.orientation || "N/A"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommended Winner Rationale */}
      {recommendationReason && (
        <div className="mt-4 rounded-lg bg-accent-500/10 p-3.5 border border-accent-500/20 text-xs text-accent-300">
          <span className="font-semibold block mb-0.5 text-accent-200">Decision Analysis:</span>
          {recommendationReason}
        </div>
      )}

      {/* Action Strip */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-800">
        {units.map((u) => (
          <Link
            key={u.unitNumber}
            href={`/residences/residence-${u.unitNumber}` as any}
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-center text-xs font-medium text-neutral-200 transition hover:bg-neutral-700"
            onClick={() => onSelect?.(u.unitNumber)}
          >
            Explore Unit {u.unitNumber}
          </Link>
        ))}
      </div>
    </div>
  );
}
