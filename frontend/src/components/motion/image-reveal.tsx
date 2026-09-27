"use client";

/**
 * Image choreography — premium media reveals built on real project imagery.
 *
 * `ImageReveal` uncovers a photograph with a travelling clip mask while the
 * media settles from a gentle zoom (the classic luxury reveal). `ParallaxImage`
 * layers scroll-linked travel beneath a slightly over-scaled frame.
 *
 * Rules:
 *   - the image is always the hero; motion supports it, never replaces it
 *   - aspect ratios preserve architectural proportions (no distortion)
 *   - Next `<Image>` handles lazy loading / sizing / decoding
 *   - reduced motion renders the still image with no reveal
 */

import { motion } from "framer-motion";
import Image from "next/image";
import { forwardRef, type ElementType } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { easings } from "@constants/design-tokens";

import { clipRevealVariant, getMotionTag, type MotionDirection } from "@lib/motion";

import { cn } from "@utils/cn";

import { Parallax } from "./primitives";

export type ImageAspect = "portrait" | "square" | "landscape" | "wide" | "cinematic";

export const imageAspectClasses: Record<ImageAspect, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  cinematic: "aspect-[21/9]",
};

export interface ImageRevealProps {
  src: string;
  alt: string;
  /** Aspect ratio (preserves architectural proportions). */
  aspect?: ImageAspect;
  /** Edge the mask starts from. */
  direction?: MotionDirection;
  /** Inner settle zoom origin (1 = no zoom). */
  zoom?: number;
  /** Reveal duration in seconds. */
  duration?: number;
  /** Delay in seconds. */
  delay?: number;
  /** Load eagerly (hero imagery only). */
  priority?: boolean;
  /** Responsive `sizes` hint for next/image. */
  sizes?: string;
  /** Render as a different element (default "figure"). */
  as?: ElementType;
  className?: string;
}

/** ImageReveal — clip-path reveal + settle zoom. */
export const ImageReveal = forwardRef<HTMLElement, ImageRevealProps>(
  (
    {
      src,
      alt,
      aspect = "landscape",
      direction = "up",
      zoom = 1.08,
      duration = 1.0,
      delay = 0,
      priority = false,
      sizes = "(min-width: 768px) 50vw, 100vw",
      as = "figure",
      className,
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();
    const MotionTag = getMotionTag(as);

    return (
      <MotionTag
        ref={ref}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={reduced ? undefined : { once: true, margin: "-80px" }}
        variants={reduced ? undefined : clipRevealVariant(direction, duration)}
        className={cn(
          "relative overflow-hidden rounded-card border border-border bg-surface-subtle shadow-card",
          imageAspectClasses[aspect],
          className
        )}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: zoom }}
          whileInView={reduced ? undefined : { scale: 1 }}
          viewport={reduced ? undefined : { once: true, margin: "-80px" }}
          transition={
            reduced ? undefined : { duration: duration + 0.5, ease: easings.outExpo, delay }
          }
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        </motion.div>
      </MotionTag>
    );
  }
);
ImageReveal.displayName = "ImageReveal";

export interface ParallaxImageProps {
  src: string;
  alt: string;
  aspect?: ImageAspect;
  /** Parallax travel strength. */
  strength?: "subtle" | "default" | "strong" | "xl";
  /** Fraction of travel kept on small screens. */
  mobileFactor?: number;
  /** Load eagerly. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/** ParallaxImage — scroll-linked travel beneath an over-scaled frame. The
 *  media over-scales (~1.12) so the frame never reveals its edges. */
export const ParallaxImage = forwardRef<HTMLDivElement, ParallaxImageProps>(
  (
    {
      src,
      alt,
      aspect = "landscape",
      strength = "default",
      mobileFactor = 0.5,
      priority = false,
      sizes = "(min-width: 768px) 50vw, 100vw",
      className,
    },
    ref
  ) => (
    <Parallax
      ref={ref}
      strength={strength}
      mobileFactor={mobileFactor}
      className={cn(
        "relative overflow-hidden rounded-card border border-border bg-surface-subtle shadow-card",
        imageAspectClasses[aspect],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="scale-[1.12] object-cover"
      />
    </Parallax>
  )
);
ParallaxImage.displayName = "ParallaxImage";
