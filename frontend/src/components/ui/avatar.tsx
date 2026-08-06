"use client";

/** Avatar — initials-based identity mark (luxury, minimal). */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

const sizeClasses = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizeClasses;
  /** Fallback initials shown when no `src`/`alt` renders. */
  initials?: string;
  src?: string;
  alt?: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = "md", initials, src, alt, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-surface-subtle font-serif font-medium text-foreground",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initials ?? "VA"}</span>
      )}
    </span>
  )
);
Avatar.displayName = "Avatar";
