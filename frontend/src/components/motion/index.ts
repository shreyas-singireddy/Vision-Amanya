/** Barrel export for motion primitives (the Motion Experience Engine). */

export { Reveal } from "./reveal";
export type { RevealProps } from "./reveal";

export { Stagger } from "./stagger";
export type { StaggerProps } from "./stagger";

export {
  Fade,
  FadeIn,
  FadeOut,
  Slide,
  SlideIn,
  ScaleIn,
  BlurReveal,
  HoverReveal,
  Parallax,
  SectionTransition,
} from "./primitives";
export type {
  FadeProps,
  FadeOutProps,
  SlideInProps,
  ScaleInProps,
  BlurRevealProps,
  HoverRevealProps,
  HoverPreset,
  ParallaxProps,
  SectionTransitionProps,
} from "./primitives";
export { ScrollReveal } from "./primitives";

export { TextReveal, WordReveal, LetterReveal, LineReveal } from "./text-reveal";
export type { TextRevealProps, TextRevealMode } from "./text-reveal";

export { ImageReveal, ParallaxImage } from "./image-reveal";
export type { ImageRevealProps, ParallaxImageProps, ImageAspect } from "./image-reveal";

export { HeroReveal, HeroDepth, HeroRule } from "./hero-reveal";
export type { HeroRevealProps, HeroDepthProps } from "./hero-reveal";

export { CountUp } from "./count-up";
export type { CountUpProps } from "./count-up";

export { PageTransition } from "./page-transition";
export type { PageTransitionProps } from "./page-transition";

export { LoadingTransition } from "./loading-transition";
export type { LoadingTransitionProps } from "./loading-transition";

export { CinematicIntro } from "./cinematic-intro";

export { ImmersiveHero } from "./immersive-hero";
export type { ImmersiveHeroProps } from "./immersive-hero";
