"use client";

/** Container — page-width wrapper with responsive horizontal padding.
 *
 * Usage: `<Container size="page">…</Container>` where size maps to the
 * `max-w-*` container tokens (page / wide / narrow / tight / prose).
 */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Size = "page" | "wide" | "narrow" | "tight" | "prose" | "full";

const sizeClasses: Record<Size, string> = {
  page: "max-w-page",
  wide: "max-w-wide",
  narrow: "max-w-narrow",
  tight: "max-w-tight",
  prose: "max-w-prose",
  full: "max-w-none",
};

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  /** Remove the horizontal padding (for flush imagery/grids). */
  flush?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "page", flush = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        !flush && "px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Container.displayName = "Container";
