"use client";

/**
 * AmenityNav — Category filter + amenity selector for the 3D experience.
 *
 * Renders a horizontal scroll pill bar for categories and an amenity list
 * below, both driven by the amenity store.
 */

import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useAmenityStore } from "./amenity-store";
import {
  AMENITIES,
  AMENITY_CATEGORIES,
  getAmenitiesByCategory,
  type AmenityCategory,
} from "./amenity-data";
import { cn } from "@utils/cn";

export function AmenityNav() {
  const activeCategory = useAmenityStore((s) => s.activeCategory);
  const activeAmenityId = useAmenityStore((s) => s.activeAmenityId);
  const setCategory = useAmenityStore((s) => s.setCategory);
  const selectAmenity = useAmenityStore((s) => s.selectAmenity);
  const reduced = useReducedMotionPreference();

  const filteredAmenities = activeCategory ? getAmenitiesByCategory(activeCategory) : AMENITIES;

  return (
    <div className="pointer-events-auto flex flex-col gap-3 max-h-full">
      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] transition-all duration-250",
            activeCategory === null
              ? "bg-white text-neutral-950 font-semibold shadow-sm"
              : "border border-white/20 bg-black/50 text-white/70 hover:bg-white/15 hover:text-white backdrop-blur-md"
          )}
        >
          All
        </button>
        {AMENITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === activeCategory ? null : (cat as AmenityCategory))}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] transition-all duration-250",
              activeCategory === cat
                ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                : "border border-white/20 bg-black/50 text-white/70 hover:bg-white/15 hover:text-white backdrop-blur-md"
            )}
          >
            {cat.split(" & ")[0]}
          </button>
        ))}
      </div>

      {/* Amenity list */}
      <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[180px] sm:max-h-[220px]">
        <AnimatePresence mode="popLayout">
          {filteredAmenities.map((amenity, i) => {
            const isActive = activeAmenityId === amenity.id;
            return (
              <motion.button
                key={amenity.id}
                layout
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => selectAmenity(isActive ? null : amenity.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[0.6rem] font-medium tracking-wide transition-all duration-250",
                  isActive
                    ? "bg-accent-500 text-neutral-950 font-semibold shadow-md shadow-accent-500/30"
                    : "border border-white/15 bg-black/40 text-white/75 hover:bg-white/15 hover:text-white backdrop-blur-md"
                )}
                aria-pressed={isActive}
              >
                {amenity.name}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
