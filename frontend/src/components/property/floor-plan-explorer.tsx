"use client";

/** FloorPlanExplorer — interactive floor-plan exploration.
 *
 * Unit selection via accessible tabs, a crossfading plan view, a config
 * details panel, and a full-screen plan lightbox. Data is supplied by the
 * consumer from verified project documentation. */

import { AnimatePresence, motion } from "framer-motion";
import { Compass, Expand, Ruler } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { routes } from "@constants/routes";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { IconButton } from "@components/ui/icon-button";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { cn } from "@utils/cn";

export interface FloorPlan {
  id: string;
  /** Short tab label, e.g. "Type A". */
  tabLabel: string;
  /** Full title, e.g. "3 BHK — Type A". */
  title: string;
  area?: string;
  note?: string;
  src: string;
  alt: string;
  description: string;
  /** Category chip, e.g. "Residence". */
  tag?: string;
  /** Label for the enquiry CTA. */
  ctaLabel?: string;
}

interface FloorPlanExplorerProps {
  plans: FloorPlan[];
  className?: string;
}

const crossfade = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.005 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export function FloorPlanExplorer({ plans, className }: FloorPlanExplorerProps) {
  const [activeId, setActiveId] = useState(plans[0]?.id ?? "");
  const reducedMotion = useReducedMotionPreference();

  const active = plans.find((plan) => plan.id === activeId) ?? plans[0];
  if (!active) return null;

  return (
    <div className={cn("grid gap-10 lg:grid-cols-12 lg:items-start", className)}>
      {/* Plan viewer */}
      <div className="lg:col-span-7">
        <Tabs value={active.id} onValueChange={setActiveId}>
          <TabsList aria-label="Residence configuration">
            {plans.map((plan) => (
              <TabsTrigger key={plan.id} value={plan.id}>
                {plan.tabLabel}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative mt-4 overflow-hidden rounded-card-lg border border-border bg-surface-subtle shadow-card">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={reducedMotion ? false : crossfade.initial}
              animate={reducedMotion ? undefined : crossfade.animate}
              exit={reducedMotion ? undefined : crossfade.exit}
              transition={reducedMotion ? undefined : crossfade.transition}
              className="flex aspect-[4/3] items-center justify-center bg-neutral-50 p-md dark:bg-neutral-950"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.src}
                alt={active.alt}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          <Dialog>
            <DialogTrigger asChild>
              <IconButton
                aria-label={`View ${active.title} full plan`}
                title="View full plan"
                icon={Expand}
                variant="glass"
                size="md"
                className="absolute bottom-sm right-sm shadow-lg"
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 flex max-h-[70vh] items-center justify-center overflow-hidden rounded-md border border-border bg-neutral-50 dark:bg-neutral-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.src}
                  alt={active.alt}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="mt-sm text-sm text-muted-foreground">
          {active.alt} — select a configuration to compare layouts, or open the full plan.
        </p>
      </div>

      {/* Details panel */}
      <div className="lg:col-span-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex h-full flex-col rounded-card-lg border border-border bg-card p-lg shadow-card sm:p-xl"
          >
            {active.tag ? (
              <Badge tone="accent" variant="soft" className="self-start">
                {active.tag}
              </Badge>
            ) : null}

            <h3 className="mt-md font-serif text-2xl font-medium text-foreground">
              {active.title}
            </h3>

            <dl className="mt-lg flex flex-col gap-md">
              {active.area ? (
                <div className="flex items-center gap-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Area</dt>
                  <dd className="text-sm text-foreground">{active.area}</dd>
                </div>
              ) : null}
              {active.note ? (
                <div className="flex items-center gap-sm">
                  <Compass className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <dt className="sr-only">Orientation</dt>
                  <dd className="text-sm text-foreground">{active.note}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-lg text-sm leading-relaxed text-muted-foreground">
              {active.description}
            </p>

            <div className="mt-auto pt-lg">
              <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
                <Link href={routes.contact}>
                  {active.ctaLabel ?? "Enquire about this residence"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
