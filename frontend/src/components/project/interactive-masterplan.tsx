"use client";

/**
 * InteractiveMasterplan — Premium site masterplan presentation for Amnaya.
 *
 * Uses the verified Amnaya masterplan render (`masterplan01`).
 * Interactive verified hotspots allow visitors to explore:
 * 1. 2-Acre Central Garden
 * 2. 25,000 sq.ft. Clubhouse & Rooftop Pool
 * 3. Residential Towers (420 3 BHK residences)
 * 4. Double-Height Stilt Entrance
 * 5. 25-Acre Lake View Corridor
 *
 * Supports zoom controls ([-], [Reset], [+]), hotspot highlight drawers,
 * and mobile touch interactions.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Info, MapPin } from "lucide-react";
import { projectAssets } from "@config/project";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

interface Hotspot {
  id: string;
  name: string;
  category: string;
  x: number; // percentage from left
  y: number; // percentage from top
  description: string;
  specs: string[];
}

const hotspots: Hotspot[] = [
  {
    id: "garden",
    name: "2-Acre Central Garden",
    category: "Landscape",
    x: 42,
    y: 52,
    description:
      "A landscaped green buffer separating residential towers from the main approach road. Serves as the community's open-air sanctuary.",
    specs: ["2 Acres landscaped area", "Pedestrian walkways", "Children's play zone"],
  },
  {
    id: "clubhouse",
    name: "25,000 sq.ft. Clubhouse & Rooftop Pool",
    category: "Amenities",
    x: 65,
    y: 48,
    description:
      "Four levels dedicated to wellness, indoor sports, guest suites, and a rooftop swimming pool overlooking the green horizon.",
    specs: ["25,000 sq.ft. area", "Rooftop pool", "Badminton & squash courts"],
  },
  {
    id: "towers",
    name: "Residential Towers",
    category: "Architecture",
    x: 35,
    y: 35,
    description:
      "420 three-bedroom residences across 10 floors, oriented to maximize daylight, cross ventilation, and lake views.",
    specs: ["420 Residences", "10 Floors height", "1,715 - 2,590 sq.ft. sizes"],
  },
  {
    id: "entrance",
    name: "Double-Height Stilt Entrance",
    category: "Arrival",
    x: 22,
    y: 68,
    description:
      "Grand double-height arrival plaza providing a clear view of the central garden from the moment residents arrive.",
    specs: ["Double-height clearance", "Security gatehouse", "Drop-off concourse"],
  },
  {
    id: "lake-view",
    name: "25-Acre Lake View Corridor",
    category: "Nature",
    x: 78,
    y: 28,
    description:
      "Unobstructed northern exposure facing the 25-acre natural lake catchment, preserved across all upper levels.",
    specs: ["25-Acre water body", "North-facing orientation", "Protected view corridor"],
  },
];

export function InteractiveMasterplan() {
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const reduced = useReducedMotionPreference();

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1.0));
  const handleReset = () => {
    setZoom(1);
    setActiveHotspot(null);
  };

  const handleSelectHotspot = (hs: Hotspot) => {
    setActiveHotspot(hs);
    if (zoom === 1) setZoom(1.35);
  };

  return (
    <div className="relative flex flex-col gap-6">
      {/* Masterplan Viewer Canvas */}
      <div className="relative overflow-hidden rounded-card-lg border border-border bg-surface-subtle shadow-cinematic select-none min-h-[420px] sm:min-h-[560px]">
        {/* Controls Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-3 py-1.5 shadow-md backdrop-blur-md">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Zoom out masterplan"
            className="p-1.5 text-foreground hover:text-accent-600 disabled:opacity-40 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 2.0}
            aria-label="Zoom in masterplan"
            className="p-1.5 text-foreground hover:text-accent-600 disabled:opacity-40 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="h-3 w-px bg-border mx-1" aria-hidden />
          <button
            onClick={handleReset}
            aria-label="Reset masterplan zoom"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Masterplan Image & Hotspots Wrapper */}
        <motion.div
          className="relative w-full h-full min-h-[420px] sm:min-h-[560px] flex items-center justify-center"
          animate={{ scale: zoom }}
          transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={projectAssets.masterplan01}
            alt="Vision Amnaya — Official site masterplan"
            width={2341}
            height={1718}
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="h-auto w-full object-contain max-h-[75vh]"
          />

          {/* Interactive Hotspot Overlay Pins */}
          {hotspots.map((hs) => {
            const isActive = activeHotspot?.id === hs.id;
            return (
              <button
                key={hs.id}
                onClick={() => handleSelectHotspot(hs)}
                aria-label={`Highlight ${hs.name}`}
                style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group focus:outline-none"
              >
                <span className="relative flex h-7 w-7 items-center justify-center">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                      isActive ? "bg-accent-400" : "bg-accent-500/50 group-hover:bg-accent-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-md transition-transform duration-300 ${
                      isActive
                        ? "bg-accent-500 text-neutral-950 scale-125"
                        : "bg-surface text-foreground group-hover:scale-110"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden sm:block whitespace-nowrap rounded bg-background/90 px-2 py-0.5 text-[10px] font-medium tracking-eyebrow text-foreground opacity-0 group-hover:opacity-100 shadow-sm transition-opacity">
                  {hs.name}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Selected Hotspot Detail Drawer / Panel */}
      <AnimatePresence mode="wait">
        {activeHotspot ? (
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="rounded-card border border-accent-500/40 bg-surface-subtle p-6 shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-eyebrow text-accent-600 dark:text-accent-400">
                  {activeHotspot.category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground mt-1">
                  {activeHotspot.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Close details
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {activeHotspot.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeHotspot.specs.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                >
                  <Info className="h-3 w-3 text-accent-500" />
                  {spec}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between rounded-card border border-border bg-surface-subtle px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Click any hotspot pin on the masterplan to inspect key zones.
            </p>
            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
              <span>Site: 5.3 Acres</span>
              <span>•</span>
              <span>Towers: 10 Floors</span>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
