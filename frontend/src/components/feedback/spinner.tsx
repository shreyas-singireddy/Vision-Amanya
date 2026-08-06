"use client";

/** Spinner — accessible loading indicator. */

import { Loader2 } from "lucide-react";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Sizing in Tailwind size classes. */
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = "md", label = "Loading", ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary-600", sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </span>
  )
);
Spinner.displayName = "Spinner";
