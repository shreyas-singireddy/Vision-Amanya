"use client";

/**
 * AmenitiesExperience — Section 07.
 *
 * Showcases the 25,000 sq.ft. clubhouse spine across 4 levels.
 * Features wellness, sports courts, guest rooms, and rooftop pool.
 * Uses category tabs with visual previews and MediaBand treatment for the pool.
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { amenityGroups } from "@config/project";
import { routes } from "@constants/routes";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { LuxuryButton } from "@components/amnaya/luxury-button";
import { SectionHeading } from "@components/amnaya/section-heading";
import { ImageReveal } from "@components/motion/image-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

const DEFAULT_IMAGE = {
  src: "/assets/amnaya/renders/clubhouse.jpg",
  alt: "Amnaya — 25,000 sq.ft. clubhouse spine",
};

const AMENITY_IMAGES: Record<string, { src: string; alt: string }> = {
  health: {
    src: "/assets/amnaya/renders/clubhouse.jpg",
    alt: "Amnaya — wellness & gym facilities",
  },
  sports: {
    src: "/assets/amnaya/renders/panorama.jpg",
    alt: "Amnaya — sports courts & rooftop pool",
  },
  family: {
    src: "/assets/amnaya/renders/clubhouse.jpg",
    alt: "Amnaya — 25,000 sq.ft. clubhouse spine",
  },
  leisure: {
    src: "/assets/amnaya/renders/landscape.jpg",
    alt: "Amnaya — indoor games & leisure lounge",
  },
};

export interface AmenitiesExperienceProps {
  className?: string;
}

export function AmenitiesExperience({ className }: AmenitiesExperienceProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const reduced = useReducedMotionPreference();

  const currentGroup = amenityGroups[activeGroupIndex] ?? amenityGroups[0];
  const currentImage = AMENITY_IMAGES[currentGroup?.id ?? "health"] ?? DEFAULT_IMAGE;

  return (
    <section
      id="amenities"
      className={cn(
        "relative overflow-hidden bg-background py-24 sm:py-32 lg:py-40 border-b border-border/40",
        className
      )}
      aria-label="Amnaya Amenities"
    >
      <Container size="page">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Amenities"
            title="25,000 sq.ft. clubhouse spine"
            description="The social and wellness anchor of Amnaya — 4 levels housing sports courts, guest rooms, gym, yoga, and a rooftop pool overlooking the lake."
            align="center"
            line
          />
        </div>

        {/* Category Tabs & Visual Explorer */}
        <div className="mt-16 sm:mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column: Category Navigation */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-3" role="tablist" aria-label="Amenity categories">
              {amenityGroups.map((group, i) => {
                const isActive = activeGroupIndex === i;
                return (
                  <button
                    key={group.id}
                    role="tab"
                    id={`amenity-tab-${group.id}`}
                    aria-selected={isActive}
                    aria-controls={`amenity-panel-${group.id}`}
                    onClick={() => setActiveGroupIndex(i)}
                    className={cn(
                      "group flex items-center justify-between rounded-card p-6 text-left transition-all duration-300",
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-surface-subtle text-foreground border border-border hover:bg-surface-hover"
                    )}
                  >
                    <span className="font-serif text-xl font-medium tracking-tight">
                      {group.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono tracking-widest uppercase transition-colors",
                        isActive ? "text-accent-300" : "text-muted-foreground"
                      )}
                    >
                      0{i + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Group Items List */}
            <div
              id={`amenity-panel-${currentGroup.id}`}
              role="tabpanel"
              aria-labelledby={`amenity-tab-${currentGroup.id}`}
              className="rounded-card border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 font-medium">
                Included in {currentGroup.label}
              </h3>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentGroup.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Visual Render Preview */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg border border-border shadow-cinematic">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGroup.id}
                  className="absolute inset-0"
                  initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageReveal
                    src={currentImage.src}
                    alt={currentImage.alt}
                    aspect="landscape"
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
                      {currentGroup.label}
                    </span>
                    <p className="font-serif text-xl font-medium text-white">
                      25,000 sq.ft. Clubhouse Anchor
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <LuxuryButton asChild variant="primary" size="lg">
            <Link href={routes.amenities}>Discover All Amenities</Link>
          </LuxuryButton>
        </div>
      </Container>
    </section>
  );
}
