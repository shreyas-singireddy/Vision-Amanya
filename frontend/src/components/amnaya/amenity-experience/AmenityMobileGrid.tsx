"use client";

/**
 * AmenityMobileGrid — Mobile-first amenity browser for the 3D Amenities page.
 *
 * On small screens, the 3D WebGL canvas is replaced with a responsive masonry-style
 * image grid. Each card shows the real amenity image, name, category, and description.
 * Tapping a card expands an in-place detail view.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { AMENITIES, AMENITY_CATEGORIES, type AmenityCategory, type AmenityItem } from "./amenity-data";
import { cn } from "@utils/cn";

export function AmenityMobileGrid() {
  const [activeCategory, setActiveCategory] = useState<AmenityCategory | null>(null);
  const [activeItem, setActiveItem] = useState<AmenityItem | null>(null);
  const reduced = useReducedMotionPreference();

  const filtered = activeCategory
    ? AMENITIES.filter((a) => a.category === activeCategory)
    : AMENITIES;

  return (
    <div className="flex flex-col gap-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-all duration-200",
            activeCategory === null
              ? "bg-primary-600 text-white shadow-sm"
              : "border border-border bg-card text-muted-foreground hover:bg-surface-hover"
          )}
        >
          All
        </button>
        {AMENITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-all duration-200",
              activeCategory === cat
                ? "bg-primary-600 text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-surface-hover"
            )}
          >
            {cat.split(" & ")[0]}
          </button>
        ))}
      </div>

      {/* Expanded item modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            key={activeItem.id}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-card-lg border border-border bg-card shadow-card overflow-hidden"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.image}
                alt={activeItem.imageAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={() => setActiveItem(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-md hover:text-white focus-visible:outline-none"
                aria-label="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="absolute left-4 bottom-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-accent-300 backdrop-blur-md">
                {activeItem.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-xl font-medium tracking-tight text-foreground">
                {activeItem.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
                {activeItem.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((amenity, i) => (
            <motion.button
              key={amenity.id}
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => setActiveItem(activeItem?.id === amenity.id ? null : amenity)}
              className={cn(
                "group relative overflow-hidden rounded-card border text-left transition-all duration-200",
                activeItem?.id === amenity.id
                  ? "border-primary-500 ring-2 ring-primary-500/30"
                  : "border-border hover:border-border/80 hover:shadow-card"
              )}
              aria-pressed={activeItem?.id === amenity.id}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={amenity.image}
                  alt={amenity.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <p className="absolute bottom-2 left-2 right-2 font-serif text-xs font-medium text-white leading-tight">
                  {amenity.name}
                </p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
