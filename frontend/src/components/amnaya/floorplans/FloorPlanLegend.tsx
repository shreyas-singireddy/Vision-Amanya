"use client";

/**
 * FloorPlanLegend — availability legend.
 *
 * Status is conveyed by colour + label + a distinct icon/pattern so it is
 * understandable without relying on colour alone (accessibility).
 */

import {
  UNIT_STATUS_CONFIG,
  UNIT_STATUS_ORDER,
  STATUS_LEGEND_MARK,
} from "@config/floor-plan-statuses";

import { cn } from "@utils/cn";

export interface FloorPlanLegendProps {
  className?: string;
}

export function FloorPlanLegend({ className }: FloorPlanLegendProps) {
  return (
    <div
      aria-label="Unit availability legend"
      className={cn("flex flex-wrap items-center gap-x-md gap-y-2", className)}
    >
      {UNIT_STATUS_ORDER.map((statusId) => {
        const config = UNIT_STATUS_CONFIG[statusId];
        return (
          <span
            key={statusId}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              aria-hidden
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm text-[0.625rem] font-bold text-white",
                config.badgeClass
              )}
            >
              {STATUS_LEGEND_MARK[statusId]}
            </span>
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
