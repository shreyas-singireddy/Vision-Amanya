"use client";

/**
 * PinnedStorytelling — GSAP ScrollTrigger scrubbed & pinned section.
 *
 * Provides cinematic pinned storytelling for the flagship Amnaya sections
 * (Architecture & Lake/Landscape). Pins the viewport while scrubbed scroll
 * drives image scale, narrative text entry, and visual transitions.
 *
 * Reduced motion renders the story sequentially without pinning.
 */

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useGsap } from "@hooks/use-gsap";

export interface PinnedStorytellingProps {
  id?: string;
  eyebrow: string;
  title: string;
  lead: string;
  primaryImage: string;
  primaryAlt: string;
  secondaryImage?: string;
  secondaryAlt?: string;
  stats?: Array<{ label: string; value: string }>;
}

export function PinnedStorytelling({
  id = "architecture-story",
  eyebrow,
  title,
  lead,
  primaryImage,
  primaryAlt,
  secondaryImage,
  secondaryAlt,
  stats,
}: PinnedStorytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const secondaryImageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();

  useGsap(
    (gsap) => {
      if (
        reduced ||
        !containerRef.current ||
        (typeof window !== "undefined" && window.innerWidth < 1024)
      )
        return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Step 1: Scale image gently
      if (imageRef.current) {
        tl.to(imageRef.current, { scale: 1.08, duration: 1 });
      }

      // Step 2: Slide & fade text in
      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.5"
        );
      }

      // Step 3: Reveal secondary render if present
      if (secondaryImageRef.current) {
        tl.fromTo(
          secondaryImageRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1.2 },
          "+=0.2"
        );
      }
    },
    [reduced],
    { enabled: !reduced }
  );

  if (reduced) {
    return (
      <section id={id} className="py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <span className="text-xs font-medium uppercase tracking-eyebrow text-accent-600 dark:text-accent-400">
                {eyebrow}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-display text-foreground max-w-2xl">
                {title}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {lead}
              </p>
            </div>
            <div className="lg:col-span-6 relative aspect-[16/10] overflow-hidden rounded-card-lg border border-border bg-surface-subtle shadow-card">
              <Image src={primaryImage} alt={primaryAlt} fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-navy-950 text-neutral-50 flex items-center"
    >
      {/* Background Architectural Render */}
      <div ref={imageRef} className="absolute inset-0 scale-100 transition-transform duration-700">
        <Image
          src={primaryImage}
          alt={primaryAlt}
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-transparent" />
      </div>

      {/* Content Overlay Panel */}
      <div className="relative z-10 mx-auto w-full max-w-page px-4 py-24 sm:px-6 lg:px-8">
        <div ref={textRef} className="max-w-2xl flex flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent-400">
            {eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-display text-neutral-50 leading-[1.15]">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl font-light">
            {lead}
          </p>

          {stats && stats.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-6 border-t border-neutral-700/60 pt-6">
              {stats.map((st) => (
                <div key={st.label}>
                  <p className="font-serif text-2xl sm:text-3xl font-medium text-accent-300">
                    {st.value}
                  </p>
                  <p className="text-xs uppercase tracking-eyebrow text-neutral-400 mt-1">
                    {st.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Image Overlay (Optional reveal during pin) */}
      {secondaryImage && (
        <div
          ref={secondaryImageRef}
          className="absolute right-8 bottom-12 z-20 hidden lg:block w-[380px] aspect-[16/10] overflow-hidden rounded-card-lg border border-neutral-700/80 bg-navy-900 shadow-cinematic"
        >
          <Image
            src={secondaryImage}
            alt={secondaryAlt ?? "Amnaya detail render"}
            fill
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}
