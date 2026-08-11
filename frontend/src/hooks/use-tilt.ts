"use client";

/** `useTilt` — pointer-driven 3D tilt for tactile surfaces (cards, media).
 *
 * Rotations are springs, so the surface settles back when the pointer leaves.
 * Apply `style={{ ...style }}` to a `motion.*` element. Disabled automatically
 * on touch-only environments and reduced motion (caller should check
 * `useReducedMotionPreference`).
 */

import { useMotionValue, useSpring, useTransform, type MotionStyle } from "framer-motion";
import { useCallback } from "react";

import { motionPointer } from "@lib/motion";

export interface TiltOptions {
  /** Max tilt angle in degrees. */
  max?: number;
  /** Perspective in px. */
  perspective?: number;
  /** Spring stiffness. */
  stiffness?: number;
  /** Spring damping. */
  damping?: number;
}

export interface TiltResult {
  /** Apply to a `motion.*` element. */
  style: MotionStyle;
  /** Pointer move handler. */
  onMouseMove: (event: React.MouseEvent) => void;
  /** Pointer leave handler — settles the surface back to level. */
  onMouseLeave: () => void;
}

export function useTilt({
  max = motionPointer.tiltMax,
  perspective = motionPointer.tiltPerspective,
  stiffness = 180,
  damping = 20,
}: TiltOptions = {}): TiltResult {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), {
    stiffness,
    damping,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), {
    stiffness,
    damping,
  });

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width);
      py.set((event.clientY - rect.top) / rect.height);
    },
    [px, py]
  );

  const onMouseLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return {
    style: {
      rotateX,
      rotateY,
      transformPerspective: perspective,
    },
    onMouseMove,
    onMouseLeave,
  };
}
