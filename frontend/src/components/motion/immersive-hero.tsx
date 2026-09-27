"use client";

/**
 * ImmersiveHero — The flagship homepage architectural scene.
 *
 * Creates a genuine 2.5D depth experience using layered renders and
 * spring-based pointer tracking. Each layer responds to cursor movement
 * at a different intensity, creating the perception of a physical
 * architectural photograph with depth.
 *
 * Depth layers (outermost → innermost, slowest → fastest):
 *   Layer 0: Atmospheric sky gradient   — 1–2px  (barely moves)
 *   Layer 1: Hero architectural render  — 3–5px  (main image)
 *   Layer 2: Foreground scrim vignette  — 6–8px  (depth card)
 *   Layer 3: Typography content         — 1–2px  (subtle counter-move)
 *
 * The hero also responds to scroll via GSAP ScrollTrigger (parallax
 * scale 1.0 → 1.04 pushing slightly upward), creating a seamless
 * transition into the architecture story section below.
 *
 * Rules:
 *   - Maximum pointer translation: ±10px per layer
 *   - Spring stiffness: 40, damping: 16 (physically organic)
 *   - Reduced motion: static render, no pointer drift, no scroll animation
 *   - Image always covers the viewport (scale-[1.08] on background)
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useIsDesktop } from "@hooks/use-media-query";
import { useGsap } from "@hooks/use-gsap";
import { projectConfig } from "@config/project";
import { routes } from "@constants/routes";
import { ctaConfig } from "@config/cta";
import { ArchitecturalGrid, LuxuryButton, ScrollIndicator } from "@components/amnaya";

export interface ImmersiveHeroProps {
  /** Primary hero render — the architectural scene. */
  heroSrc: string;
  heroAlt: string;
}

/** Spring config — physically organic, never bouncy */
const SPRING = { stiffness: 42, damping: 18, mass: 0.8 };

/** Layer strength multipliers (fraction of full pointer offset) */
const DEPTH = {
  sky: 0.12, // barely moves — 1–2px at max
  building: 0.45, // main image — 3–5px
  foreground: 0.85, // front scrim — 6–9px
  type: -0.1, // counter-move — slightly opposite direction
} as const;

/** Maximum pointer drift in px (applied at edge of viewport) */
const MAX_DRIFT = 12;

