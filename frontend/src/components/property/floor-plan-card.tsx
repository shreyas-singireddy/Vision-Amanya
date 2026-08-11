"use client";

/** FloorPlanCard — plan sheet tile with a square of the floor-plan render,
 * type (2/3/4 BHK), area, and an expand affordance. */

import { Expand, Ruler } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

import { ImageCard } from "../ui/image-card";

export interface FloorPlanCardProps {
  src: string;
  alt: string;
  type: string;
  area: string;
  /** Short descriptor, e.g. "Lake-facing" or "Corner". */
  note?: string;
  onClick?: () => void;
  className?: string;
}

export const FloorPlanCard = forwardRef<HTMLDivElement, FloorPlanCardProps>(
  ({ src, alt, type, area, note, onClick, className }, ref) => (
    <ImageCard
      ref={ref}
      src={src}
      alt={alt}
      aspect="square"
      onClick={onClick}
      className={cn("h-full", className)}
    >
      <div className="flex items-end justify-between gap-sm">
        <div className="space-y-0.5">
          <h4 className="font-serif text-lg font-semibold leading-snug text-neutral-50">{type}</h4>
          <p className="inline-flex items-center gap-1.5 text-sm text-neutral-50/75">
            <Ruler className="h-3.5 w-3.5" aria-hidden />
            {area}
          </p>
          {note ? (
            <p className="text-xs uppercase tracking-label text-neutral-50/60">{note}</p>
          ) : null}
        </div>
        <Expand
          aria-hidden
          className="h-4.5 w-4.5 shrink-0 text-neutral-50/80 transition-transform duration-200 group-hover:scale-110"
          strokeWidth={1.75}
        />
      </div>
    </ImageCard>
  )
);
FloorPlanCard.displayName = "FloorPlanCard";
