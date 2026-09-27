"use client";

/**
 * CinematicStatement — Section 02.
 *
 * A bold, editorial statement section following the immersive hero.
 * Sets the emotional tone of Vision Amnaya with high-impact typography,
 * generous negative space, architectural grid lines, and word reveal motion.
 *
 * Rules:
 *   - Clean typography hierarchy using Cormorant Garamond & Geist
 *   - Architectural corner marks for visual luxury accent
 *   - Full accessibility & reduced-motion support
 */

import { motion } from "framer-motion";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { ArchitecturalGrid } from "@components/amnaya/architectural-grid";
import { HorizontalLine } from "@components/amnaya/horizontal-line";
import { WordReveal } from "@components/motion/text-reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

export interface CinematicStatementProps {
  quote?: string;
  author?: string;
  className?: string;
}

export function CinematicStatement({
  quote = "Where Khajaguda meets the lake, architecture learns to breathe.",
  author = "Vision Amnaya — Khajaguda, Hyderabad",
  className,
}: CinematicStatementProps) {
  const reduced = useReducedMotionPreference();

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background py-24 sm:py-32 lg:py-40 border-b border-border/40",
        className
      )}
      aria-label="Amnaya design philosophy statement"
    >
      {/* Structural architectural background grid */}
      <ArchitecturalGrid columns={6} surface="light" opacity={0.03} />

      <Container size="narrow" className="relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Eyebrow kicker */}
          <motion.span
            className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-accent-600 dark:text-accent-400"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            The Identity
          </motion.span>

          {/* Center decorative accent line */}
          <HorizontalLine className="my-6 w-12" duration={0.8} delay={0.1} />

          {/* Main statement heading */}
          <h2 className="font-serif text-display-2 font-medium leading-[1.12] tracking-display text-foreground sm:text-[3.25rem] lg:text-[3.75rem]">
            {reduced ? quote : <WordReveal text={quote} delay={0.2} stagger={0.06} />}
          </h2>

          {/* Attribution / Location subline */}
          <motion.p
            className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {author}
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
