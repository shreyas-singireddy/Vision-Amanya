/**
 * Motion tokens — the quantitative vocabulary of the Motion Experience Engine.
 *
 * Every duration/easing lives in the canonical design tokens
 * (`src/constants/design-tokens.ts` / `globals.css`); this module adds the
 * *motion-specific* quantities those tokens reference: travel distances, blur
 * radii, scale origins, rotation, parallax strength, scroll thresholds and
 * hover/pointer behaviour.
 *
 * Nothing in the project should hardcode a magic number for motion. Pull from
 * here (or from `presets.ts`, which bundles these into named choreographies).
 */

/** Entrance / slide travel distances in px. */
export const motionDistance = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  "2xl": 96,
} as const;

export type MotionDistance = keyof typeof motionDistance;

/** Blur radii in px for defocus reveals (use sparingly — filter is costly). */
export const motionBlur = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
} as const;

export type MotionBlur = keyof typeof motionBlur;

/** Scale origins for zoom/scale reveals. */
export const motionScale = {
  subtle: 0.98,
  from: 0.96,
  strong: 0.92,
  overshoot: 1.06,
} as const;

export type MotionScale = keyof typeof motionScale;

/** Rotation angles in degrees for rotate reveals. */
export const motionRotate = {
  subtle: 2,
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export type MotionRotate = keyof typeof motionRotate;

/** Parallax travel in px — one value per depth layer. */
export const motionParallax = {
  subtle: 20,
  default: 40,
  strong: 80,
  xl: 120,
} as const;

export type MotionParallax = keyof typeof motionParallax;

/** WhileInView viewport configuration. */
export const viewportAmount = {
  none: 0,
  some: 0.1,
  quarter: 0.25,
  half: 0.5,
  all: 1,
} as const;

export type ViewportAmount = keyof typeof viewportAmount;

/** IntersectionObserver margins used as the reveal trigger line. */
export const scrollThresholds = {
  /** Default reveal margin: element must clear 80px into the viewport. */
  margin: "-80px",
  /** Subtle trigger for near-viewport reveals. */
  marginNear: "-40px",
  /** Aggressive trigger (large heroes). */
  marginAway: "-120px",
} as const;

/** Hover / press micro-interaction distances (px). */
export const motionHover = {
  /** Vertical lift on hover for cards/buttons. */
  lift: -6,
  /** Icon travel when a parent is hovered. */
  iconShift: 4,
  /** Image zoom factor on hover. */
  zoom: 1.05,
  /** Press-down scale for interactive elements. */
  pressScale: 0.985,
  /** Horizontal slide for arrows / directional affordances. */
  arrowShift: 6,
} as const;

/** Pointer-driven interaction ranges. */
export const motionPointer = {
  /** Magnetic attraction radius in px. */
  magnetic: 28,
  /** Max 3D-tilt angle in degrees. */
  tiltMax: 6,
  /** Perspective for 3D tilt. */
  tiltPerspective: 1000,
  /** Depth translation (px) for layered pointer parallax. */
  depth: 20,
} as const;

/** Ambient looping motion (floating elements). */
export const motionFloat = {
  /** Vertical amplitude in px. */
  amplitude: 8,
  /** One up-down cycle in seconds. */
  duration: 6,
  /** Slight horizontal sway for organic drift. */
  sway: 3,
} as const;

/** Consolidated map — the whole motion vocabulary in one object. */
export const motionTokens = {
  distance: motionDistance,
  blur: motionBlur,
  scale: motionScale,
  rotate: motionRotate,
  parallax: motionParallax,
  viewport: viewportAmount,
  thresholds: scrollThresholds,
  hover: motionHover,
  pointer: motionPointer,
  float: motionFloat,
} as const;

export type MotionTokens = typeof motionTokens;
