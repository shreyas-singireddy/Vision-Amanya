"use client";

/**
 * AccessibleUnitList — semantic, keyboard-accessible unit list alternative.
 *
 * The floor plan cannot depend exclusively on visual interaction. This list
 * provides a screen-reader-friendly, keyboard-navigable table of units for the
 * selected floor. Selecting a unit here updates the same store as the SVG.
 */

import { useFloorPlanStore } from "@store/floor-plan.store";
import { UNIT_STATUS_CONFIG, unitAccessibilityLabel } from "@config/floor-plan-statuses";
import type { FloorPlanFloor } from "@domain/floor-plan";

import { cn } from "@utils/cn";

export interface AccessibleUnitListProps {
  floor: FloorPlanFloor;
  className?: string;
}

export function AccessibleUnitList({ floor, className }: AccessibleUnitListProps) {
  const selectedUnitId = useFloorPlanStore((s) => s.unitId);
  const selectUnit = useFloorPlanStore((s) => s.selectUnit);

  if (floor.units.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No residences are currently listed for this floor.
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Residences available on {floor.label} of the selected tower.
        </caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-label text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-medium">
              Unit
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Configuration
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Area
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              View
            </th>
            <th scope="col" className="py-2 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {floor.units.map((unit) => {
            const status = UNIT_STATUS_CONFIG[unit.availability];
            const isSelected = selectedUnitId === unit.id;
            const selectable = unit.availability === "available";

            return (
              <tr
                key={unit.id}
                aria-selected={isSelected}
                className={cn(
                  "transition-colors",
                  isSelected ? "bg-primary-50 dark:bg-primary-950/40" : "hover:bg-surface-hover"
                )}
              >
                <td className="py-2.5 pr-4">
                  <button
                    type="button"
                    disabled={!selectable}
                    aria-label={unitAccessibilityLabel(
                      unit.unitNumber,
                      unit.typology,
                      unit.carpetAreaSqft,
                      unit.availability
                    )}
                    onClick={() => selectUnit(unit.id)}
                    className={cn(
                      "font-semibold text-foreground underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      selectable ? "hover:underline" : "cursor-not-allowed text-muted-foreground"
                    )}
                  >
                    {unit.unitNumber}
                  </button>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">{unit.typology}</td>
                <td className="py-2.5 pr-4 numeric text-muted-foreground">
                  {unit.carpetAreaSqft.toLocaleString("en-IN")} sq.ft.
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">{unit.view}</td>
                <td className="py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      status.badgeClass
                    )}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
