"use client";

/** Grid — responsive architectural grid.
 *
 * Maps a `cols` spec (base / sm / md / lg / xl) to Tailwind `grid-cols-*`
 * utilities. Defaults to a 12-column desktop grid that degrades to 1 column
 * on mobile: use `<Grid cols={{ base: 1, md: 2, lg: 3 }}>` for card grids and
 * `<Grid cols={{ base: 1, lg: 12 }} gap="lg">` for editorial compositions.
 */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Gap = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface GridCols {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count at each breakpoint (1–12). */
  cols?: number | GridCols;
  /** Horizontal + vertical gutter. */
  gap?: Gap;
  /** Vertical gutter only (ignored when `gap` is set). */
  gapY?: Gap;
  /** Align items along the block axis. */
  align?: "start" | "center" | "end" | "stretch";
  /** Rows automatically size to content. */
  autoRows?: boolean;
}

const colClass = (n: number) => `grid-cols-${n}`;

const colSpanClass = (n: number) => (n >= 12 ? "col-span-12" : `col-span-${n}`);

const gapClasses: Record<Gap, string> = {
  none: "gap-0",
  "2xs": "gap-2xs",
  xs: "gap-xs",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
  xl: "gap-xl",
  "2xl": "gap-2xl",
  "3xl": "gap-3xl",
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols = { base: 1, md: 2, lg: 3 },
      gap = "md",
      gapY,
      align = "stretch",
      autoRows = false,
      ...props
    },
    ref
  ) => {
    const columns =
      typeof cols === "number"
        ? colClass(cols)
        : cn(
            cols.base && colClass(cols.base),
            cols.sm && `sm:${colClass(cols.sm)}`,
            cols.md && `md:${colClass(cols.md)}`,
            cols.lg && `lg:${colClass(cols.lg)}`,
            cols.xl && `xl:${colClass(cols.xl)}`
          );

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          columns,
          gap !== "none" ? gapClasses[gap] : gapY ? gapClasses[gapY] : undefined,
          align === "start" && "items-start",
          align === "center" && "items-center",
          align === "end" && "items-end",
          autoRows && "auto-rows-min",
          className
        )}
        {...props}
      />
    );
  }
);
Grid.displayName = "Grid";

/** GridItem — span a grid item across columns (1–12). */
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: number | GridCols;
  /** Push the item to a given column (1-based). */
  start?: number | GridCols;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, span, start, ...props }, ref) => {
    const spanCls =
      typeof span === "number"
        ? colSpanClass(span)
        : span
          ? cn(
              span.base && colSpanClass(span.base),
              span.sm && `sm:${colSpanClass(span.sm)}`,
              span.md && `md:${colSpanClass(span.md)}`,
              span.lg && `lg:${colSpanClass(span.lg)}`,
              span.xl && `xl:${colSpanClass(span.xl)}`
            )
          : undefined;

    const startCls =
      typeof start === "number"
        ? `col-start-${start}`
        : start
          ? cn(
              start.base && `col-start-${start.base}`,
              start.sm && `sm:col-start-${start.sm}`,
              start.md && `md:col-start-${start.md}`,
              start.lg && `lg:col-start-${start.lg}`,
              start.xl && `xl:col-start-${start.xl}`
            )
          : undefined;

    return <div ref={ref} className={cn(spanCls, startCls, className)} {...props} />;
  }
);
GridItem.displayName = "GridItem";
