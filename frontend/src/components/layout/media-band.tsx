"use client";

/** MediaBand — a cinematic, full-bleed parallax moment between sections.
 *
 * A photographic pause: over-scaled imagery drifting against a fixed scrim,
 * carrying a single line of copy when supplied. Sits flush to the viewport —
 * the `Section` wrapper (or page) provides the surface around it.
 */

import { motion } from "framer-motion";

import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { ParallaxImage } from "@components/motion/image-reveal";

import { cn } from "@utils/cn";

export interface MediaBandProps {
  image: { src: string; alt: string };
  eyebrow?: string;
  /** A single statement overlaid on the band. */
  title?: string;
  /** Height of the band. */
  height?: "compact" | "default" | "tall";
  className?: string;
}

const heightClasses = {
  compact: "py-28",
  default: "py-40",
  tall: "py-56",
} as const;

export function MediaBand({
  image,
  eyebrow,
  title,
  height = "default",
  className,
}: MediaBandProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0" aria-hidden>
        <ParallaxImage
          src={image.src}
          alt={image.alt}
          aspect="wide"
          strength="xl"
          priority={false}
          className="h-full w-full rounded-none border-0 shadow-none"
        />
      </div>
      <div className="absolute inset-0 bg-grad-hero-overlay" aria-hidden />
      <Container
        className={cn("relative z-10 flex items-center justify-center", heightClasses[height])}
      >
        <motion.div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          {eyebrow ? <Eyebrow className="text-accent-400">{eyebrow}</Eyebrow> : null}
          {title ? (
            <DisplayHeading as="h2" level={2} className="text-neutral-50">
              {title}
            </DisplayHeading>
          ) : null}
        </motion.div>
      </Container>
    </section>
  );
}
