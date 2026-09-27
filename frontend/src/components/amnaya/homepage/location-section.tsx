"use client";

/**
 * LocationSection — Section 09.
 *
 * Explains Vision Amnaya's location in Khajaguda, Hyderabad.
 * Positioned at the quiet intersection of the IT corridor and the Osman Sagar catchment.
 * Features `ImageReveal` of `projectAssets.location` and `LuxuryButton` CTA to `routes.location`.
 */

import Link from "next/link";

import { routes } from "@constants/routes";

import { LuxuryButton } from "@components/amnaya/luxury-button";
import { SectionHeading } from "@components/amnaya/section-heading";
import { ImageReveal } from "@components/motion/image-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

export interface LocationSectionProps {
  className?: string;
}

export function LocationSection({ className }: LocationSectionProps) {
  return (
    <section
      id="location"
      className={cn(
        "relative overflow-hidden bg-navy-900 py-24 sm:py-32 lg:py-40 text-neutral-50",
        className
      )}
      aria-label="Amnaya Location — Khajaguda, Hyderabad"
    >
      <Container size="page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column: Location Story */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-8">
            <SectionHeading
              eyebrow="Location"
              title="Khajaguda — Hyderabad's quiet edge"
              description="Khajaguda sits at the intersection of Hyderabad's established IT corridor and the open landscape of the Osman Sagar lake catchment. Within seamless reach of major tech hubs while preserving daily calm."
              align="left"
              inverted
              line
            />

            <div className="mt-2 flex flex-wrap gap-4">
              <LuxuryButton asChild variant="accent" size="md">
                <Link href={routes.location}>Explore Location</Link>
              </LuxuryButton>
            </div>
          </div>

          {/* Right Column: Location Map Render Reveal */}
          <div className="lg:col-span-7">
            <ImageReveal
              src="/assets/amnaya/renders/location.jpg"
              alt="Amnaya — Khajaguda, Hyderabad location context render"
              aspect="landscape"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full shadow-cinematic rounded-card-lg overflow-hidden border border-white/15"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
