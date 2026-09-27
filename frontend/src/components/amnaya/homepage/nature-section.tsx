"use client";

/**
 * NatureSection — Section 05.
 *
 * Full-bleed Lake & Nature experience.
 * Concept: "Where the city meets stillness."
 * Highlights the 25-acre lake view and 2-acre central garden.
 * Imagery-dominated with minimal text and subtle parallax effects.
 */

import { motion } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { ArchitecturalGrid } from "@components/amnaya/architectural-grid";
import { HorizontalLine } from "@components/amnaya/horizontal-line";
import { WordReveal } from "@components/motion/text-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

export interface NatureSectionProps {
  className?: string;
}

export function NatureSection({ className }: NatureSectionProps) {
  const reduced = useReducedMotionPreference();

  return (
    <section
      id="nature"
      className={cn(
        "relative overflow-hidden bg-[#0A1410] py-24 sm:py-32 lg:py-40 text-neutral-50",
        className
      )}
      aria-label="Lake & Nature Experience"
    >
      {/* Subtle atmospheric forest-green glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A1410] via-[#11241c] to-[#0A1410] opacity-80"
        aria-hidden
      />

      <ArchitecturalGrid columns={6} surface="dark" opacity={0.03} />

      <Container size="page" className="relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-accent-400"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8 }}
          >
            The Landscape
          </motion.span>

          <HorizontalLine inverted className="my-6 w-12" />

          <h2 className="font-serif text-display-2 font-medium tracking-display leading-tight text-neutral-50 sm:text-display-1">
            {reduced ? (
              "Where the city meets stillness"
            ) : (
              <WordReveal text="Where the city meets stillness" delay={0.1} />
            )}
          </h2>

          <p className="mt-6 text-lead text-neutral-50/75 font-light leading-relaxed max-w-prose mx-auto">
            Amnaya&apos;s site boundary directly borders twenty-five acres of unhindered lake view,
            anchored internally by two acres of curated central landscape.
          </p>
        </div>

        {/* Full-Bleed Panorama Showcase */}
        <div className="mt-16 sm:mt-20 relative aspect-[16/9] w-full overflow-hidden rounded-card-lg border border-neutral-50/15 shadow-cinematic">
          {/* Main Panorama Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/amnaya/renders/lake-view.jpg"
            alt="Amnaya — 25-acre unobstructed lake view render"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.03]"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1410]/80 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Spec Callouts */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 sm:bottom-10 sm:left-10 sm:right-10">
            <div className="flex items-center gap-4 rounded-full border border-neutral-50/20 bg-black/40 px-6 py-3 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-50/90">
                25-Acre Unobstructed Lake View
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-full border border-neutral-50/20 bg-black/40 px-6 py-3 backdrop-blur-md">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-50/90">
                2-Acre Central Park & Garden
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Asymmetric Landscape Grid */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-neutral-50/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/amnaya/renders/landscape.jpg"
              alt="Amnaya — 2-acre central garden landscape"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-50/60 font-medium">
                Landscape Architecture
              </span>
              <h3 className="mt-1 font-serif text-xl text-neutral-50">Central Garden Sanctuary</h3>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-neutral-50/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/amnaya/renders/panorama.jpg"
              alt="Amnaya — panoramic horizon render"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-50/60 font-medium">
                Horizon Perspective
              </span>
              <h3 className="mt-1 font-serif text-xl text-neutral-50">
                Osman Sagar Catchment Edge
              </h3>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
