"use client";

import React, { useState } from "react";

export interface UnitBoundary {
  unitNumber: string;
  polygon: string;
  centroidX: number;
  centroidY: number;
  availability: "available" | "reserved" | "sold";
  typology: string;
  areaSqft: number;
  price?: number;
  view?: string;
}

export interface InteractiveFloorPlanProps {
  buildingName?: string;
  floorNumber?: number;
  assetUrl?: string;
  units: UnitBoundary[];
  selectedUnitNumber?: string;
  onSelectUnit?: (unitNumber: string) => void;
}

export function InteractiveFloorPlan({
  buildingName = "Tower A",
  floorNumber = 10,
  assetUrl = "/assets/amnaya/floor-plans/floor-plan-04.jpg",
  units,
  selectedUnitNumber,
  onSelectUnit,
}: InteractiveFloorPlanProps) {
  const [hoveredUnit, setHoveredUnit] = useState<UnitBoundary | null>(null);

  const getFillColor = (unit: UnitBoundary) => {
    const isSelected = selectedUnitNumber === unit.unitNumber;
    if (isSelected) return "rgba(61, 139, 102, 0.65)"; // primary emerald highlight
    if (unit.availability === "available") return "rgba(163, 116, 74, 0.35)"; // gold tint
    if (unit.availability === "reserved") return "rgba(234, 179, 8, 0.25)"; // warning yellow
    return "rgba(113, 113, 122, 0.3)"; // sold gray
  };

  const getStrokeColor = (unit: UnitBoundary) => {
    const isSelected = selectedUnitNumber === unit.unitNumber;
    if (isSelected) return "#5ea883";
    if (unit.availability === "available") return "#b9926c";
    return "#52525b";
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl">
      {/* Header Info */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-400">
            {buildingName} • Floor {floorNumber}
          </span>
          <h4 className="font-serif text-base font-semibold text-neutral-100">
            Interactive Schematic Floor Block
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-500" /> Selected
          </span>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative aspect-[16/10] w-full rounded-lg bg-neutral-900 overflow-hidden border border-neutral-800">
        <svg
          viewBox="0 0 1000 1000"
          className="h-full w-full select-none"
          aria-label={`Interactive floor plan for ${buildingName} Floor ${floorNumber}`}
        >
          {units.map((u) => {
            const isSelected = selectedUnitNumber === u.unitNumber;
            return (
              <g key={u.unitNumber} className="cursor-pointer transition-all">
                <polygon
                  points={u.polygon}
                  fill={getFillColor(u)}
                  stroke={getStrokeColor(u)}
                  strokeWidth={isSelected ? 6 : 3}
                  className="transition-all hover:fill-opacity-80"
                  onMouseEnter={() => setHoveredUnit(u)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  onClick={() => onSelectUnit?.(u.unitNumber)}
                  tabIndex={0}
                  aria-label={`Residence ${u.unitNumber}, ${u.typology}, ${u.areaSqft} sq ft`}
                />
                <text
                  x={u.centroidX}
                  y={u.centroidY}
                  fill="#f5f5f5"
                  fontSize="28"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none drop-shadow-md font-sans"
                >
                  {u.unitNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredUnit && (
          <div
            className="absolute top-4 right-4 rounded-lg border border-neutral-700 bg-neutral-900/95 p-3 text-xs shadow-xl backdrop-blur-md transition-all z-20 pointer-events-none"
          >
            <div className="font-serif text-sm font-bold text-neutral-100">
              Residence {hoveredUnit.unitNumber}
            </div>
            <div className="mt-1 text-neutral-300">
              {hoveredUnit.typology} • {hoveredUnit.areaSqft.toLocaleString()} sq.ft.
            </div>
            <div className="text-accent-400 font-medium">{hoveredUnit.view}</div>
          </div>
        )}
      </div>
    </div>
  );
}
