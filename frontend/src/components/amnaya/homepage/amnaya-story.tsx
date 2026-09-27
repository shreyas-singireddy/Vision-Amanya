"use client";

/**
 * AmnayaStory — Section 03.
 *
 * An editorial introduction to Vision Amnaya.
 * Explains the vision behind the 5.3-acre development in Khajaguda,
 * marrying 420 residences to 2 acres of central garden and a 25-acre lake view.
 *
 * Rules:
 *   - Uses verified project facts only (from `@config/project`)
 *   - Asymmetric editorial composition with ImageReveal
 *   - Fully accessible and responsive
 */

import { motion } from "framer-motion";

import { projectConfig, projectFacts } from "@config/project";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { HorizontalLine } from "@components/amnaya/horizontal-line";
import { SectionHeading } from "@components/amnaya/section-heading";
import { ImageReveal } from "@components/motion/image-reveal";
import { Reveal } from "@components/motion/reveal";
import { Container } from "@components/ui/container";

import { cn } from "@utils/cn";

export interface AmnayaStoryProps {
  className?: string;
}

export function AmnayaStory({ className }: AmnayaStoryProps) {
  const reduced = useReducedMotionPreference();

  return (
    <section
      id="story"
      className={cn("relative overflow-hidden bg-background py-20 sm:py-28 lg:py-36", className)}
      aria-label="The Amnaya Story"
    >
      <Container size="page">
        {/* Asymmetric Editorial Header & Intro */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="The Story"
              title="A 5.3-acre sanctuary framing Khajaguda's lake"
              description="Developed by Vision Infra, Amnaya is an intentional response to urban density — where residential architecture is surrounded by two acres of garden and twenty-five acres of open lake view."
              align="left"
              line
            />
          </div>

          <div className="flex flex-col justify-between gap-6 lg:col-span-6 lg:pt-14">
            <Reveal delay={0.2}>
              <p className="text-body-large leading-relaxed text-muted-foreground font-light">
                Situated at the quiet intersection of Hyderabad&apos;s financial district and the
                Osman Sagar catchment, {projectConfig.fullName} brings 420 three-bedroom residences
                across ten floors. Every tower is positioned to maximize cross-ventilation,
                daylight, and unobstructed views across the water.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="text-body leading-relaxed text-muted-foreground/80 font-light">
                Rather than maximizing built footprint, two full acres are preserved as a central
                landscape spine, creating a physical buffer between the residences and the city.
              </p>
            </Reveal>

            <HorizontalLine className="my-2" />
          </div>
        </div>

        {/* Hero Architectural Render Showcase */}
        <div className="mt-16 sm:mt-20">
          <ImageReveal
            src="/assets/amnaya/renders/building-day.jpg"
            alt="Vision Amnaya — 5.3-acre architectural render overview"
            aspect="wide"
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="w-full shadow-cinematic rounded-card-lg overflow-hidden"
          />
        </div>

        {/* Fact Grid — Verified Numbers */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 border-t border-border pt-12">
          {projectFacts.slice(0, 6).map((fact, i) => (
            <motion.div
              key={fact.label}
              className="flex flex-col gap-1"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {fact.label}
              </span>
              <span className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                {fact.value}
              </span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
