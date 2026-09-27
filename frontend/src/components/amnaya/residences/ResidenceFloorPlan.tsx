"use client";

/**
 * ResidenceFloorPlan — Dedicated layout viewer integrating Phase 6.5.
 *
 * Differentiates:
 *   - UNIT PLAN: Specific architectural plan for the selected residence.
 *   - FLOOR PLAN: Typical floor block layout showing unit placement on the tower floor.
 * Reuses Phase 6.5 `<FloorPlanExplorer />` component for configuration comparison.
 */

import { useState } from "react";
import Link from "next/link";
import { Compass, Expand, Layout, Ruler } from "lucide-react";
import type { Residence } from "@domain/residence";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { IconButton } from "@components/ui/icon-button";
import { FloorPlanExplorer, type FloorPlan } from "@components/property/floor-plan-explorer";

export interface ResidenceFloorPlanProps {
  residence: Residence;
}

export function ResidenceFloorPlan({ residence }: ResidenceFloorPlanProps) {
  const [activeTab, setActiveTab] = useState<"unit" | "floor">("unit");

  const { title, media, location, superBuiltUpAreaSqft, carpetAreaSqft } = residence;

  const floorPlansData: FloorPlan[] = [
    {
      id: "unit-plan",
      tabLabel: "Unit Plan",
      title: `${title} Layout`,
      area: `${superBuiltUpAreaSqft} sq.ft. (Carpet: ${carpetAreaSqft} sq.ft.)`,
      note: `${location.facing} · ${location.view}`,
      src: media.unitPlanUrl,
      alt: media.unitPlanAlt,
      description: `Individual apartment plan for ${title} on Floor ${location.floor}. Designed with cross-ventilation, deep balconies, and ensuite bedrooms.`,
      tag: "Unit Layout",
    },
    {
      id: "floor-plan",
      tabLabel: "Block Floor Plan",
      title: `${location.building} — Typical Floor Plan`,
      note: `10 Floors · ${location.building}`,
      src: media.floorPlanUrl,
      alt: media.floorPlanAlt,
      description: `Typical block layout for ${location.building} framing 10 floors of 3 BHK residences with central elevator core and garden sightlines.`,
      tag: "Tower Block",
      ctaLabel: "Return to Floor Plan Explorer",
    },
  ];

  return (
    <section id="floor-plan" className="py-16 bg-surface-subtle border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
              Architectural Layout
            </span>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Unit Plan & Floor Block Context
            </h2>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setActiveTab("unit")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition-all ${
                activeTab === "unit"
                  ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unit Plan
            </button>
            <button
              onClick={() => setActiveTab("floor")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition-all ${
                activeTab === "floor"
                  ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Block Floor Plan
            </button>
          </div>
        </div>

        {/* Dynamic Display */}
        {activeTab === "unit" ? (
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Unit Plan Stage */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-card-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.unitPlanUrl}
                    alt={media.unitPlanAlt}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <IconButton
                      aria-label="Expand unit floor plan"
                      icon={Expand}
                      variant="glass"
                      size="md"
                      className="absolute bottom-8 right-8 shadow-lg"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{title} — Dedicated Unit Plan</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 flex max-h-[75vh] items-center justify-center p-4 bg-neutral-950 rounded-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.unitPlanUrl}
                        alt={media.unitPlanAlt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Unit Specs Card */}
            <div className="lg:col-span-5 flex flex-col gap-6 rounded-card-lg border border-border bg-card p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 font-medium">
                <Layout className="h-4 w-4" />
                <span>Dedicated Unit Plan</span>
              </div>

              <h3 className="font-serif text-2xl font-medium text-foreground">
                {title} Configuration
              </h3>

              <dl className="flex flex-col gap-3 text-sm border-y border-border py-4">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Ruler className="h-4 w-4" /> Super Built-Up Area
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {superBuiltUpAreaSqft.toLocaleString()} sq.ft.
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Ruler className="h-4 w-4" /> Carpet Area
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {carpetAreaSqft.toLocaleString()} sq.ft.
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Compass className="h-4 w-4" /> Facing & View
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {location.facing} · {location.view}
                  </dd>
                </div>
              </dl>

              <Button asChild variant="outline" size="md" className="w-full">
                <Link href={routes.properties}>Explore All Configurations (Phase 6.5)</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Reuses Phase 6.5 FloorPlanExplorer for typical block layout */
          <FloorPlanExplorer plans={floorPlansData} />
        )}
      </div>
    </section>
  );
}
