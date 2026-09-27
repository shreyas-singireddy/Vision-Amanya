"use client";

/**
 * FinalCTA — Section 10.
 *
 * The flagship conversion experience ending the homepage narrative.
 * Concept: "Your view begins here."
 * Features primary LuxuryButton & MagneticButton CTAs over a dusk architectural render.
 */

import Link from "next/link";
import { motion } from "framer-motion";

import { routes } from "@constants/routes";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { ArchitecturalGrid } from "@components/amnaya/architectural-grid";
import { HorizontalLine } from "@components/amnaya/horizontal-line";
import { LuxuryButton } from "@components/amnaya/luxury-button";
import { MagneticButton } from "@components/amnaya/magnetic-button";
import { WordReveal } from "@components/motion/text-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

export interface FinalCTAProps {
  className?: string;
}

export function FinalCTA({ className }: FinalCTAProps) {
  const reduced = useReducedMotionPreference();

  return (
    <section
      id="enquire"
      className={cn(
        "relative overflow-hidden bg-navy-950 py-28 sm:py-36 lg:py-44 text-neutral-50",
        className
      )}
      aria-label="Enquire & Schedule Site Visit"
    >
      {/* Background Render Layer */}
      <div className="absolute inset-0 scale-[1.04]" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/amnaya/renders/dusk-building.jpg"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/85 to-navy-950/60" />
      </div>

      <ArchitecturalGrid columns={6} surface="dark" opacity={0.04} />

      <Container size="narrow" className="relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.span
            className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-accent-400"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8 }}
          >
            Private Consultation
          </motion.span>

          <HorizontalLine inverted className="my-6 w-12" />

          {/* Heading */}
          <h2 className="font-serif text-display-2 font-medium tracking-display leading-tight text-neutral-50 sm:text-display-1">
            {reduced ? (
              "Your view begins here"
            ) : (
              <WordReveal text="Your view begins here" delay={0.1} />
            )}
          </h2>

          {/* Subtext */}
          <p className="mt-6 text-lead text-neutral-50/75 font-light leading-relaxed max-w-prose">
            Schedule a private site visit or connect with our sales experience team to explore
            Khajaguda&apos;s premier lake-facing residences.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <LuxuryButton asChild variant="accent" size="lg">
              <Link href={routes.contact}>Schedule a Private Visit</Link>
            </LuxuryButton>

            <MagneticButton radius={36}>
              <Link href={routes.contact}>Enquire Now</Link>
            </MagneticButton>
          </div>

          {/* Project Details Pill Bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 border-t border-neutral-50/15 pt-8 text-xs font-medium uppercase tracking-[0.2em] text-neutral-50/50">
            <span>Vision Infra Developers</span>
            <span>•</span>
            <span>Khajaguda, Hyderabad</span>
            <span>•</span>
            <span>420 Residences</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
