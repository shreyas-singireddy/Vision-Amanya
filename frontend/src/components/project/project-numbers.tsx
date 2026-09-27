"use client";

/**
 * ProjectNumbers — The post-hero cinematic statistics section.
 *
 * Large editorial typography on a refined surface.
 * Sourced strictly from verified Amnaya project specifications.
 * Count-up animation triggers when entering the viewport.
 *
 * Desktop: horizontal editorial composition with five large numerals.
 * Mobile: naturally stacked 2-column grid.
 */

import { motion } from "framer-motion";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { CountUp } from "@components/motion";

const projectNumbers = [
  {
    num: 5.3,
    display: "5.3",
    decimals: 1,
    unit: "Acres",
    label: "Total Site",
    desc: "Khajaguda's premier address",
  },
  {
    num: 420,
    display: "420",
    decimals: 0,
    unit: "Residences",
    label: "3 BHK Only",
    desc: "1,715–2,590 sq.ft. each",
  },
  {
    num: 2,
    display: "2",
    decimals: 0,
    unit: "Acres",
    label: "Central Garden",
    desc: "Landscaped open-air sanctuary",
  },
  {
    num: 25000,
    display: "25,000",
    decimals: 0,
    unit: "sq.ft.",
    label: "Clubhouse",
    desc: "4 floors of wellness & leisure",
  },
  {
    num: 25,
    display: "25",
    decimals: 0,
    unit: "Acres",
    label: "Lake View",
    desc: "Unobstructed north-facing view",
  },
] as const;

export function ProjectNumbers() {
  const reduced = useReducedMotionPreference();

  return (
    <section
      className="relative overflow-hidden border-y border-border/60 bg-background"
      aria-label="Amnaya project statistics"
    >
      {/* Subtle diagonal texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 0px, transparent 50%)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[96rem] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28 xl:px-16">
        {/* Section label */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex items-center gap-4 lg:mb-16"
        >
          <span className="block h-px w-8 bg-accent-500/60" aria-hidden />
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Amnaya at a Glance
          </span>
        </motion.div>

        {/* Editorial stat grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {projectNumbers.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={reduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.75, delay: idx * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col gap-3"
            >
              {/* Gold hairline — reveals on in-view */}
              <motion.div
                className="absolute -top-5 left-0 h-px bg-gradient-to-r from-accent-500/60 to-transparent"
                initial={reduced ? false : { width: "0%" }}
                whileInView={{ width: "60%" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.8,
                  delay: idx * 0.09 + 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                aria-hidden
              />

              {/* Number */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className="font-serif font-medium leading-none tracking-tight text-foreground"
                  style={{ fontSize: "clamp(2.5rem, 1.5rem + 3vw, 4rem)" }}
                >
                  {reduced ? (
                    item.display
                  ) : (
                    <CountUp from={0} to={item.num} decimals={item.decimals} />
                  )}
                </span>
                <span className="pb-1 text-sm font-medium uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  {item.unit}
                </span>
              </div>

              {/* Label */}
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-foreground/80">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
