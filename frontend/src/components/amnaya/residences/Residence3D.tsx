"use client";

/**
 * Residence3D — Phase 6.4 3D Architectural Experience Integration.
 *
 * Embeds `<Amnaya3DExperience />` to showcase the 3D building relationship, tower positioning,
 * central garden buffer, and lake orientation for the selected residence.
 */

import { useEffect } from "react";
import { Compass, Layers } from "lucide-react";
import type { Residence } from "@domain/residence";

import { Amnaya3DExperience, useExperienceStore } from "@components/amnaya/experience3d";

export interface Residence3DProps {
  residence: Residence;
  className?: string;
}

export function Residence3D({ residence, className }: Residence3DProps) {
  const { title, location } = residence;
  const setPresetView = useExperienceStore((state) => state.setPresetView);

  // When mounted, set camera preset view according to residence orientation
  useEffect(() => {
    if (location.view === "Lake View") {
      setPresetView("lake");
    } else if (location.view === "Garden View") {
      setPresetView("landscape");
    } else {
      setPresetView("elevation");
    }
  }, [location.view, setPresetView]);

  return (
    <section id="experience-3d" className={`py-16 bg-[#0A120E] text-white ${className || ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-400">
              3D Architectural Context
            </span>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Explore {title} in 3D
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/70">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1">
              <Layers className="h-3.5 w-3.5 text-accent-400" />
              {location.building} · Floor {location.floor}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1">
              <Compass className="h-3.5 w-3.5 text-accent-400" />
              {location.view}
            </span>
          </div>
        </div>

        {/* Reuses Phase 6.4 Amnaya3DExperience */}
        <Amnaya3DExperience modelUrl={residence.media.virtual3DUrl} />

        <p className="mt-4 text-center text-xs text-white/50 tracking-wide">
          * Interactive 3D model allows full camera rotation, day/dusk lighting toggle, and
          architectural hotspot inspection.
        </p>
      </div>
    </section>
  );
}
