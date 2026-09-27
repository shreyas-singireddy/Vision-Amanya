"use client";

/**
 * ResidenceSummary — Verified specifications and location breakdown.
 *
 * Displays structured specification items grouped by category (Architecture, Dimensions,
 * Orientation, Possession). Strictly filters out missing or null fields.
 */

import {
  Bath,
  BedDouble,
  Calendar,
  Compass,
  Layers,
  Maximize2,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import type { Residence } from "@domain/residence";
import { SpecList } from "@components/property/specs";

export interface ResidenceSummaryProps {
  residence: Residence;
}

export function ResidenceSummary({ residence }: ResidenceSummaryProps) {
  const {
    unitNumber,
    typology,
    location,
    bedrooms,
    bathrooms,
    superBuiltUpAreaSqft,
    carpetAreaSqft,
    possessionDate,
    amenityHighlights,
  } = residence;

  // Build verified spec items with icons
  const specItems = [
    { label: "Unit Number", value: unitNumber, icon: Warehouse },
    { label: "Building", value: location.building, icon: Layers },
    { label: "Floor Level", value: `${location.floor}th Floor`, icon: Layers },
    { label: "Typology", value: typology, icon: BedDouble },
    {
      label: "Super Built-Up",
      value: `${superBuiltUpAreaSqft.toLocaleString()} sq.ft.`,
      icon: Maximize2,
    },
    { label: "Carpet Area", value: `${carpetAreaSqft.toLocaleString()} sq.ft.`, icon: Maximize2 },
    { label: "Bedrooms", value: `${bedrooms} BHK`, icon: BedDouble },
    { label: "Bathrooms", value: `${bathrooms} Bathrooms`, icon: Bath },
    { label: "Facing", value: location.facing, icon: Compass },
    { label: "View", value: location.view, icon: Compass },
    ...(possessionDate ? [{ label: "Possession", value: possessionDate, icon: Calendar }] : []),
  ];

  return (
    <section
      id="specifications"
      className="py-16 bg-background text-foreground border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
            Residence Specifications
          </span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Verified Details & Layout Metrics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{residence.summary}</p>
        </div>

        {/* Spec Items Grid */}
        <div className="mt-10 rounded-card-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <SpecList items={specItems} />
        </div>

        {/* Amenity Highlights */}
        {amenityHighlights && amenityHighlights.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Residence Features & Highlights
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {amenityHighlights.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-1.5 text-xs text-foreground font-medium"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
