"use client";

/**
 * SectionHeading — animated editorial section header.
 *
 * The canonical heading block for major page sections. Wraps the typography
 * system with optional motion (TextReveal eyebrow, WordReveal headline,
 * fade-up description, and optional HorizontalLine beneath).
 *
 * This is NOT a replacement for `SectionTitle` — use `SectionTitle` inside
 * dashboards and utility views. `SectionHeading` is the premium cinematic
 * version for marketing pages.
 *
 * Props:
 *   eyebrow     — small tracked caps kicker (e.g. "Architecture", "Residences")
 *   title       — the main display heading (animated word reveal)
 *   description — optional one-sentence lead
 *   align       — left (editorial default) or center (hero moments)
 *   inverted    — true on dark/dusk surfaces
 *   line        — show an animated HorizontalLine below the eyebrow
 *   animate     — false disables all motion (opt-out per instance)
 *
 * Motion behaviour:
 *   - eyebrow: clip reveal (ltr), delay 0
 *   - line: draw ltr, delay 0.1
 *   - title: word reveal, delay 0.2
 *   - description: fade up, delay 0.5
 */

import { motion } from "framer-motion";
import { forwardRef, type HTMLAttributes } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { WordReveal } from "@components/motion/text-reveal";

import { cn } from "@utils/cn";

import { HorizontalLine } from "./horizontal-line";

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Tracked caps kicker above the title. */
  eyebrow?: string;
  /** Main display title — receives WordReveal animation. */
  title: string;
  /** Optional lead sentence below the title. */
  description?: string;
  /** Block alignment. */
  align?: "left" | "center";
  /** Inverted voice for dark surfaces. */
  inverted?: boolean;
  /** Show an animated horizontal line below the eyebrow. */
  line?: boolean;
  /** Heading level for document outline. */
  as?: "h1" | "h2" | "h3";
  /** Disable all motion on this instance. */
  animate?: boolean;
  /** max-width class for the description (prose by default). */
  descriptionWidth?: string;
}

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  (
    {
      eyebrow,
      title,
      description,
      align = "left",
      inverted = false,
      line = false,
      as: Tag = "h2",
      animate = true,
      descriptionWidth = "max-w-prose",
      className,
      ...props
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();
    const shouldAnimate = animate && !reduced;
    const centered = align === "center";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          centered ? "items-center text-center" : "items-start text-left",
          className
        )}
        {...props}
      >
        {/* Eyebrow */}
        {eyebrow ? (
          <motion.span
            className={cn(
              "inline-block text-[0.6875rem] font-medium uppercase tracking-[0.22em]",
              inverted ? "text-accent-400" : "text-accent-600"
            )}
            initial={shouldAnimate ? { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" } : false}
            whileInView={shouldAnimate ? { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            viewport={shouldAnimate ? { once: true, margin: "-60px" } : undefined}
            transition={
              shouldAnimate ? { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0 } : undefined
            }
          >
            {eyebrow}
          </motion.span>
        ) : null}

        {/* Optional animated line */}
        {line ? (
          <HorizontalLine inverted={inverted} duration={0.8} delay={0.1} className="mt-4 w-12" />
        ) : null}

        {/* Title — WordReveal or plain */}
        <Tag
          className={cn(
            "mt-4 font-serif font-medium tracking-display",
            "text-display-2 leading-[1.08]",
            inverted ? "text-neutral-50" : "text-foreground"
          )}
        >
          {shouldAnimate ? <WordReveal text={title} delay={line || eyebrow ? 0.2 : 0} /> : title}
        </Tag>

        {/* Description */}
        {description ? (
          <motion.p
            className={cn(
              "mt-6 text-lead leading-relaxed",
              inverted ? "text-neutral-50/70" : "text-muted-foreground",
              centered && descriptionWidth
            )}
            initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
            whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            viewport={shouldAnimate ? { once: true, margin: "-60px" } : undefined}
            transition={
              shouldAnimate ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 } : undefined
            }
          >
            {description}
          </motion.p>
        ) : null}
      </div>
    );
  }
);
SectionHeading.displayName = "SectionHeading";
