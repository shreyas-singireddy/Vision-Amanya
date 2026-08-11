"use client";

/** ResidenceCard — the listing tile for an individual residence. Default
 * treatment: render over an `ImageCard`, with specs, price and an arrow.
 *
 * Usage:
 *   <ResidenceCard
 *     src="/assets/amnaya/renders/building-day.jpg"
 *     alt="Residence render"
 *     title="The Solace"
 *     price="₹1.6 Cr"
 *     area="1,240 sq.ft."
 *     beds={3} baths={3}
 *     onClick={() => router.push(routes.propertyDetail("solace"))}
 *   />
 */

import { ArrowUpRight, Bath, BedDouble, Ruler } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

import { ImageCard } from "../ui/image-card";
import { PropertyBadge, type PropertyBadgeProps } from "./badges";

export interface ResidenceCardProps {
  src: string;
  alt: string;
  title: string;
  /** Muted meta line under the title, e.g. tower name or phase. */
  subtitle?: string;
  price: string;
  area?: string;
  beds?: number;
  baths?: number;
  badge?: PropertyBadgeProps["status"];
  onClick?: () => void;
  className?: string;
}

export const ResidenceCard = forwardRef<HTMLDivElement, ResidenceCardProps>(
  ({ src, alt, title, subtitle, price, area, beds, baths, badge, onClick, className }, ref) => (
    <ImageCard
      ref={ref}
      src={src}
      alt={alt}
      aspect="landscape"
      onClick={onClick}
      className={cn("h-full", className)}
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="space-y-1">
          {badge ? <PropertyBadge status={badge} /> : null}
          <h3 className="font-serif text-xl font-semibold leading-snug text-neutral-50">{title}</h3>
          {subtitle ? <p className="text-sm text-neutral-50/70">{subtitle}</p> : null}
        </div>
        <ArrowUpRight
          aria-hidden
          className="mt-1 h-5 w-5 shrink-0 text-neutral-50/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-50/80">
        {area ? (
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" aria-hidden />
            {area}
          </span>
        ) : null}
        {beds ? (
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5" aria-hidden />
            {beds} BHK
          </span>
        ) : null}
        {baths ? (
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5" aria-hidden />
            {baths} Bath
          </span>
        ) : null}
      </div>

      <div className="mt-2 border-t border-neutral-50/15 pt-3">
        <span className="numeric text-lg font-semibold tracking-tight text-neutral-50">
          {price}
        </span>
      </div>
    </ImageCard>
  )
);
ResidenceCard.displayName = "ResidenceCard";
