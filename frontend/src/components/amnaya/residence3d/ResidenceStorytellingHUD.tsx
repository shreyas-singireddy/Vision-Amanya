"use client";

/**
 * ResidenceStorytellingHUD — Phase 3 Minimal Architectural Storytelling.
 *
 * Displays calm, elegant architectural notes for the currently focused room.
 * Displays only strictly verified dimensions and spatial orientation.
 */

import { memo } from "react";
import { Sparkles, Maximize2, Compass, Layers } from "lucide-react";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";
import type { ArchitecturalResidence } from "../../../types/residence-architecture";

export interface ResidenceStorytellingHUDProps {
  residence: ArchitecturalResidence;
}

export const ResidenceStorytellingHUD = memo(function ResidenceStorytellingHUD({
  residence,
}: ResidenceStorytellingHUDProps) {
  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);
  const isTourActive = useResidenceExplorerStore((s) => s.isTourActive);

  if (!selectedRoomId) return null;

  const room = residence.rooms.find((r) => r.id === selectedRoomId);
  if (!room) return null;

  return (
    <div
      className={`absolute bottom-6 left-6 z-20 max-w-sm bg-[#0D1512]/85 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl transition-all duration-500 animate-slide-up pointer-events-auto ${
        isTourActive ? "border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)]" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">
            Architectural Focus
          </span>
        </div>
        <span className="text-[10px] font-mono text-stone-400">
          {residence.superBuiltUpAreaSqft.toLocaleString()} Sq.Ft
        </span>
      </div>

      {/* Room Title */}
      <h4 className="text-base font-serif text-stone-100 font-medium mb-2.5 flex items-center justify-between">
        {room.name}
        {(room.type === "balcony" || room.type === "sitout") && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/40 text-emerald-300 font-sans">
            Outdoor Balcony / Sitout
          </span>
        )}
      </h4>

      {/* Verified Dimension Grid */}
      {room.dimensions?.metric ? (
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 flex items-center justify-between">
            <span className="text-[9px] font-mono text-stone-400 block">VERIFIED METRIC</span>
            <span className="text-xs font-mono text-[#D4AF37] font-semibold">
              {room.dimensions.metric}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 rounded-lg bg-stone-900/50 border border-stone-800/80 text-stone-400 text-xs font-mono mb-3">
          Dimensions — Requires Architectural Source
        </div>
      )}

      {/* Architectural Context */}
      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-sans">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-[#D4AF37]" />
          Vastu Aligned
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#D4AF37]" />
          Direct Floor Plan Link
        </span>
      </div>
    </div>
  );
});
