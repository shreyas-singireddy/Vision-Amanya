"use client";

/** LoadingTransition — a premium loading veil.
 *
 * A controlled overlay (`open` prop) rendered through `AnimatePresence`: the
 * scrim fades in, a hairline draws across beneath the brand mark, then the
 * overlay fades out when `open` flips. This is the reusable entrance/exit for
 * page loads, heavy content and immersive transitions. Avoid generic spinning
 * loaders on marketing surfaces.
 *
 * Reduced motion keeps the veil functional but skips the decorative draw.
 */

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { easings } from "@constants/design-tokens";

export interface LoadingTransitionProps {
  /** Show / hide the veil. */
  open: boolean;
  /** Brand mark (wordmark / monogram) shown above the hairline. */
  brand?: ReactNode;
  /** Accessible label for the loading state. */
  label?: string;
  /** Seconds the hairline takes to draw. */
  duration?: number;
  /** Called when the exit animation completes. */
  onExitComplete?: () => void;
}

export function LoadingTransition({
  open,
  brand,
  label = "Loading",
  duration = 1.2,
  onExitComplete,
}: LoadingTransitionProps) {
  const reduced = useReducedMotionPreference();

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-grad-hero text-neutral-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.35, ease: easings.decelerate }}
          role="status"
          aria-label={label}
        >
          {brand ? <div className="px-6 text-center">{brand}</div> : null}
          <motion.div
            className="h-px w-40 origin-left bg-accent-500"
            initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={reduced ? { duration: 0 } : { duration, ease: easings.outExpo, delay: 0.2 }}
          />
          <span className="sr-only">{label}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
