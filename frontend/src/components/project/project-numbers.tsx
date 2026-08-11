"use client";

/**
 * ProjectNumbers — The post-hero cinematic statistics section.
 *
 * Sourced strictly from verified Amnaya project specifications:
 * - 5.3 Acres total site area
 * - 420 3 BHK residences across 10 floors
 * - 2 Acres central garden
 * - 25,000 sq.ft. clubhouse
 * - 25-Acre lake view facing north
 *
 * Layout: Horizontal editorial grid on desktop, natural stacked grid on mobile.
 */

import { motion } from "framer-motion";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

const projectNumbers = [
  {
    num: "5.3",
    unit: "Acres",
    label: "Total Site Area",
    desc: "Khajaguda's premier residential address",
  },
  {
    num: "420",
    unit: "Residences",
    label: "3 BHK Configuration",
    desc: "1,715 to 2,590 sq.ft. generous layouts",
  },
  {
    num: "2",
    unit: "Acres",
    label: "Central Garden",
    desc: "Landscaped green open-air sanctuary",
  },
  {
    num: "25,000",
    unit: "sq.ft.",
    label: "Clubhouse Spine",
    desc: "4 floors of wellness, sports & leisure",
  },
  {
    num: "25",
    unit: "Acres",
    label: "Lake View",
    desc: "Unobstructed view facing north",
  },
] as const;

export function ProjectNumbers() {
  const reduced = useReducedMotionPreference();

  return (
    <section className="relative border-y border-border/80 bg-background py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600 dark:text-accent-400">
            Amnaya at a Glance
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-medium tracking-display text-foreground">
            Project Numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6 lg:gap-8">
          {projectNumbers.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col justify-between border-l border-accent-500/30 pl-6 lg:pl-5 py-2 group hover:border-accent-500 transition-colors duration-300"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl sm:text-5xl lg:text-4xl xl:text-5xl font-medium text-foreground tracking-tight">
                    {item.num}
                  </span>
                  <span className="text-sm font-medium uppercase tracking-wider text-accent-600 dark:text-accent-400">
                    {item.unit}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-medium uppercase tracking-eyebrow text-foreground/90">
                  {item.label}
                </h3>
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
