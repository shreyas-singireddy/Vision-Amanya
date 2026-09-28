"use client";

/**
 * ResidenceMiniMap — Phase 3 Compact Floor Plan Navigator.
 *
 * Renders an architectural vector mini-map inside the 3D viewer.
 * Highlights the currently active/focused room and allows direct
 * one-tap room navigation without exiting the 3D spatial experience.
 */

import { memo } from "react";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";
import type { ArchitecturalResidence, RoomId } from "../../../types/residence-architecture";

export interface ResidenceMiniMapProps {
  residence: ArchitecturalResidence;
}

export const ResidenceMiniMap = memo(function ResidenceMiniMap({ residence }: ResidenceMiniMapProps) {
  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const hoveredRoomId = useResidenceExplorerStore((s) => s.hoveredRoomId);
  const setHoveredRoom = useResidenceExplorerStore((s) => s.setHoveredRoom);

  return (
    <div className="bg-[#0D1512]/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-2.5 shadow-2xl transition-all duration-300 pointer-events-auto">
      <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          Plan Navigator
        </span>
        <span className="text-[9px] text-stone-400 font-mono">
          {selectedRoomId ? residence.rooms.find((r) => r.id === selectedRoomId)?.name : "Overview"}
        </span>
      </div>

      <div className="relative w-36 h-24 bg-[#080C0A] rounded-lg overflow-hidden border border-stone-800 flex items-center justify-center">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full object-contain p-1 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Residence Perimeter */}
          <rect
            x="50"
            y="50"
            width="900"
            height="600"
            fill="none"
            stroke="#2A3831"
            strokeWidth="3"
            strokeDasharray="4 4"
            rx="8"
          />

          {/* Interactive Room Polygons */}
          {residence.rooms.map((room) => {
            const polyPoints = room.boundary2D?.polygon;
            if (!polyPoints) return null;

            const isSelected = selectedRoomId === room.id;
            const isHovered = hoveredRoomId === room.id;

            return (
              <polygon
                key={room.id}
                points={polyPoints}
                onClick={(e) => {
                  e.stopPropagation();
                  selectRoom(room.id as RoomId);
                }}
                onMouseEnter={() => setHoveredRoom(room.id as RoomId)}
                onMouseLeave={() => setHoveredRoom(null)}
                className="cursor-pointer transition-all duration-200"
                fill={
                  isSelected
                    ? "rgba(239, 68, 68, 0.4)"
                    : isHovered
                    ? "rgba(212, 175, 55, 0.3)"
                    : "rgba(30, 41, 59, 0.45)"
                }
                stroke={isSelected ? "#EF4444" : isHovered ? "#D4AF37" : "#475569"}
                strokeWidth={isSelected ? "8" : isHovered ? "4" : "2"}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
});
