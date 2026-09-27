"use client";

/**
 * ResidencesPreview — Section 06.
 *
 * Previews the 3 BHK residential offerings at Vision Amnaya.
 * Sized generously (1,715 – 2,590 sq.ft.) across 10 floors.
 * Shows interior lifestyle moments and floor plan previews.
 * CTA routes to `routes.properties`.
 */

import Link from "next/link";

import { routes } from "@constants/routes";

import { LuxuryButton } from "@components/amnaya/luxury-button";
import { SectionHeading } from "@components/amnaya/section-heading";
import { HoverReveal } from "@components/motion/primitives";
import { Reveal } from "@components/motion/reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

const RESIDENCE_HIGHLIGHTS = [
  {
    title: "The Living Suite",
    subtitle: "Fluid open-plan living",
    size: "Generous layout",
    description:
      "High ceilings and expansive glass openings connecting the main living salon directly onto the private balcony.",
    image: "/assets/amnaya/renders/hero-day.jpg",
    alt: "Amnaya — living suite render",
  },
  {
    title: "Master Sanctuary",
    subtitle: "Designed for deep rest",
    size: "Ensuite + Walk-in",
    description:
      "Positioned along the quietest orientation with dedicated dressing zones and unobstructed morning light.",
    image: "/assets/amnaya/renders/panorama.jpg",
    alt: "Amnaya — master bedroom views",
  },
  {
    title: "Deep Cantilevered Balconies",
    subtitle: "Outdoor living room",
    size: "Deep overhangs",
    description:
      "Private outdoor terraces acting as natural shaded extensions of the interior living space overlooking the lake.",
    image: "/assets/amnaya/renders/landscape.jpg",
    alt: "Amnaya — deep balcony outdoor terrace",
  },
] as const;

export interface ResidencesPreviewProps {
  className?: string;
}

export function ResidencesPreview({ className }: ResidencesPreviewProps) {
  return (
    <section
      id="residences"
      className={cn(
        "relative overflow-hidden bg-background py-24 sm:py-32 lg:py-40 border-b border-border/40",
        className
      )}
      aria-label="Amnaya Residences Preview"
    >
      <Container size="page">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Residences"
            title="Three-bedroom living, reimagined"
            description="Every residence at Amnaya is a 3 BHK configuration ranging from 1,715 to 2,590 sq.ft. — sized to live generously, with zero compromised space."
            align="center"
            line
          />
        </div>

        {/* 3 BHK Residence Cards Grid */}
        <div className="mt-16 sm:mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {RESIDENCE_HIGHLIGHTS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <HoverReveal preset="lift" className="h-full">
                <div className="group flex h-full flex-col overflow-hidden rounded-card-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-elevated">
                  {/* Image Header */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute top-4 right-4 rounded-full bg-background/80 px-3 py-1 text-[0.625rem] font-medium uppercase tracking-wider text-foreground backdrop-blur-sm">
                      {item.size}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div>
                      <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400">
                        {item.subtitle}
                      </span>
                      <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </HoverReveal>
            </Reveal>
          ))}
        </div>

        {/* Floor Plan Quick Facts Strip */}
        <div className="mt-16 rounded-card border border-border bg-surface-subtle p-8 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Unit Range
              </span>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">
                1,715 – 2,590 sq.ft.
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Configuration
              </span>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">
                3 BHK Residences
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Total Units
              </span>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">420 Residences</p>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-12 flex justify-center">
          <LuxuryButton asChild variant="accent" size="lg">
            <Link href={routes.properties}>Explore All Residences</Link>
          </LuxuryButton>
        </div>
      </Container>
    </section>
  );
}
