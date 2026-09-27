"use client";

/**
 * Hotspots — Interactive 3D HTML Hotspots & Info Card Triggers.
 *
 * Renders elegant, non-intrusive 3D markers using `@react-three/drei`'s `<Html>`.
 * Places markers at verified architectural positions (Clubhouse Spine, 2-Acre Garden,
 * Lake Facing Terrace, 10-Floor Residential Towers, Entrance Stilt).
 */

import { Html } from "@react-three/drei";

import { HOTSPOTS_DATA, useExperienceStore } from "./experience-store";

import { cn } from "@utils/cn";

export function Hotspots() {
  const showHotspots = useExperienceStore((state) => state.showHotspots);
  const activeHotspotId = useExperienceStore((state) => state.activeHotspotId);
  const setActiveHotspotId = useExperienceStore((state) => state.setActiveHotspotId);

  if (!showHotspots) return null;

  return (
    <group>
      {HOTSPOTS_DATA.map((spot) => {
        const isActive = activeHotspotId === spot.id;

        return (
          <Html
            key={spot.id}
            position={spot.position}
            center
            distanceFactor={35}
            zIndexRange={[100, 0]}
          >
            <button
              onClick={() => setActiveHotspotId(isActive ? null : spot.id)}
              className="group relative flex items-center justify-center p-2 focus-visible:outline-none"
              aria-label={`Inspect ${spot.title}`}
            >
              {/* Outer pulsing ring */}
              <span
                className={cn(
                  "absolute h-7 w-7 rounded-full border transition-all duration-300",
                  isActive
                    ? "scale-125 border-accent-400 bg-accent-500/20"
                    : "border-white/60 bg-black/20 group-hover:scale-110 group-hover:border-accent-400"
                )}
              />

              {/* Inner core dot */}
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors duration-300",
                  isActive ? "bg-accent-400 shadow-md" : "bg-white group-hover:bg-accent-300"
                )}
              />

              {/* Label tooltip (desktop hover) */}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
                {spot.title}
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}