export function ImmersiveHero({ heroSrc, heroAlt }: ImmersiveHeroProps) {
  const reduced = useReducedMotionPreference();
  const isDesktop = useIsDesktop();
  const activeDepth = isDesktop && !reduced;
  const sectionRef = useRef<HTMLElement>(null);

  // Pointer motion values (normalised –0.5 → +0.5)
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, SPRING);
  const py = useSpring(pyRaw, SPRING);

  // Layer transforms
  const skyX = useTransform(px, (v) => v * MAX_DRIFT * DEPTH.sky);
  const skyY = useTransform(py, (v) => v * MAX_DRIFT * DEPTH.sky);

  const bldX = useTransform(px, (v) => v * MAX_DRIFT * DEPTH.building);
  const bldY = useTransform(py, (v) => v * MAX_DRIFT * DEPTH.building);

  const fgX = useTransform(px, (v) => v * MAX_DRIFT * DEPTH.foreground);
  const fgY = useTransform(py, (v) => v * MAX_DRIFT * DEPTH.foreground);

  const tyX = useTransform(px, (v) => v * MAX_DRIFT * DEPTH.type);
  const tyY = useTransform(py, (v) => v * MAX_DRIFT * DEPTH.type);

  // GSAP: scroll-driven hero parallax
  useGsap(
    (gsap) => {
      if (!sectionRef.current) return;
      gsap.to(sectionRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    [],
    { enabled: !reduced && isDesktop }
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!activeDepth) return;
      pxRaw.set(e.clientX / window.innerWidth - 0.5);
      pyRaw.set(e.clientY / window.innerHeight - 0.5);
    },
    [pxRaw, pyRaw, activeDepth]
  );

  const onMouseLeave = useCallback(() => {
    pxRaw.set(0);
    pyRaw.set(0);
  }, [pxRaw, pyRaw]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex min-h-[100svh] w-full overflow-hidden bg-[#0B130E]"
      aria-label="Amnaya hero — luxury residences at Khajaguda, Hyderabad"
    >
      {/* ── LAYER 0: Deep atmospheric base gradient (sky) ──────────────── */}
      <motion.div
        className="absolute inset-0 scale-[1.04]"
        style={reduced ? {} : { x: skyX, y: skyY }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e24] via-[#111d18] to-[#0a1410]" />
        <ArchitecturalGrid columns={6} surface="dark" opacity={0.03} />
      </motion.div>

      {/* ── LAYER 1: Primary architectural render ──────────────────────── */}
      <motion.div
        className="absolute inset-0 scale-[1.08]"
        style={reduced ? {} : { x: bldX, y: bldY }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>

      {/* ── LAYER 2: Cinematic scrim / foreground vignette ─────────────── */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? {} : { x: fgX, y: fgY }}
        aria-hidden
      >
        {/* Bottom-weighted gradient — primary overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,20,16,0.92) 0%, rgba(10,20,16,0.40) 40%, rgba(10,20,16,0.15) 65%, rgba(10,20,16,0.55) 100%)",
          }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        />

        {/* Left-side gradient for typography readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,20,16,0.65) 0%, rgba(10,20,16,0.15) 55%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ── LAYER 3: Typography & Content ─────────────────────────────── */}
      <motion.div
        className="relative z-10 flex w-full flex-col justify-end pb-16 sm:pb-20 lg:pb-24"
        style={reduced ? {} : { x: tyX, y: tyY }}
      >
        <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:px-8 xl:px-16">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="block h-px w-10 bg-[#a3744a]" aria-hidden />
              <span className="text-[0.625rem] font-medium uppercase tracking-[0.28em] text-neutral-50/80">
                {projectConfig.location}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-medium text-neutral-50 leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.5rem, 2rem + 4vw, 4.75rem)", maxWidth: "18ch" }}
            >
              Where Khajaguda meets the lake
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base sm:text-lg text-neutral-50/75 font-light leading-relaxed"
              style={{ maxWidth: "42ch" }}
            >
              {projectConfig.fullName} — 420 premium 3 BHK residences across 5.3 acres, framed by 2
              acres of central garden and an unobstructed 25-acre lake view.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.38, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <LuxuryButton asChild variant="accent" size="lg">
                <Link href={routes.contact}>{ctaConfig.enquireNow.label}</Link>
              </LuxuryButton>

              <LuxuryButton asChild variant="ghost" size="lg">
                <Link href={routes.project}>{ctaConfig.exploreProject.label}</Link>
              </LuxuryButton>
            </motion.div>
          </div>

          {/* ── Bottom metadata bar ──────────────────────────────── */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.6 }}
            className="mt-16 flex flex-wrap items-end justify-between gap-4 lg:mt-20"
          >
            {/* Project specs */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {["420 Residences", "3 BHK", "1,715 – 2,590 sq.ft."].map((spec, i) => (
                <span key={spec} className="flex items-center gap-4">
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-neutral-50/55">
                    {spec}
                  </span>
                  {i < 2 && <span className="block h-px w-4 bg-neutral-50/25" aria-hidden />}
                </span>
              ))}
            </div>

            {/* Scroll cue */}
            <ScrollIndicator className="hidden sm:flex" />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Architectural corner marks ────────────────────────── */}
      <ArchitecturalCorners reduced={reduced} />
    </section>
  );
}

/** Thin architectural corner marks — visual luxury detail */
function ArchitecturalCorners({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-6 sm:inset-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.5 }}
      aria-hidden
    >
      {/* Top-left */}
      <div className="absolute left-0 top-0 h-8 w-8 border-l border-t border-neutral-50/15" />
      {/* Top-right */}
      <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-neutral-50/15" />
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-neutral-50/15" />
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-neutral-50/15" />
    </motion.div>
  );
}
