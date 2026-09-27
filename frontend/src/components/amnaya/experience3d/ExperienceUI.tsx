"use client";

/**
 * ExperienceUI — Luxury 2D Controls & Info Card Overlay for 3D Scene.
 *
 * Renders understated, brand-aligned UI controls over the 3D canvas using Phase 6.2 design system tokens.
 * Provides camera preset selection, Day/Dusk lighting toggle, reset view, and hotspot information cards.
 */

import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { LuxuryButton } from "@components/amnaya/luxury-button";
import {
  CAMERA_PRESETS,
  HOTSPOTS_DATA,
  type PresetViewMode,
  useExperienceStore,
} from "./experience-store";

import { cn } from "@utils/cn";

export function ExperienceUI() {
  const presetView = useExperienceStore((state) => state.presetView);
  const timeOfDay = useExperienceStore((state) => state.timeOfDay);
  const activeHotspotId = useExperienceStore((state) => state.activeHotspotId);
  const showHotspots = useExperienceStore((state) => state.showHotspots);

  const setPresetView = useExperienceStore((state) => state.setPresetView);
  const setTimeOfDay = useExperienceStore((state) => state.setTimeOfDay);
  const setActiveHotspotId = useExperienceStore((state) => state.setActiveHotspotId);
  const setShowHotspots = useExperienceStore((state) => state.setShowHotspots);
  const resetView = useExperienceStore((state) => state.resetView);

  const reduced = useReducedMotionPreference();

  const activeHotspot = HOTSPOTS_DATA.find((h) => h.id === activeHotspotId);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* ── Top Bar: Development Badge & Time of Day Switcher ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Development Placeholder Indicator */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-white/90">
            3D Architecture · CAD GLB Pipeline
          </span>
        </div>

        {/* Day / Dusk Lighting Toggle */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/20 bg-black/60 p-1 backdrop-blur-md">
          <button
            onClick={() => setTimeOfDay("day")}
            className={cn(
              "rounded-full px-3.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] transition-all duration-300",
              timeOfDay === "day"
                ? "bg-accent-500 text-neutral-950 shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Day
          </button>
          <button
            onClick={() => setTimeOfDay("dusk")}
            className={cn(
              "rounded-full px-3.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] transition-all duration-300",
              timeOfDay === "dusk"
                ? "bg-accent-500 text-neutral-950 shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Dusk
          </button>
        </div>
      </div>

      {/* ── Active Hotspot Information Card Overlay ────────────────────────── */}
      <AnimatePresence>
        {activeHotspot && (
          <div className="pointer-events-auto mx-auto max-w-md w-full my-auto">
            <motion.div
              key={activeHotspot.id}
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-card border border-white/20 bg-black/80 p-6 shadow-2xl backdrop-blur-xl text-neutral-50"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveHotspotId(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white text-xs font-mono p-1"
                aria-label="Close hotspot info"
              >
                ✕
              </button>

              <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-400">
                {activeHotspot.category}
              </span>
              <h3 className="mt-1 font-serif text-2xl font-medium tracking-tight text-white">
                {activeHotspot.title}
              </h3>
              <p className="mt-0.5 text-xs text-white/70 font-medium tracking-wide">
                {activeHotspot.subtitle}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-white/80 font-light">
                {activeHotspot.description}
              </p>

              {activeHotspot.specs && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeHotspot.specs.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[0.625rem] text-white/90"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls Bar: Camera View Presets & Reset ───────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* Preset Camera Views Pill Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-full border border-white/20 bg-black/60 p-1.5 backdrop-blur-md overflow-x-auto max-w-full">
          {Object.values(CAMERA_PRESETS).map((preset) => {
            const isActive = presetView === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setPresetView(preset.id as PresetViewMode)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[0.625rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 shrink-0",
                  isActive
                    ? "bg-white text-neutral-950 font-semibold shadow-md"
                    : "text-white/75 hover:bg-white/15 hover:text-white"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Utility Controls (Reset & Hotspots Toggle) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
          >
            {showHotspots ? "Hide Hotspots" : "Show Hotspots"}
          </button>

          <LuxuryButton
            onClick={resetView}
            variant="ghost"
            size="sm"
            arrow={false}
            className="border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20"
          >
            Reset View
          </LuxuryButton>
        </div>
      </div>
    </div>
  );
}
