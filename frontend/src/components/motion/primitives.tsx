"use client";

/**
 * Motion primitives — the reusable component vocabulary of the Motion
 * Experience Engine.
 *
 * Every primitive:
 *   - is strongly typed with sensible defaults
 *   - respects `prefers-reduced-motion` (renders statically)
 *   - animates only transform / opacity / filter (GPU-composited)
 *   - composes the shared `@lib/motion` variant factories and token values
 *
 * Framer Motion owns these component-level entrances/exits and state
 * transitions. GSAP is reserved for scroll-pinned cinematic sequences
 * (`useGsap`). Keep this file free of business content.
 */

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef, type ElementType, type RefObject } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useParallax as useParallaxMotion } from "@hooks/use-parallax";
import { useIsDesktop } from "@hooks/use-media-query";

import {
  fadeVariant,
  fadeOutVariant,
  scrollFadeVariant,
  scrollSlideVariant,
  scrollScaleVariant,
  zoomRevealVariant,
  withDelay,
  motionBlur,
  motionHover,
  motionParallax,
  getMotionTag,
  type MotionDirection,
  type MotionParallax,
} from "@lib/motion";

import { cn } from "@utils/cn";

/* --- Shared scroll-reveal plumbing -------------------------------------- */

interface BaseRevealProps extends HTMLMotionProps<"div"> {
  /** Render as a different HTML element. */
  as?: ElementType;
  /** Play once (default) or re-run on every in-view. */
  once?: boolean;
  /** IntersectionObserver margin. */
  margin?: string;
  /** Delay in seconds before the entrance. */
  delay?: number;
}

/** Renders a `whileInView` motion element with the given variant pair,
 *  skipping animation entirely under reduced motion. */
const ScrollRevealBase = forwardRef<HTMLDivElement, BaseRevealProps & { variants: Variants }>(
  (
    { as = "div", once = true, margin = "-80px", delay = 0, variants, className, ...props },
    ref
  ) => {
    const reduced = useReducedMotionPreference();
    const MotionTag = getMotionTag(as);
    const active = !reduced;

    return (
      <MotionTag
        ref={ref}
        className={className}
        initial={active ? "hidden" : false}
        whileInView={active ? "visible" : undefined}
        viewport={active ? { once, margin } : undefined}
        variants={active ? withDelay(variants, delay) : undefined}
        {...props}
      />
    );
  }
);
ScrollRevealBase.displayName = "ScrollRevealBase";

/* --- Fade ---------------------------------------------------------------- */

export interface FadeProps extends BaseRevealProps {
  /** Pure fade duration in seconds. */
  duration?: number;
}

/** Fade — opacity-only reveal. The quietest entrance. */
export const Fade = forwardRef<HTMLDivElement, FadeProps>(({ duration = 0.7, ...props }, ref) => (
  <ScrollRevealBase ref={ref} variants={fadeVariant(duration)} {...props} />
));
Fade.displayName = "Fade";

/** FadeIn — alias of `Fade` for naming symmetry with the exit. */
export const FadeIn = Fade;

export interface FadeOutProps extends HTMLMotionProps<"div"> {
  /** Exit duration in seconds. */
  duration?: number;
}

/** FadeOut — opacity exit. Render inside `<AnimatePresence>` so `exit`
 *  plays before the element unmounts. */
export const FadeOut = forwardRef<HTMLDivElement, FadeOutProps>(
  ({ duration = 0.3, ...props }, ref) => {
    const reduced = useReducedMotionPreference();
    return (
      <motion.div
        ref={ref}
        initial={reduced ? false : "visible"}
        animate="visible"
        exit={reduced ? undefined : "exit"}
        variants={reduced ? undefined : fadeOutVariant(duration)}
        {...props}
      />
    );
  }
);
FadeOut.displayName = "FadeOut";

/* --- Slide --------------------------------------------------------------- */

export interface SlideInProps extends BaseRevealProps {
  /** Direction to travel from. */
  direction?: MotionDirection;
  /** Travel distance in px. */
  distance?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Fade while sliding (default true). */
  fade?: boolean;
}

/** SlideIn — directional entrance. `fade={false}` drops the opacity layer
 *  for surfaces whose metaphor is pure travel (drawers, tall imagery). */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ direction = "up", distance = 40, duration = 0.6, fade = true, ...props }, ref) => {
    const variants = fade
      ? scrollFadeVariant(duration)
      : scrollSlideVariant(direction, distance, duration);
    return <ScrollRevealBase ref={ref} variants={variants} {...props} />;
  }
);
SlideIn.displayName = "SlideIn";

/** Slide — alias of `SlideIn`. */
export const Slide = SlideIn;

/* --- Scale --------------------------------------------------------------- */

export interface ScaleInProps extends BaseRevealProps {
  /** Initial scale. */
  from?: number;
  /** Duration in seconds. */
  duration?: number;
}

/** ScaleIn — scale + fade reveal (cards, media tiles, dialog surfaces). */
export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ from = 0.96, duration = 0.6, ...props }, ref) => (
    <ScrollRevealBase ref={ref} variants={scrollScaleVariant(from, duration)} {...props} />
  )
);
ScaleIn.displayName = "ScaleIn";

/* --- Blur ---------------------------------------------------------------- */

export interface BlurRevealProps extends BaseRevealProps {
  /** Blur radius token. */
  blur?: keyof typeof motionBlur;
  /** Duration in seconds. */
  duration?: number;
}

