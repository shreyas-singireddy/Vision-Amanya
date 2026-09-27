import { motion } from "framer-motion";
import type { ComponentType, ElementType } from "react";

const motionTagCache = new Map<ElementType, ComponentType<Record<string, unknown>>>();

/**
 * Returns a stable, cached motion component for any HTML tag or React element type.
 * Prevents dynamic creation of motion components during render, which causes React
 * reconciliation failures ("removeChild on Node" errors).
 */
export function getMotionTag(as: ElementType = "div"): ComponentType<Record<string, unknown>> {
  if (typeof as === "string" && as in motion) {
    return (motion as unknown as Record<string, ComponentType<Record<string, unknown>>>)[as]!;
  }
  let cached = motionTagCache.get(as);
  if (!cached) {
    cached = motion.create(as) as ComponentType<Record<string, unknown>>;
    motionTagCache.set(as, cached);
  }
  return cached;
}
