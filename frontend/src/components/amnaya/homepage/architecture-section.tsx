"use client";

/**
 * ArchitectureSection — Section 04.
 *
 * Dedicated architectural exploration section.
 * Concept: "Architecture shaped by light."
 * Explores Amnaya's 10-floor vertical rhythm, double-height stilt entrance,
 * controlled materiality, and deep balcony overhangs.
 *
 * Designed with explicit component boundaries so Phase 6.4's 3D canvas / GLB viewer
 * can be plugged in cleanly.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { ArchitecturalGrid } from "@components/amnaya/architectural-grid";
import { HorizontalLine } from "@components/amnaya/horizontal-line";
import { SectionHeading } from "@components/amnaya/section-heading";
import { ImageReveal } from "@components/motion/image-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

const ARCHITECTURE_FEATURES = [
  {
    id: "elevation",
    title: "Vertical Proportion",
    subtitle: "10 Floors of refined geometry",
    description:
      "Amnaya's 10-floor structure balances vertical elegance with human scale. Deep floor plates ensure structural privacy while maintaining wide daylight apertures.",
    image: "/assets/amnaya/renders/building-day-2.jpg",
    alt: "Amnaya — vertical building elevation render",
    specs: ["10 Floors", "3 BHK Typology", "1,715 – 2,590 sq.ft."],
  },
  {
    id: "entrance",
    title: "Double-Height Entrance",
    subtitle: "Stilt arrival experience",
    description:
      "The ground level features a double-height stilt entrance that elevates the residential towers off the street, providing seamless airflow and an impressive arrival sequence.",
    image: "/assets/amnaya/renders/building-day.jpg",
    alt: "Amnaya — double-height stilt entrance render",
    specs: ["Double-Height Stilt", "Pedestrian Axis", "2-Acre Garden View"],
  },
  {
    id: "balconies",
    title: "Deep Balcony Overhangs",
    subtitle: "Shading & outdoor living",
    description:
      "Generous cantilevered balconies act as passive solar shades, reducing solar heat gain during peak hours while framing direct views over the 25-acre lake.",
    image: "/assets/amnaya/renders/building-mid.jpg",
    alt: "Amnaya — deep balconies render",
    specs: ["Lake View Facing", "Passive Solar Shading", "Integrated Greenery"],
  },
  {
    id: "dusk",
    title: "Materiality & Dusk Light",
    subtitle: "Architectural lighting signature",
    description:
      "At dusk, subtle concealed architectural lighting highlights the clean exterior lines and warm tactile surfaces, creating a distinctive presence along Khajaguda.",
    image: "/assets/amnaya/renders/dusk-building.jpg",
    alt: "Amnaya — dusk building elevation render",
    specs: ["Warm Exterior Lighting", "Tactile Finishes", "Low-Glare Facade"],
  },
] as const;

export function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const reduced = useReducedMotionPreference();

  const activeFeature = ARCHITECTURE_FEATURES[activeTab] ?? ARCHITECTURE_FEATURES[0];

  return (
    <section
      id="architecture"
      className="relative overflow-hidden bg-navy-900 py-24 sm:py-32 lg:py-40 text-neutral-50"
      aria-label="Amnaya Architecture"
    >
      {/* Structural grid overlay */}
      <ArchitecturalGrid columns={6} surface="dark" opacity={0.04} />

      <Container size="page" className="relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Architecture"
            title="Architecture shaped by light"
            description="The Amnaya towers emerge from a considered interplay of mass and void — contemporary geometry married to landscape, framed by deep balconies and controlled materiality."
            align="center"
            inverted
            line
          />
        </div>

        {/* Interactive Feature Selector & Display */}
        <div className="mt-16 sm:mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column: Interactive Navigation & Feature Details */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Feature Tabs */}
            <div className="flex flex-col gap-3" role="tablist" aria-label="Architecture features">
              {ARCHITECTURE_FEATURES.map((feat, i) => {
                const isActive = activeTab === i;
                return (
                  <button
                    key={feat.id}
                    role="tab"
                    id={`arch-tab-${feat.id}`}
                    aria-selected={isActive}
                    aria-controls={`arch-panel-${feat.id}`}
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "group flex flex-col items-start rounded-card p-5 text-left transition-all duration-300",
                      isActive
                        ? "bg-white/10 border border-white/20 shadow-lg"
                        : "bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-mono tracking-wider transition-colors",
                          isActive ? "text-accent-400 font-medium" : "text-neutral-50/40"
                        )}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className={cn(
                          "font-serif text-lg font-medium transition-colors",
                          isActive
                            ? "text-neutral-50"
                            : "text-neutral-50/70 group-hover:text-neutral-50"
                        )}
                      >
                        {feat.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <HorizontalLine inverted />

            {/* Active Feature Description Box */}
            <div
              id={`arch-panel-${activeFeature.id}`}
              role="tabpanel"
              aria-labelledby={`arch-tab-${activeFeature.id}`}
              className="flex flex-col gap-4"
            >
              <h3 className="text-xs uppercase tracking-[0.2em] text-accent-400 font-medium">
                {activeFeature.subtitle}
              </h3>
              <p className="text-base leading-relaxed text-neutral-50/75 font-light">
                {activeFeature.description}
              </p>

              {/* Specs pill list */}
              <div className="mt-2 flex flex-wrap gap-2">
                {activeFeature.specs.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full border border-neutral-50/20 bg-white/5 px-3 py-1 text-xs text-neutral-50/70"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Image Reveal Showcase (Placeholder boundary for 3D GLB in Phase 6.4) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg border border-white/15 bg-black/40 shadow-cinematic">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  className="absolute inset-0"
                  initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageReveal
                    src={activeFeature.image}
                    alt={activeFeature.alt}
                    aspect="landscape"
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                  {/* Subtle architectural gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