/** BlurReveal — a defocus → focus entrance. The filter is animated (never a
 *  static style) so the element sharpens as it arrives. Use sparingly: blur
 *  is a costly filter. */
export const BlurReveal = forwardRef<HTMLDivElement, BlurRevealProps>(
  ({ blur = "md", duration = 0.9, ...props }, ref) => (
    <ScrollRevealBase
      ref={ref}
      variants={zoomRevealVariant(1, motionBlur[blur], duration)}
      {...props}
    />
  )
);
BlurReveal.displayName = "BlurReveal";

/** ScrollReveal — explicit name for the base `Reveal` primitive. */
export { Reveal as ScrollReveal } from "./reveal";

/* --- Hover --------------------------------------------------------------- */

export type HoverPreset = "lift" | "zoom" | "elevate" | "glow";

export interface HoverRevealProps extends HTMLMotionProps<"div"> {
  /** Interaction choreography. */
  preset?: HoverPreset;
}

const hoverVariantFor: Record<HoverPreset, Variants> = {
  lift: {
    rest: { y: 0 },
    hover: { y: motionHover.lift, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  },
  zoom: {
    rest: { scale: 1 },
    hover: { scale: motionHover.zoom, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
  },
  elevate: {
    rest: { boxShadow: "0 1px 2px rgb(25 25 23 / 0.05), 0 12px 32px -16px rgb(13 33 26 / 0.18)" },
    hover: {
      boxShadow: "0 24px 48px -16px rgb(13 33 26 / 0.3)",
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  },
  glow: {
    rest: { boxShadow: "0 0 0 0px rgb(163 116 74 / 0)" },
    hover: {
      boxShadow: "0 0 0 4px rgb(163 116 74 / 0.16), 0 12px 32px -10px rgb(134 92 57 / 0.3)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

/** HoverReveal — rest → hover interaction wrapper. Subtle by design:
 *  transform/box-shadow only, token-curve timing, never a game. */
export const HoverReveal = forwardRef<HTMLDivElement, HoverRevealProps>(
  ({ preset = "lift", className, children, ...props }, ref) => {
    const reduced = useReducedMotionPreference();

    if (reduced) {
      return (
        <motion.div ref={ref} className={className} initial={false} {...props}>
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn("will-change-transform", className)}
        initial="rest"
        whileHover="hover"
        variants={hoverVariantFor[preset]}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverReveal.displayName = "HoverReveal";

/* --- Parallax ------------------------------------------------------------ */

export interface ParallaxProps extends HTMLMotionProps<"div"> {
  /** Travel strength token. */
  strength?: MotionParallax;
  /** Direct px travel (overrides `strength`). */
  distance?: number;
  /** Fraction of travel kept on small screens (default 0.5). */
  mobileFactor?: number;
  /** Disable parallax entirely (reduced motion always disables it). */
  disabled?: boolean;
}

/** Parallax — scroll-linked vertical travel for a block. Defaults to
 *  `MEDIUM` imagery depth; on mobile the travel is halved and under
 *  reduced motion it is disabled. */
export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  (
    {
      strength = "default",
      distance,
      mobileFactor = 0.5,
      disabled = false,
      style,
      className,
      ...props
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();
    const isDesktop = useIsDesktop();
    const active = !reduced && !disabled;

    const base = distance ?? motionParallax[strength];
    const travel = isDesktop ? base : base * mobileFactor;

    const { ref: scopeRef, y } = useParallaxMotion({ distance: travel });

    const setRefs = (node: HTMLDivElement | null) => {
      (scopeRef as RefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <motion.div
        ref={setRefs}
        className={cn("will-change-transform", className)}
        style={{ y: active ? y : 0, ...style }}
        {...props}
      />
    );
  }
);
Parallax.displayName = "Parallax";

/* --- Section transition -------------------------------------------------- */

export interface SectionTransitionProps extends HTMLMotionProps<"section"> {
  /** Surface theme for the storytelling band. */
  theme?: "light" | "dark";
  /** Reveal choreography. */
  reveal?: "fade" | "slide" | "scale" | "clip";
  /** Render as a different element (default "section"). */
  as?: ElementType;
}

const sectionThemeClasses = {
  light: "bg-background text-foreground",
  dark: "bg-grad-dusk text-neutral-50",
} as const;

const sectionVariants: Record<NonNullable<SectionTransitionProps["reveal"]>, Variants> = {
  fade: fadeVariant(0.8),
  slide: scrollSlideVariant("up", 48, 0.8),
  scale: scrollScaleVariant(0.97, 0.8),
  clip: zoomRevealVariant(0.98, 8, 0.9),
};

/** SectionTransition — a major storytelling band that enters cinematically.
 *  Use it to move between light → dark, image → text, architecture →
 *  lifestyle. No Amnaya content is hardcoded here. */
export const SectionTransition = forwardRef<HTMLElement, SectionTransitionProps>(
  ({ theme = "light", reveal = "slide", as = "section", className, ...props }, ref) => {
    const reduced = useReducedMotionPreference();
    const MotionTag = getMotionTag(as);

    return (
      <MotionTag
        ref={ref}
        className={cn(sectionThemeClasses[theme], className)}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={reduced ? undefined : { once: true, margin: "-120px" }}
        variants={reduced ? undefined : sectionVariants[reveal]}
        {...props}
      />
    );
  }
);
SectionTransition.displayName = "SectionTransition";
