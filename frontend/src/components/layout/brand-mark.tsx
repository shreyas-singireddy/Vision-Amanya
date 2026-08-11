"use client";

/** BrandMark — the Amnaya wordmark.
 *
 * A serif lock-up: "Amnaya" in display type with a small tracked "VISION
 * AMNAYA" or "BY VISION INFRA" kicker beneath. Inverted variant for dark
 * surfaces (header over hero, footer).
 */

import Link from "next/link";

import { routes } from "@constants/routes";

import { cn } from "@utils/cn";

export interface BrandMarkProps {
  /** Dark-surface voice. */
  inverted?: boolean;
  /** Compact lock-up (no sub-line) — used in footers. */
  compact?: boolean;
  className?: string;
}

export function BrandMark({ inverted = false, compact = false, className }: BrandMarkProps) {
  return (
    <Link
      href={routes.home}
      aria-label="Amnaya — home"
      className={cn(
        "group inline-flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm",
        className
      )}
    >
      <span
        className={cn(
          "font-serif text-2xl font-medium tracking-display transition-colors duration-fast ease-standard",
          inverted ? "text-neutral-50" : "text-foreground"
        )}
      >
        Amnaya
      </span>
      {!compact ? (
        <span
          className={cn(
            "text-[0.625rem] font-medium uppercase tracking-eyebrow transition-colors duration-fast ease-standard",
            inverted ? "text-neutral-50/60" : "text-muted-foreground"
          )}
        >
          by Vision Infra
        </span>
      ) : null}
    </Link>
  );
}
