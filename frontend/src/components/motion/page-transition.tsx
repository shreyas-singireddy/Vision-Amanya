"use client";

/** PageTransition — route-change veil for the App Router.
 *
 * Keyed by `pathname`, wraps layout children in `AnimatePresence
 * mode="wait"`: the current page performs a short controlled exit, the route
 * changes, then the new page enters. Kept short (~0.4s) so navigation is
 * never blocked. Reduced motion renders without any entrance/exit.
 *
 * Mount it once in the route-group layout around `<main>`:
 *
 *   <main id="main-content">
 *     <PageTransition>{children}</PageTransition>
 *   </main>
 */

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { transitionPage } from "@lib/motion";

export interface PageTransitionProps extends PropsWithChildren {
  /** Duration in seconds (defaults to the `slow` token). */
  duration?: number;
}

export function PageTransition({ children, duration }: PageTransitionProps) {
  const pathname = usePathname();
  const reduced = useReducedMotionPreference();

  const transition = duration !== undefined ? { ...transitionPage, duration } : transitionPage;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -6 }}
        transition={reduced ? { duration: 0 } : transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
