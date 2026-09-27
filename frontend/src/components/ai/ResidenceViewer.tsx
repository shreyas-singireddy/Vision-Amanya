"use client";

import React, { useState } from "react";
import { InteractiveFloorPlan } from "./InteractiveFloorPlan";
import type { UnitBoundary } from "./InteractiveFloorPlan";
import { UnitDetailPanel } from "./UnitDetailPanel";

export interface ResidenceViewerProps {
  buildingName?: string;
  floorNumber?: number;
  units: UnitBoundary[];
  selectedUnitNumber?: string;
  onSelectUnit?: (unitNumber: string) => void;
}

export function ResidenceViewer({
  buildingName = "Tower A",
  floorNumber = 10,
  units,
  selectedUnitNumber,
  onSelectUnit,
}: ResidenceViewerProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  const activeUnit = units.find((u) => u.unitNumber === selectedUnitNumber) || units[0];

  return (
    <div className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl">
      {/* 2D / 3D Mode Toggle */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-serif text-base font-semibold text-neutral-100">
          Amnaya Residence Explorer
        </h3>
        <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1 text-xs">
          <button
            type="button"
            className={`rounded-md px-3 py-1 font-medium transition ${
              viewMode === "2d" ? "bg-accent-500 text-neutral-950" : "text-neutral-400 hover:text-neutral-200"
            }`}
            onClick={() => setViewMode("2d")}
          >
            2D Floor Plan
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1 font-medium transition ${
              viewMode === "3d" ? "bg-accent-500 text-neutral-950" : "text-neutral-400 hover:text-neutral-200"
            }`}
            onClick={() => setViewMode("3d")}
          >
            3D Residence Preview
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {viewMode === "2d" ? (
            <InteractiveFloorPlan
              buildingName={buildingName}
              floorNumber={floorNumber}
              units={units}
              selectedUnitNumber={selectedUnitNumber}
              onSelectUnit={onSelectUnit}
            />
          ) : (
            <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center text-neutral-400">
              <div className="font-serif text-lg font-bold text-neutral-200">
                3D Interactive Residence Model
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                Orbit controls enabled for Residence {activeUnit?.unitNumber || "1804"}.
              </p>
            </div>
          )}
        </div>

        <div>
          {activeUnit && (
            <UnitDetailPanel
              unitNumber={activeUnit.unitNumber}
              typology={activeUnit.typology}
              tower={buildingName}
              floor={floorNumber}
              view={activeUnit.view || "Lake View"}
              areaSqft={activeUnit.areaSqft}
              price={activeUnit.price || 25000000}
              onSelect={onSelectUnit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
