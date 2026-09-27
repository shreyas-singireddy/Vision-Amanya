"use client";

/**
 * CursorFollower — custom cursor experience for desktop.
 *
 * Replaces the native browser cursor on desktop with a subtle two-part cursor:
 *   - A 3px filled dot (moves instantaneously, 1:1 with the OS cursor)
 *   - A 32px ring (springs behind the dot with a gentle lag)
 *
 * States:
 *   - `default`  — small dot + ring (baseline)
 *   - `link`     — ring scales up, dot stays small (interactive)
 *   - `image`    — ring expands further, subtle label "View" appears
 *   - `text`     — ring becomes a thin vertical bar (I-beam alternative)
 *   - `drag`     — ring compressed + "Drag" label
 *
 * Rules:
 *   - Desktop only — hidden on touch screens (pointer: coarse).
 *   - Respects `prefers-reduced-motion` — disabled entirely.
 *   - Rendered in a portal above all content (z-index: 9999).
 *   - Never interferes with usability — native cursor is always preserved
 *     behind it via `pointer-events: none`.
 *   - Components that want to change cursor state should add the appropriate
 *     `data-cursor` attribute:
 *       data-cursor="link"    on <a>, <button>
 *       data-cursor="image"   on image wrappers
 *       data-cursor="text"    on <p>, <article>
 *       data-cursor="drag"    on draggable elements
 *
 * Mount in RootProvider (above all content) — only one instance per app.
 */

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@hooks/use-mounted";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

export type CursorState = "default" | "link" | "image" | "text" | "drag";

/** Spring config — heavy damping so the ring never bounces. */
const RING_SPRING = { stiffness: 180, damping: 24, mass: 0.6 };
/** The dot snaps with minimal spring (near-instant). */
const DOT_SPRING = { stiffness: 600, damping: 40, mass: 0.2 };

function useCursorPosition() {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const dotX = useSpring(rawX, DOT_SPRING);
  const dotY = useSpring(rawY, DOT_SPRING);
  const ringX = useSpring(rawX, RING_SPRING);
  const ringY = useSpring(rawY, RING_SPRING);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [rawX, rawY]);

  return { dotX, dotY, ringX, ringY };
}

function useCursorState() {
  const [state, setState] = useState<CursorState>("default");

  useEffect(() => {
    const update = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Walk up the DOM for data-cursor or semantic elements
      const cursor = target.closest("[data-cursor]");
      if (cursor) {
        setState((cursor as HTMLElement).dataset.cursor as CursorState);
        return;
      }
      const tag = target.tagName.toLowerCase();
      if (tag === "a" || tag === "button" || target.getAttribute("role") === "button") {
        setState("link");
        return;
      }
      if (tag === "p" || tag === "span" || tag === "li" || tag === "article") {
        setState("text");
        return;
      }
      if (tag === "img" || tag === "figure" || tag === "video") {
        setState("image");
        return;
      }
      setState("default");
    };

    window.addEventListener("mouseover", update, { passive: true });
    return () => window.removeEventListener("mouseover", update);
  }, []);

  return state;
}

/** Cursor ring dimensions and opacity per state. */
const RING_CONFIG: Record<
  CursorState,
  { size: number; opacity: number; borderWidth: number; scale: number }
> = {
  default: { size: 32, opacity: 0.6, borderWidth: 1, scale: 1 },
  link: { size: 48, opacity: 0.5, borderWidth: 1, scale: 1.2 },
  image: { size: 64, opacity: 0.45, borderWidth: 1, scale: 1.5 },
  text: { size: 2, opacity: 0, borderWidth: 0, scale: 1 },
  drag: { size: 40, opacity: 0.5, borderWidth: 1, scale: 0.9 },
};

const LABEL_CONFIG: Partial<Record<CursorState, string>> = {
  image: "View",
  drag: "Drag",
};

function CursorInner() {
  const reduced = useReducedMotionPreference();
  const { dotX, dotY, ringX, ringY } = useCursorPosition();
  const state = useCursorState();

  // Lazy-init: coarse pointer check runs once at mount (SSR returns false).
  const [isPointerCoarse] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  // Hydration guard — useMounted uses useSyncExternalStore, no setState-in-effect.
  const hasMounted = useMounted();

  if (!hasMounted || reduced || isPointerCoarse) return null;

  const ring = RING_CONFIG[state];
  const label = LABEL_CONFIG[state];
  const halfRing = ring.size / 2;
  const halfDot = 3;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999 }}
      aria-hidden
    >
      {/* Dot — snaps almost instantly */}
      <motion.div
        className="absolute rounded-full bg-accent-500"
        style={{
          width: 6,
          height: 6,
          x: dotX,
          y: dotY,
          translateX: -halfDot,
          translateY: -halfDot,
        }}
      />

      {/* Ring — springs behind the dot */}
      <motion.div
        className="absolute rounded-full border-accent-400"
        animate={{
          width: ring.size,
          height: ring.size,
          opacity: ring.opacity,
          borderWidth: ring.borderWidth,
          scale: ring.scale,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          x: ringX,
          y: ringY,
          translateX: -halfRing,
          translateY: -halfRing,
          borderStyle: "solid",
        }}
      >
        {/* Optional state label */}
        {label && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-[0.4375rem] font-medium uppercase tracking-[0.16em] text-accent-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

/**
 * CursorFollower — mount once at the root.
 *
 * ```tsx
 * // In RootProvider or layout:
 * <CursorFollower />
 * ```
 *
 * To disable globally: do not render this component.
 * To disable the native cursor on the body for a fully custom experience:
 *   add `cursor-none` to `<html>` — see `globals.css`.
 */
export function CursorFollower() {
  return <CursorInner />;
}
