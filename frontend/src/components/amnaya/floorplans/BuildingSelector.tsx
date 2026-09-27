"use client";

/**
 * BuildingSelector — premium tower selector.
 *
 * Displays the four Amnaya towers (A, B, C, D) as a compact, keyboard-accessible
 * segmented control. Works on desktop, tablet and mobile without a dashboard feel.
 */

import { Building2 } from "lucide-react";

import type { FloorPlanBuilding } from "@domain/floor-plan";
import { useFloorPlanStore } from "@store/floor-plan.store";
import { useFloorPlanTracking } from "@features/floor-plans";

import { cn } from "@utils/cn";

export interface BuildingSelectorProps {
  buildings: FloorPlanBuilding[];
  className?: string;
}

export function BuildingSelector({ buildings, className }: BuildingSelectorProps) {
  const buildingId = useFloorPlanStore((s) => s.buildingId);
  const setBuildingId = useFloorPlanStore((s) => s.setBuildingId);
  const track = useFloorPlanTracking();

  return (
    <div
      role="tablist"
      aria-label="Select a residential tower"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {buildings.map((building) => {
        const isActive = buildingId === building.id;
        return (
          <button
            key={building.id}
            role="tab"
            aria-selected={isActive}
            aria-label={`${building.name} — ${building.totalFloors} floors`}
            onClick={() => {
              setBuildingId(building.id);
              track("building_selected", { buildingId: building.id });
            }}
            className={cn(
              "group inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-base ease-standard",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary-300 hover:text-foreground"
            )}
          >
            <Building2
              aria-hidden
              className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-primary-600"
              )}
              strokeWidth={1.75}
            />
            <span>{building.name}</span>
            <span
              aria-hidden
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-label",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {building.totalFloors} fl
            </span>
          </button>
        );
      })}
    </div>
  );
}
