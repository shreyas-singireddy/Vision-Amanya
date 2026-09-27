"use client";

/**
 * ArchitecturalGrid — subtle structural grid overlay.
 *
 * Renders a CSS-grid of thin vertical lines that create visual rhythm and an
 * architectural / studio feel in hero panels, full-bleed sections, and gallery
 * moments. The lines are purely decorative and pointer-events: none.
 *
 * Variants:
 *   - "lines"  — vertical column guide lines only (default)
 *   - "cross"  — vertical + horizontal: full grid crosshatch
 *   - "dots"   — dot intersections only (gentler, less distracting)
 *
 * Design rules:
 *   - Always `position: absolute, inset: 0` — the parent must be relative.
 *   - Default opacity is very low (3–5%) — it should be invisible unless looked for.
 *   - On light surfaces use `light` colour; on dark surfaces use `dark` colour.
 *   - Never use on surfaces with dense body copy — this is a spacious section accent.
 *   - Never applies to any layout that would obscure interactive elements.
 *   - Reduced motion: renders statically (already static, no animation).
 */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export type ArchitecturalGridVariant = "lines" | "cross" | "dots";
export type ArchitecturalGridSurface = "light" | "dark";

export interface ArchitecturalGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns — defines the grid rhythm. */
  columns?: 4 | 6 | 8 | 12;
  /** Visual variant. */
  variant?: ArchitecturalGridVariant;
  /** Surface the grid sits on — controls colour. */
  surface?: ArchitecturalGridSurface;
  /** Opacity multiplier (0–1). Overrides the default per-surface opacity. */
  opacity?: number;
}

const COLUMN_GRID: Record<4 | 6 | 8 | 12, string> = {
  4: "grid-cols-4",
  6: "grid-cols-6",
  8: "grid-cols-8",
  12: "grid-cols-12",
};

export const ArchitecturalGrid = forwardRef<HTMLDivElement, ArchitecturalGridProps>(
  ({ columns = 6, variant = "lines", surface = "dark", opacity, className, ...props }, ref) => {
    const defaultOpacity = surface === "dark" ? 0.04 : 0.05;
    const finalOpacity = opacity ?? defaultOpacity;

    const lineColour = surface === "dark" ? "rgba(255,255,255,1)" : "rgba(25,25,23,1)";

    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn("pointer-events-none absolute inset-0", className)}
          aria-hidden
          style={{ opacity: finalOpacity }}
          {...props}
        >
          <div className={cn("h-full w-full grid", COLUMN_GRID[columns])}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="relative">
                {/* Dot rows at every 10% of height */}
                {Array.from({ length: 9 }).map((_, j) => (
                  <div
                    key={j}
                    className="absolute left-0 h-px w-px rounded-full"
                    style={{
                      top: `${(j + 1) * 10}%`,
                      backgroundColor: lineColour,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("pointer-events-none absolute inset-0", className)}
        aria-hidden
        style={{ opacity: finalOpacity }}
        {...props}
      >
        <div className={cn("h-full w-full grid", COLUMN_GRID[columns])}>
          {Array.from({ length: columns - 1 }).map((_, i) => (
            <div key={i} className="relative">
              {/* Vertical guide line (right edge of each cell) */}
              <div
                className="absolute right-0 top-0 h-full w-px"
                style={{ backgroundColor: lineColour }}
              />
              {/* Horizontal guide lines for "cross" variant */}
              {variant === "cross" &&
                Array.from({ length: 9 }).map((_, j) => (
                  <div
                    key={j}
                    className="absolute left-0 h-px w-full"
                    style={{
                      top: `${(j + 1) * 10}%`,
                      backgroundColor: lineColour,
                    }}
                  />
                ))}
            </div>
          ))}
          {/* Last column — add right edge line for "cross" variant */}
          {variant === "cross" && (
            <div className="relative">
              {Array.from({ length: 9 }).map((_, j) => (
                <div
                  key={j}
                  className="absolute left-0 h-px w-full"
                  style={{
                    top: `${(j + 1) * 10}%`,
                    backgroundColor: lineColour,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
ArchitecturalGrid.displayName = "ArchitecturalGrid";
