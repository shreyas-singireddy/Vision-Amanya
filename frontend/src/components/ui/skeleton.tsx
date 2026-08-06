"use client";

/** Skeleton — shimmer placeholder for loading states. */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800", className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
