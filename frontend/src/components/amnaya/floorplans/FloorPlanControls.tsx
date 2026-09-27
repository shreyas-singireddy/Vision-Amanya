"use client";

/**
 * FloorPlanControls — minimal zoom / reset / fit controls.
 *
 * Keyboard-accessible, touch-friendly, visually subtle. Uses the design
 * system's `IconButton` and `Button` primitives.
 */

import { Maximize, Minus, Plus, RotateCcw } from "lucide-react";

import { useFloorPlanStore } from "@store/floor-plan.store";

import { IconButton } from "@components/ui/icon-button";
import { Button } from "@components/ui/button";

import { cn } from "@utils/cn";

export interface FloorPlanControlsProps {
  className?: string;
}

/** Zoom step relative to the current scale. */
const ZOOM_STEP = 1.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

export function FloorPlanControls({ className }: FloorPlanControlsProps) {
  const viewport = useFloorPlanStore((s) => s.viewport);
  const setViewport = useFloorPlanStore((s) => s.setViewport);
  const resetViewport = useFloorPlanStore((s) => s.resetViewport);

  const zoomIn = () => {
    const next = Math.min(viewport.scale * ZOOM_STEP, MAX_ZOOM);
    setViewport({ scale: next });
  };

  const zoomOut = () => {
    const next = Math.max(viewport.scale / ZOOM_STEP, MIN_ZOOM);
    setViewport({ scale: next });
  };

  const fit = () => {
    // Fit-to-screen is handled by the viewer; reset to baseline.
    resetViewport();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur-md",
        className
      )}
    >
      <IconButton
        aria-label="Zoom out floor plan"
        title="Zoom out"
        icon={Minus}
        size="sm"
        variant="ghost"
        onClick={zoomOut}
        disabled={viewport.scale <= MIN_ZOOM}
      />
      <span className="numeric w-12 text-center text-xs text-muted-foreground">
        {Math.round(viewport.scale * 100)}%
      </span>
      <IconButton
        aria-label="Zoom in floor plan"
        title="Zoom in"
        icon={Plus}
        size="sm"
        variant="ghost"
        onClick={zoomIn}
        disabled={viewport.scale >= MAX_ZOOM}
      />
      <div aria-hidden className="mx-1 h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={fit}
        className="gap-1.5 px-2.5 text-xs"
        aria-label="Reset floor plan view"
      >
        <RotateCcw aria-hidden className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Reset</span>
      </Button>
      <IconButton
        aria-label="Fit floor plan to screen"
        title="Fit to screen"
        icon={Maximize}
        size="sm"
        variant="ghost"
        onClick={fit}
      />
    </div>
  );
}
