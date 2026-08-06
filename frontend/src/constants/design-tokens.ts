/**
 * Design tokens (TypeScript mirror).
 *
 * The canonical tokens live in CSS (`src/app/globals.css`) so the browser can
 * swap them per theme. This module re-declares the *quantitative* tokens that
 * JavaScript needs (animation timings, easings, z-index, breakpoints, spacing,
 * radii, shadows, containers) — primarily for the motion system and dynamic
 * styling. Keep the two in sync.
 *
 * Colour tokens are intentionally NOT duplicated here; read them from CSS via
 * `getComputedStyle` or use the Tailwind utilities generated from them.
 */

export const spacing = {
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
} as const;

/** 4px base scale in rem. */
export type SpacingToken = keyof typeof spacing;

/** Vertical rhythm for page sections (rem). */
export const sectionSpacing = {
  sm: 4,
  default: 6,
  lg: 8,
} as const;

export type SectionSpacingToken = keyof typeof sectionSpacing;

/** Layout container widths (rem). */
export const containers = {
  page: 80, // 1280
  wide: 88, // 1408
  narrow: 72, // 1152
  tight: 60, // 960
  prose: 42, // 672 — editorial measure
} as const;

export type ContainerToken = keyof typeof containers;

export const radius = {
  none: "0px",
  xs: "0.375rem",
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  input: "0.625rem",
  card: "1rem",
  cardLg: "1.375rem",
  dialog: "1.25rem",
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof radius;

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  skipLink: 100,
} as const;

export type ZIndexToken = keyof typeof zIndex;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1600,
} as const;

export type BreakpointToken = keyof typeof breakpoints;

/** Motion durations (ms) shared with `@theme` in globals.css. */
export const durations = {
  instant: 50,
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
  slowest: 900,
  luxury: 1200,
} as const;

export type DurationToken = keyof typeof durations;

export type EasingToken =
  "standard" | "decelerate" | "accelerate" | "emphasize" | "outExpo" | "inOutEmphasized";

/** Motion easing curves shared with `@theme` in globals.css. */
export const easings: Record<EasingToken, [number, number, number, number]> = {
  /** Default standard curve — matches `cubic-bezier(0.4, 0, 0.2, 1)`. */
  standard: [0.4, 0, 0.2, 1],
  /** Decelerating (entrances): element comes to rest naturally. */
  decelerate: [0.0, 0, 0.2, 1],
  /** Accelerating (exits): element leaves quickly. */
  accelerate: [0.4, 0, 1, 1],
  /** Soft overshoot for spring-like emphasis. */
  emphasize: [0.2, 0.8, 0.2, 1],
  /** Luxury ease-out — long, composed travel (hero reveals). */
  outExpo: [0.16, 1, 0.3, 1],
  /** Emphasized in-out for modals/drawers. */
  inOutEmphasized: [0.83, 0, 0.17, 1],
};

/** Spring presets used by the motion system. */
export const springs = {
  soft: { type: "spring", stiffness: 120, damping: 18, mass: 1 },
  gentle: { type: "spring", stiffness: 80, damping: 20, mass: 1 },
  snappy: { type: "spring", stiffness: 300, damping: 24, mass: 0.8 },
} as const;

export const shadows = {
  xs: "0 1px 2px 0 rgb(25 25 23 / 0.05)",
  sm: "0 1px 3px 0 rgb(25 25 23 / 0.1), 0 1px 2px -1px rgb(25 25 23 / 0.1)",
  md: "0 4px 6px -1px rgb(25 25 23 / 0.1), 0 2px 4px -2px rgb(25 25 23 / 0.1)",
  lg: "0 10px 15px -3px rgb(25 25 23 / 0.1), 0 4px 6px -4px rgb(25 25 23 / 0.1)",
  xl: "0 20px 25px -5px rgb(25 25 23 / 0.1), 0 8px 10px -6px rgb(25 25 23 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(25 25 23 / 0.25)",
  soft: "0 2px 16px -2px rgb(25 25 23 / 0.08)",
  card: "0 1px 2px rgb(25 25 23 / 0.05), 0 12px 32px -16px rgb(13 33 26 / 0.18)",
  elevated: "0 24px 48px -16px rgb(13 33 26 / 0.3)",
  glowPrimary: "0 0 0 4px rgb(61 139 102 / 0.16), 0 12px 32px -10px rgb(44 111 82 / 0.35)",
  glowGold: "0 0 0 4px rgb(192 142 46 / 0.16), 0 12px 32px -10px rgb(165 115 38 / 0.3)",
} as const;

/** Font-family stacks (shared with `@theme` in globals.css). */
export const fonts = {
  sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
  serif: 'var(--font-cormorant), "Cormorant Garamond", Georgia, "Times New Roman", serif',
} as const;

/** Semantic font-size scale (px) used by `text-*` utilities. */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  display1: 56,
  display2: 48,
  display3: 40,
  display4: 32,
  lead: 18,
  caption: 13,
  eyebrow: 12,
  overline: 11,
  quote: 24,
} as const;

/** Letter-spacing (em) used by `tracking-*` utilities. */
export const letterSpacing = {
  display: "-0.02em",
  eyebrow: "0.18em",
  overline: "0.22em",
  caps: "0.12em",
} as const;
