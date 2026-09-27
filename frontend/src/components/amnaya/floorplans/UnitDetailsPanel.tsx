"use client";

/**
 * UnitDetailsPanel — reusable unit information panel.
 *
 * Desktop: floating side panel.
 * Mobile: bottom sheet / drawer.
 * Shows verified unit info (number, configuration, area, floor, facing, view,
 * availability) and CTAs. Price is only shown if the data exposes it.
 */

import { Compass, Layers, Maximize2, Ruler, X } from "lucide-react";
import Link from "next/link";

import { routes } from "@constants/routes";
import { UNIT_STATUS_CONFIG } from "@config/floor-plan-statuses";
import type { FloorPlanUnit } from "@domain/floor-plan";
import { useFloorPlanStore } from "@store/floor-plan.store";
import { useFloorPlanTracking } from "@features/floor-plans";

import { Button } from "@components/ui/button";
import { LuxuryButton } from "@components/amnaya/luxury-button";

import { cn } from "@utils/cn";

export interface UnitDetailsPanelProps {
  unit: FloorPlanUnit;
  /** Building name for context (e.g. "Tower A"). */
  buildingName: string;
  /** Floor number for context. */
  floorNumber: number;
  /** Optional callback for "Explore in 3D" (Phase 6.4 integration). */
  onExplore3D?: () => void;
  className?: string;
}

export function UnitDetailsPanel({
  unit,
  buildingName,
  floorNumber,
  onExplore3D,
  className,
}: UnitDetailsPanelProps) {
  const setDetailsPanelOpen = useFloorPlanStore((s) => s.setDetailsPanelOpen);
  const track = useFloorPlanTracking();

  const status = UNIT_STATUS_CONFIG[unit.availability];
  const selectable = unit.availability === "available";

  const handleClose = () => {
    setDetailsPanelOpen(false);
    track("unit_details_opened", { unitId: unit.id });
  };

  return (
    <aside
      aria-label={`Residence ${unit.unitNumber} details`}
      className={cn(
        "flex flex-col gap-4 rounded-card-lg border border-border bg-card p-5 shadow-card sm:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="label-caps text-muted-foreground">Residence</span>
          <h3 className="mt-1 font-serif text-2xl font-medium text-foreground">
            Unit {unit.unitNumber}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {buildingName} · Floor {floorNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close residence details"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          status.badgeClass
        )}
      >
        {status.label}
      </span>

      {/* Specs */}
      <dl className="grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle text-muted-foreground"
          >
            <Layers className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <dt className="text-xs uppercase tracking-label text-muted-foreground">
              Configuration
            </dt>
            <dd className="font-semibold text-foreground">{unit.typology}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle text-muted-foreground"
          >
            <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <dt className="text-xs uppercase tracking-label text-muted-foreground">Area</dt>
            <dd className="numeric font-semibold text-foreground">
              {unit.carpetAreaSqft.toLocaleString("en-IN")} sq.ft.
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle text-muted-foreground"
          >
            <Compass className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <dt className="text-xs uppercase tracking-label text-muted-foreground">Facing</dt>
            <dd className="font-semibold text-foreground">{unit.facing}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle text-muted-foreground"
          >
            <Ruler className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="leading-tight">
            <dt className="text-xs uppercase tracking-label text-muted-foreground">View</dt>
            <dd className="font-semibold text-foreground">{unit.view}</dd>
          </div>
        </div>
      </dl>

      {/* CTAs */}
      <div className="mt-auto flex flex-col gap-2.5">
        {onExplore3D ? (
          <LuxuryButton
            variant="accent"
            size="md"
            disabled={!selectable}
            className="w-full"
            onClick={() => {
              track("unit_3d_opened", { unitId: unit.id });
              onExplore3D();
            }}
          >
            Explore in 3D
          </LuxuryButton>
        ) : (
          <LuxuryButton
            asChild
            variant="accent"
            size="md"
            disabled={!selectable}
            className="w-full"
          >
            <Link
              href={routes.residencePath(buildingName, floorNumber, unit.unitNumber)}
              onClick={() => track("unit_3d_opened", { unitId: unit.id })}
            >
              Explore Residence
            </Link>
          </LuxuryButton>
        )}
        <Button asChild variant="outline" size="md" disabled={!selectable} className="w-full">
          <Link href={routes.contact} onClick={() => track("enquiry_clicked", { unitId: unit.id })}>
            Enquire
          </Link>
        </Button>
      </div>
    </aside>
  );
}
