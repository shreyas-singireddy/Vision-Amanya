"use client";

/** Stack — flex layout with a consistent gap from the spacing scale.
 *
 * The primary composition primitive: vertical stacks for card bodies,
 * horizontal stacks for metadata rows, and `inline` stacks for icon groups.
 */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Gap = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

type Align = "start" | "center" | "end" | "stretch" | "baseline";

type Justify = "start" | "center" | "end" | "between" | "around";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout direction. */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  /** Whether items wrap (rows only). */
  wrap?: boolean;
  /** Gap from the semantic spacing scale. */
  gap?: Gap;
  /** Cross-axis alignment. */
  align?: Align;
  /** Main-axis justification. */
  justify?: Justify;
  /** Constrain to a one-line `inline-flex` row. */
  inline?: boolean;
}

const gapClasses: Record<Gap, string> = {
  "2xs": "gap-2xs",
  xs: "gap-xs",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
  xl: "gap-xl",
  "2xl": "gap-2xl",
  "3xl": "gap-3xl",
  "4xl": "gap-4xl",
};

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = "column",
      wrap = false,
      gap = "md",
      align = "stretch",
      justify = "start",
      inline = false,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        inline ? "inline-flex" : "flex",
        direction === "column" && "flex-col",
        direction === "row" && "flex-row",
        direction === "row-reverse" && "flex-row-reverse",
        direction === "column-reverse" && "flex-col-reverse",
        wrap && "flex-wrap",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    />
  )
);
Stack.displayName = "Stack";
