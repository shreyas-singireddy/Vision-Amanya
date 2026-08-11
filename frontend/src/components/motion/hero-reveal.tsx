"use client";

/**
 * Hero choreography — the flagship layered entrance sequence.
 *
 * Sequence: background enters and settles → overlay fades → eyebrow draws →
 * headline rises → subheading → CTAs → secondary visual detail. Each layer
 * is a reusable motion item driven by the `@lib/motion/hero` variant set, so
 * every future page can compose its own hero from these pieces.
 *
 * Components:
 *   `HeroReveal` — orchestrates the layered sequence.
 *   `HeroDepth`  — pointer-driven layered parallax for the background.
 *   `HeroRule`   — gold hairline that draws across before type arrives.
 *
 * Reduced motion renders the hero statically (image + content, no entrance,
 * no pointer drift). No business copy is hardcoded here.
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useCallback, type ReactNode } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import {
  heroBackgroundVariant,
  heroContainerVariant,
  heroItemVariant,
  heroOverlayVariant,
  heroRuleVariant,
} from "@lib/motion";

import { cn } from "@utils/cn";

export interface HeroRevealProps {
  /** Background media (real project imagery). */
  background?: { src: string; alt: string; priority?: boolean };
  /** Eyebrow layer (render an `Eyebrow` or plain text). */
  eyebrow?: ReactNode;
  /** Headline layer — render a heading element or `TextReveal`. */
  headline: ReactNode;
  /** Supporting copy layer. */
  subheading?: ReactNode;
  /** Primary/secondary action layer. */
  actions?: ReactNode;
  /** Secondary visual detail (bottom meta, scroll cue…). */
  secondary?: ReactNode;
  /** Horizontal alignment of the content block. */
  align?: "left" | "center";
  /** Minimum height of the hero (default full viewport). */
  minHeight?: string;
  /** Fade the overlay scrim over the background. */
  overlay?: boolean;
  /** Enable pointer-driven background drift (desktop only). */
  depth?: boolean;
  className?: string;
}

/** HeroReveal — the luxury entrance sequence for any marketing hero. */
export function HeroReveal({
  background,
  eyebrow,
  headline,
  subheading,
  actions,
  secondary,
  align = "left",
  minHeight = "min-h-[92vh]",
  overlay = true,
  depth = true,
  className,
}: HeroRevealProps) {
  const reduced = useReducedMotionPreference();

  const animate = reduced ? false : "visible";
  const center = align === "center";

  return (
    <section
      className={cn(
        "relative flex overflow-hidden bg-grad-hero text-neutral-50",
        center ? "items-center justify-center text-center" : "items-center",
        minHeight,
        className
      )}
    >
      {background ? (
        <div className="absolute inset-0 scale-[1.06]" aria-hidden>
          <HeroDepth enabled={depth && !reduced}>
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate={animate}
              variants={reduced ? undefined : heroBackgroundVariant()}
            >
              <Image
                src={background.src}
                alt={background.alt}
                fill
                priority={background.priority ?? true}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </HeroDepth>
        </div>
      ) : null}

      {overlay ? (
        <motion.div
          className="absolute inset-0 bg-grad-hero-overlay"
          initial="hidden"
          animate={animate}
          variants={reduced ? undefined : heroOverlayVariant()}
          aria-hidden
        />
      ) : null}

      <motion.div
        className={cn(
          "relative z-10 mx-auto w-full max-w-hero px-4 py-28 sm:px-6 lg:px-8",
          center ? "flex flex-col items-center" : ""
        )}
        initial="hidden"
        animate={animate}
        variants={reduced ? undefined : heroContainerVariant()}
      >
        {eyebrow ? (
          <motion.div
            variants={reduced ? undefined : heroItemVariant("luxury")}
            className={cn(center ? "flex justify-center" : "")}
          >
            {eyebrow}
          </motion.div>
        ) : null}

        <motion.div
          variants={reduced ? undefined : heroItemVariant("luxury")}
          className={cn("mt-6", center ? "flex justify-center" : "")}
        >
          {headline}
        </motion.div>

        {subheading ? (
          <motion.div
            variants={reduced ? undefined : heroItemVariant("elegant")}
            className={cn("mt-6 max-w-2xl", center && "mx-auto")}
          >
            {subheading}
          </motion.div>
        ) : null}

        {actions ? (
          <motion.div
            variants={reduced ? undefined : heroItemVariant("elegant")}
            className={cn("mt-10 flex flex-wrap gap-4", center && "justify-center")}
          >
            {actions}
          </motion.div>
        ) : null}

        {secondary ? (
          <motion.div
            variants={reduced ? undefined : heroItemVariant("minimal")}
            className={cn("mt-16", center && "flex justify-center")}
          >
            {secondary}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}

export interface HeroDepthProps {
  /** Pointer-driven drift enabled. */
  enabled?: boolean;
  /** Drift strength in px. */
  strength?: number;
  className?: string;
  children?: ReactNode;
}

/** HeroDepth — the background layer follows the cursor by a few px,
 *  creating a calm sense of depth without ever revealing edges (callers
 *  over-scale the layer ~1.06x). Disabled on touch/reduced motion. */
export function HeroDepth({ enabled = true, strength = 10, className, children }: HeroDepthProps) {
  const reduced = useReducedMotionPreference();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const x = useTransform(sx, (v) => v * -strength);
  const y = useTransform(sy, (v) => v * -strength);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      mx.set(event.clientX / window.innerWidth - 0.5);
      my.set(event.clientY / window.innerHeight - 0.5);
    },
    [mx, my]
  );

  const onMouseLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  if (!enabled || reduced) {
    return <div className={cn("absolute inset-0", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("absolute inset-0", className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

/** HeroRule — a gold hairline that draws across before the type arrives. */
export function HeroRule({ className }: { className?: string }) {
  const reduced = useReducedMotionPreference();
  return (
    <motion.span
      className={cn("block h-px w-16 bg-accent-500", className)}
      initial={reduced ? false : "hidden"}
      animate={reduced ? undefined : "visible"}
      variants={reduced ? undefined : heroRuleVariant()}
    />
  );
}
