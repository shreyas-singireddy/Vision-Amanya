"use client";

/**
 * CinematicIntro — First-visit architectural entrance sequence for Amnaya.
 *
 * Sequence (~1.8s):
 * 1. Deep architectural green curtain (#0B130E) covers viewport.
 * 2. Amnaya wordmark + "Vision Infra" sub-label + gold hairline draw in.
 * 3. Curtain clips away from bottom upward to reveal the hero.
 * 4. Hero settles, intro completes.
 *
 * Session strategy:
 * Stores 'amnaya-intro-seen-v2' in sessionStorage so returning visitors within
 * the same session skip the intro immediately.
 *
 * Accessibility:
 * Respects prefers-reduced-motion — skips animation entirely if enabled.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

const SESSION_KEY = "amnaya-intro-seen-v2";

export function CinematicIntro() {
  const reduced = useReducedMotionPreference();

  const [showIntro, setShowIntro] = useState<boolean | null>(() => {
    if (reduced) return false;
    if (typeof window === "undefined") return null;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return false;
    } catch {
      // ignore
    }
    return true;
  });

  useEffect(() => {
    if (!showIntro) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // ignore
    }

    const t1 = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(t1);
  }, [showIntro]);

  // Not yet resolved — don't render anything to avoid flash
  if (showIntro === null || !showIntro) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="cinematic-intro"
        className="fixed inset-0 z-[250] overflow-hidden select-none pointer-events-none"
        aria-hidden
      >
        {/* ── Architectural grid lines overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "5rem 5rem",
          }}
        />

        {/* ── Main curtain — clips upward away from hero */}
        <motion.div
          className="absolute inset-0 bg-[#0B130E]"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{
            duration: 1.0,
            delay: 0.65,
            ease: [0.83, 0, 0.17, 1],
          }}
        />

        {/* ── Wordmark content */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-4"
        >
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[0.625rem] font-medium uppercase tracking-[0.35em] text-[#a3744a]/70"
          >
            Vision Infra Presents
          </motion.span>

          {/* Wordmark */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl font-medium tracking-[-0.02em] text-neutral-50"
          >
            Amnaya
          </motion.p>

          {/* Gold rule */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-px w-20 origin-left bg-[#a3744a]/60"
          />

          {/* Location */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-[0.625rem] uppercase tracking-[0.25em] text-neutral-400/70 font-light"
          >
            Khajaguda · Hyderabad
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
