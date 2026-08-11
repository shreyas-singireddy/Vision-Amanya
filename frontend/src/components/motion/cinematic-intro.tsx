"use client";

/**
 * CinematicIntro — First-visit architectural entrance sequence for Amnaya.
 *
 * Sequence (~1.6s):
 * 1. Deep architectural green curtain (#0B130E) over viewport.
 * 2. Amnaya wordmark + gold hairline rule draw in center.
 * 3. Curtain clip-mask expands outwards to reveal full-frame architectural hero render.
 * 4. Header controls become active.
 *
 * Session strategy:
 * Stores 'amnaya-intro-seen' in sessionStorage so returning users within the same
 * session skip the intro immediately.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { easings } from "@constants/design-tokens";

const SESSION_KEY = "amnaya-intro-seen-v1";

export function CinematicIntro() {
  const reduced = useReducedMotionPreference();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!showIntro || reduced) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, [showIntro, reduced]);

  if (!showIntro || reduced) return null;

  return (
    <AnimatePresence mode="wait">
      {showIntro && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          }}
          transition={{ duration: 0.7, ease: easings.outExpo }}
          className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-[#0B130E] text-neutral-50 select-none pointer-events-none"
          aria-hidden
        >
          {/* Subtle architectural grid lines */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 1.02 }}
            transition={{ duration: 0.6, ease: easings.outExpo }}
            className="relative z-10 flex flex-col items-center gap-4 text-center px-4"
          >
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent-400/80">
              Vision Infra Presents
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-display text-neutral-50">
              Amnaya
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: easings.outExpo }}
              className="h-px w-24 bg-accent-400/60"
            />
            <p className="text-xs uppercase tracking-eyebrow text-neutral-400/80 font-light">
              Khajaguda · Hyderabad
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
