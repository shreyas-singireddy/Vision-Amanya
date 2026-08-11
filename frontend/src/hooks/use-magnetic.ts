"use client";

/** `useMagnetic` — elements that gently follow the cursor (buttons, chips).
 *
 * The element is attracted toward the pointer within `radius` px and springs
 * back on leave. Pure transform — no layout cost. Respect reduced motion by
 * checking `useReducedMotionPreference` before applying the handlers.
 */

import { useMotionValue, useSpring } from "framer-motion";
import { useCallback, useRef } from "react";

import { motionPointer } from "@lib/motion";

export interface MagneticOptions {
  /** Attraction radius in px. */
  radius?: number;
  /** Spring stiffness. */
  stiffness?: number;
  /** Spring damping. */
  damping?: number;
}

export interface MagneticResult {
  /** Attach to the moving element (a `motion.*` component). */
  ref: React.RefObject<HTMLElement | null>;
  /** Cursor move handler. */
  onMouseMove: (event: React.MouseEvent) => void;
  /** Cursor leave handler. */
  onMouseLeave: () => void;
  /** Motion values for `style={{ x, y }}`. */
  style: { x: ReturnType<typeof useSpring>; y: ReturnType<typeof useSpring> };
}

export function useMagnetic({
  radius = motionPointer.magnetic,
  stiffness = 120,
  damping = 16,
}: MagneticOptions = {}): MagneticResult {
  const ref = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance > radius) {
        rawX.set(0);
        rawY.set(0);
        return;
      }
      // Ease toward the cursor within the radius.
      rawX.set(dx * 0.45);
      rawY.set(dy * 0.45);
    },
    [radius, rawX, rawY]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, onMouseMove, onMouseLeave, style: { x, y } };
}
