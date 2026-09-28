"use client";

/**
 * AmenityDetailPanel — Sliding info panel for the selected amenity.
 *
 * Appears as an overlay panel when an amenity is selected.
 * Shows the real amenity image, name, category, and description.
 * Has prev/next navigation + keyboard support.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useAmenityStore, useActiveAmenity } from "./amenity-store";
import { cn } from "@utils/cn";

export function AmenityDetailPanel() {
  const amenity = useActiveAmenity();
  const isPanelOpen = useAmenityStore((s) => s.isPanelOpen);
  const closePanel = useAmenityStore((s) => s.closePanel);
  const nextAmenity = useAmenityStore((s) => s.nextAmenity);
  const prevAmenity = useAmenityStore((s) => s.prevAmenity);
  const reduced = useReducedMotionPreference();

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPanelOpen) return;
      if (e.key === "Escape") closePanel();
      if (e.key === "ArrowRight") nextAmenity();
      if (e.key === "ArrowLeft") prevAmenity();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPanelOpen, closePanel, nextAmenity, prevAmenity]);

  return (
    <AnimatePresence>
      {isPanelOpen && amenity && (
        <motion.div
          key={amenity.id}
          initial={reduced ? false : { opacity: 0, x: 32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, x: 24, scale: 0.98 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto absolute bottom-6 right-6 top-16 z-30 flex w-[calc(100%-3rem)] max-w-sm flex-col overflow-hidden rounded-card border border-white/15 bg-black/85 shadow-2xl backdrop-blur-xl sm:w-80 md:w-96"
          role="dialog"
          aria-label={`Amenity detail: ${amenity.name}`}
        >
          {/* Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={amenity.image}
              alt={amenity.imageAlt}
              className="h-full w-full object-cover transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Category badge */}
            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-accent-300 backdrop-blur-md">
              {amenity.category}
            </span>

            {/* Close */}
            <button
              onClick={closePanel}
              aria-label="Close amenity detail"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/70 backdrop-blur-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 text-neutral-50">
            <div>
              <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-white">
                {amenity.name}
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-white/75 font-light">{amenity.description}</p>
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
            <button
              onClick={prevAmenity}
              aria-label="Previous amenity"
              className="flex items-center gap-2 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white focus-visible:outline-none"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Prev
            </button>
            <span className="text-[0.625rem] text-white/30 font-mono tracking-widest">
              {amenity.name.slice(0, 14)}
            </span>
            <button
              onClick={nextAmenity}
              aria-label="Next amenity"
              className="flex items-center gap-2 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white focus-visible:outline-none"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
