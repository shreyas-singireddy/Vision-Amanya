"use client";

/**
 * Text choreography — split-text reveal primitives for editorial typography.
 *
 * `TextReveal` splits its copy into words / letters / lines and drives them
 * through masked entrances (`wordRevealVariant`, `letterRevealVariant`,
 * `lineMaskVariant` from `@lib/motion/text`). Primary use: hero headlines,
 * major section headings, storytelling statements. Do NOT animate every
 * paragraph — typography must remain readable.
 *
 * Accessibility:
 *   - the rendered container carries the full text as an `aria-label`
 *   - the animated fragments are `aria-hidden`, so screen readers announce
 *     the complete string exactly once, with no inter-word pauses
 *   - under reduced motion the component renders the plain text unchanged
 *
 * Only headings and short statements should use letter/word modes; body
 * copy should always remain a plain string.
 */

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import {
  letterRevealVariant,
  lineMaskVariant,
  textContainer,
  withDelay,
  wordRevealVariant,
} from "@lib/motion";

export type TextRevealMode = "words" | "letters" | "lines";

/** Element roles the reveal can render as (static map — see below). */
export type TextRevealElement = "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div";

/** Pre-built motion tags (avoids `motion.create` during render). */
const TEXT_MOTION_TAGS = {
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  div: motion.div,
} as const;

export interface TextRevealProps extends Omit<HTMLMotionProps<"span">, "children"> {
  /** The text to reveal. */
  text: string;
  /** Splitting strategy. */
  mode?: TextRevealMode;
  /** Render as a different element (default "span"). */
  as?: TextRevealElement;
  /** Delay in seconds before the sequence starts. */
  delay?: number;
  /** Stagger between fragments in seconds (overrides the mode default). */
  stagger?: number;
}

const MODE_STAGGER: Record<TextRevealMode, number> = {
  words: 0.06,
  letters: 0.035,
  lines: 0.12,
};

function WordFragments({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-[0.28em] gap-y-[0.1em] max-w-full">
      {words.map((word, i) => (
        <span
          key={`${i}-${word}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <motion.span
            className="inline-block will-change-transform pb-[0.14em] -mb-[0.14em]"
            variants={wordRevealVariant()}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function LetterFragments({ text }: { text: string }) {
  const chars = Array.from(text);
  return (
    <>
      {chars.map((char, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-bottom will-change-transform"
        >
          <motion.span
            className="inline-block pb-[0.18em] -mb-[0.18em]"
            variants={letterRevealVariant()}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </>
  );
}

function LineFragments({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden" aria-hidden>
          <motion.span className="block will-change-transform" variants={lineMaskVariant()}>
            {line === "" ? "\u00A0" : line}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/** TextReveal — the split-text entrance. Defaults to word reveal (the most
 *  readable), letters for short statements, lines for multi-line headlines. */
export const TextReveal = forwardRef<HTMLSpanElement, TextRevealProps>(
  ({ text, mode = "words", as = "span", delay = 0, stagger, className, ...props }, ref) => {
    const reduced = useReducedMotionPreference();
    const MotionTag = TEXT_MOTION_TAGS[as];
    // Each motion tag has its own element-specific ref; the caller's span ref
    // is only ever used as a node handle, so coerce once here.
    const motionRef = ref as unknown as React.Ref<HTMLDivElement>;

    if (reduced) {
      return (
        <MotionTag ref={motionRef} className={className}>
          {text}
        </MotionTag>
      );
    }

    const rhythm = stagger ?? MODE_STAGGER[mode];
    const container: Variants = withDelay(textContainer(rhythm), delay);

    return (
      <MotionTag
        ref={motionRef}
        aria-label={text}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
        {...props}
      >
        {mode === "letters" ? (
          <LetterFragments text={text} />
        ) : mode === "lines" ? (
          <LineFragments text={text} />
        ) : (
          <WordFragments text={text} />
        )}
      </MotionTag>
    );
  }
);
TextReveal.displayName = "TextReveal";

/** WordReveal — words rise out of a mask. The default editorial treatment. */
export const WordReveal = forwardRef<HTMLSpanElement, Omit<TextRevealProps, "mode">>(
  (props, ref) => <TextReveal ref={ref} mode="words" {...props} />
);
WordReveal.displayName = "WordReveal";

/** LetterReveal — gentle character cascade for short statements. */
export const LetterReveal = forwardRef<HTMLSpanElement, Omit<TextRevealProps, "mode">>(
  (props, ref) => <TextReveal ref={ref} mode="letters" {...props} />
);
LetterReveal.displayName = "LetterReveal";

/** LineReveal — full-height masks slide away to uncover each line. */
export const LineReveal = forwardRef<HTMLSpanElement, Omit<TextRevealProps, "mode">>(
  (props, ref) => <TextReveal ref={ref} mode="lines" {...props} />
);
LineReveal.displayName = "LineReveal";
