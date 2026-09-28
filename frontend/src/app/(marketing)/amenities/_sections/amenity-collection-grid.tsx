"use client";

/**
 * AmenityCollectionGrid — Photo showcase of the actual amenity spaces.
 *
 * Uses the real amenity images from public/assets/amnaya/amenities/ to create
 * a premium editorial-style mosaic grid. Clicking any image opens a focused detail view.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Section, SectionHeader } from "@components/layout/section";
import { Reveal } from "@components/motion";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { AMENITIES, type AmenityItem } from "@components/amnaya/amenity-experience";
import { cn } from "@utils/cn";

export function AmenityCollectionGrid() {
  const [activeItem, setActiveItem] = useState<AmenityItem | null>(null);
  const reduced = useReducedMotionPreference();

  return (
    <Section id="amenity-gallery" spacing="lg" tone="light">
      <SectionHeader
        eyebrow="Amenity Spaces"
        title="A space for every pursuit"
        description="Real renders of the Amnaya amenity spaces — from the rooftop pool to the cricket practice net."
        align="center"
      />

      {/* Lightbox */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={reduced ? false : { scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? undefined : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.image}
                alt={activeItem.imageAlt}
                className="h-full w-full object-cover max-h-[80vh]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-12">
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-accent-300">
                  {activeItem.category}
                </span>
                <h3 className="mt-1 font-serif text-xl font-medium text-white">{activeItem.name}</h3>
                <p className="mt-1 text-xs text-white/70 font-light max-w-lg">{activeItem.description}</p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/80 backdrop-blur-md hover:text-white focus-visible:outline-none"
                aria-label="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry-style grid */}
      <div className="mt-16 columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {AMENITIES.map((amenity, i) => (
          <Reveal key={amenity.id} delay={i * 0.04} className="break-inside-avoid">
            <button
              onClick={() => setActiveItem(amenity)}
              className="group relative w-full overflow-hidden rounded-card border border-border block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label={`View ${amenity.name}`}
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden",
                  i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={amenity.image}
                  alt={amenity.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-[0.55rem] font-medium uppercase tracking-[0.14em] text-accent-300">
                    {amenity.category}
                  </span>
                  <p className="font-serif text-sm font-medium text-white leading-tight">
                    {amenity.name}
                  </p>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
