"use client";

/** Stagger — container that staggers its `Reveal` children. */

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

import { staggerContainer } from "@lib/motion";

export interface StaggerProps extends HTMLMotionProps<"div"> {
  /** Delay between child reveals, in seconds. */
  stagger?: number;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, stagger = 0.08, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer(stagger)}
      {...props}
    >
      {children}
    </motion.div>
  )
);
Stagger.displayName = "Stagger";
