"use client";

/**
 * FloorPlanExplorer — the Phase 6.5 interactive floor plan orchestrator.
 *
 * Composes the building selector, floor selector, interactive viewer, controls,
 * legend, unit details panel and accessible unit list into a single premium
 * experience. Reads/writes the shared `useFloorPlanStore`.
 *
 * URL state (building/floor/unit) is synced via search params so refresh,
 * back/forward and sharing restore the selected property. The 3D integration
 * interface is exposed via `onExplore3D` (Phase 6.4).
 */

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { FLOOR_PLAN_DATASET } from "@config/floor-plans";
import type { FloorPlanBuilding, FloorPlanUnit } from "@domain/floor-plan";
import { useFloorPlanStore } from "@store/floor-plan.store";
import { useFloorPlanTracking } from "@features/floor-plans";

import { BuildingSelector } from "./BuildingSelector";
import { FloorSelector } from "./FloorSelector";
import { FloorPlanViewer } from "./FloorPlanViewer";
import { FloorPlanControls } from "./FloorPlanControls";
import { FloorPlanLegend } from "./FloorPlanLegend";
import { UnitDetailsPanel } from "./UnitDetailsPanel";
import { AccessibleUnitList } from "./AccessibleUnitList";

import { Skeleton } from "@components/ui/skeleton";

import { cn } from "@utils/cn";

export interface FloorPlanExplorerProps {
  className?: string;
  /** Optional override dataset (defaults to the verified Amnaya dataset). */
  dataset?: typeof FLOOR_PLAN_DATASET;
  /** Called when the user chooses "Explore in 3D" for a unit. */
  onExplore3D?: (unit: FloorPlanUnit, building: FloorPlanBuilding) => void;
}

export function FloorPlanExplorer({
  className,
  dataset = FLOOR_PLAN_DATASET,
  onExplore3D,
}: FloorPlanExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const track = useFloorPlanTracking();

  const buildingId = useFloorPlanStore((s) => s.buildingId);
  const floorId = useFloorPlanStore((s) => s.floorId);
  const unitId = useFloorPlanStore((s) => s.unitId);
  const setBuildingId = useFloorPlanStore((s) => s.setBuildingId);
  const setFloorId = useFloorPlanStore((s) => s.setFloorId);
  const selectUnit = useFloorPlanStore((s) => s.selectUnit);

  /* ── Derive current building / floor / unit ----------------------------- */
  const building = useMemo(
    () => dataset.buildings.find((b) => b.id === buildingId) ?? dataset.buildings[0],
    [dataset, buildingId]
  );

  const floor = useMemo(
    () => building?.floors.find((f) => f.id === floorId) ?? building?.floors[0],
    [building, floorId]
  );

  const unit = useMemo(() => floor?.units.find((u) => u.id === unitId) ?? null, [floor, unitId]);

  /* ── URL state sync (deep linking) -------------------------------------- */
  // On mount, restore from URL search params.
  useEffect(() => {
    const urlBuilding = searchParams.get("building");
    const urlFloor = searchParams.get("floor");
    const urlUnit = searchParams.get("unit");

    if (urlBuilding) setBuildingId(urlBuilding);
    if (urlFloor) setFloorId(urlFloor);
    if (urlUnit) selectUnit(urlUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push building/floor/unit to URL when they change (without spamming history).
  useEffect(() => {
    if (!building || !floor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("building", building.id);
    params.set("floor", floor.id);
    if (unit) params.set("unit", unit.id);
    else params.delete("unit");

    const qs = params.toString();
    router.replace(
      (qs ? `?${qs}` : window.location.pathname) as Parameters<typeof router.replace>[0],
      { scroll: false }
    );
  }, [building, floor, unit, router, searchParams]);

  /* ── Analytics ---------------------------------------------------------- */
  useEffect(() => {
    track("floor_plan_opened", { buildingId: building?.id, floorId: floor?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id, floor?.id]);

  /* ── Loading / error / empty states ------------------------------------- */
  if (!building || !floor) {
    return (
      <div className={cn("grid gap-6 lg:grid-cols-12", className)}>
        <div className="lg:col-span-3">
          <Skeleton className="h-64 w-full rounded-card-lg" />
        </div>
        <div className="lg:col-span-9">
          <Skeleton className="h-[420px] w-full rounded-card-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Building selector */}
      <BuildingSelector buildings={dataset.buildings} />

      {/* Main layout: floor rail + viewer + details */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Floor selector (desktop rail) */}
        <div className="lg:col-span-3">
          <FloorSelector floors={building.floors} />
        </div>

        {/* Viewer + controls + legend */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="relative">
            <FloorPlanViewer floor={floor} />
            <FloorPlanControls className="absolute right-3 top-3 z-10" />
          </div>
          <FloorPlanLegend />
        </div>

        {/* Unit details panel (desktop) */}
        <div className="lg:col-span-3">
          {unit ? (
            <UnitDetailsPanel
              unit={unit}
              buildingName={building.name}
              floorNumber={floor.floorNumber}
              onExplore3D={onExplore3D ? () => onExplore3D(unit, building) : undefined}
            />
          ) : (
            <div className="rounded-card-lg border border-dashed border-border bg-surface-subtle p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Select a residence on the floor plan to view its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accessible unit list (keyboard / screen reader alternative) */}
      <div className="rounded-card-lg border border-border bg-card p-5 shadow-card sm:p-6">
        <h3 className="label-caps mb-3 text-muted-foreground">
          Residences on {floor.label} — {building.name}
        </h3>
        <AccessibleUnitList floor={floor} />
      </div>
    </div>
  );
}
