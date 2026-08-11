"use client";

/** LoadingState — full-section loading placeholder: a large framed skeleton
 * beside editorial text lines. Pairs with `Skeleton` and `Spinner`. */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

import { Skeleton } from "./skeleton";
import { Spinner } from "../feedback/spinner";

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Leading image placeholder (e.g. property gallery render). */
  withImage?: boolean;
  label?: string;
  /** Show a spinner instead of the image skeleton. */
  spinner?: boolean;
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, withImage = true, label = "Loading", spinner = false, ...props }, ref) => (
    <div
      ref={ref}
      aria-busy="true"
      aria-label={label}
      className={cn("grid gap-md md:grid-cols-2", className)}
      {...props}
    >
      {spinner ? (
        <div className="flex min-h-56 items-center justify-center rounded-card-lg border border-border bg-surface-subtle">
          <Spinner size="lg" label={label} />
        </div>
      ) : withImage ? (
        <Skeleton className="min-h-56 rounded-card-lg" />
      ) : null}
      <div className="space-y-md py-md">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
);
LoadingState.displayName = "LoadingState";
