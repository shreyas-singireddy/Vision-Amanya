"use client";

/**
 * ResidenceHero — Architectural hero for an individual residence.
 *
 * Establishes unit identity, typology, floor level, view orientation,
 * and availability status using luxury architectural presentation tokens.
 */

import Link from "next/link";
import { ArrowLeft, Compass, Layers, Maximize2, Sparkles } from "lucide-react";

import { routes } from "@constants/routes";
import type { Residence } from "@domain/residence";

import { PropertyBadge } from "@components/property/badges";
import { LuxuryButton } from "@components/amnaya/luxury-button";
import { ArchitecturalGrid } from "@components/amnaya/architectural-grid";

export interface ResidenceHeroProps {
  residence: Residence;
  onExplore3D?: () => void;
  onViewFloorPlan?: () => void;
}

export function ResidenceHero({ residence, onExplore3D, onViewFloorPlan }: ResidenceHeroProps) {
  const { title, subtitle, typology, location, superBuiltUpAreaSqft } = residence;

  return (
    <div className="relative overflow-hidden bg-[#0A120E] pt-24 pb-16 text-neutral-50 lg:pt-32 lg:pb-24">
      {/* Architectural Background Grid */}
      <ArchitecturalGrid opacity={0.06} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 text-xs uppercase tracking-[0.18em] text-white/60">
          <Link
            href={routes.residences}
            className="group flex items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Residences</span>
          </Link>

          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-white/50 text-[0.625rem]">
            <span>Amnaya</span>
            <span>/</span>
            <span>{location.building}</span>
            <span>/</span>
            <span>Floor {location.floor}</span>
            <span>/</span>
            <span className="text-accent-400 font-semibold">{title}</span>
          </div>
        </div>

        {/* Hero Title & Identity Block */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-accent-400/30 bg-accent-500/10 px-3 py-1 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-accent-400">
                {typology}
              </span>
              <PropertyBadge
                status={residence.listingStatus === "published" ? "available" : "sold-out"}
              />
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                {location.building} · Floor {location.floor}
              </span>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-2 text-base text-white/75 font-light max-w-2xl sm:text-lg">
              {subtitle}
            </p>
          </div>

          {/* Quick Specifications Pill Bar */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 rounded-card border border-white/15 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Maximize2 className="h-4 w-4 text-accent-400 shrink-0" />
                <div>
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-white/60">Area</p>
                  <p className="numeric text-sm font-semibold text-white">
                    {superBuiltUpAreaSqft.toLocaleString()} sq.ft.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Compass className="h-4 w-4 text-accent-400 shrink-0" />
                <div>
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-white/60">
                    Orientation
                  </p>
                  <p className="text-sm font-semibold text-white">{location.view}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-accent-400 shrink-0" />
                <div>
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-white/60">
                    Floor Level
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {location.floor}th of {location.totalFloors}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-accent-400 shrink-0" />
                <div>
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-white/60">
                    Facing
                  </p>
                  <p className="text-sm font-semibold text-white">{location.facing}</p>
                </div>
              </div>
            </div>

            {/* Direct Action Triggers */}
            <div className="flex flex-wrap items-center gap-3">
              {onExplore3D && (
                <LuxuryButton onClick={onExplore3D} variant="accent" size="sm" className="flex-1">
                  Explore in 3D
                </LuxuryButton>
              )}
              {onViewFloorPlan && (
                <LuxuryButton
                  onClick={onViewFloorPlan}
                  variant="ghost"
                  size="sm"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  View Floor Plan
                </LuxuryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
