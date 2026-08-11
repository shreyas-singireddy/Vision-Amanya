"use client";

/**
 * FloatingEnquiry — Fixed floating action control for quick access.
 *
 * Desktop: Floating pill on bottom-right edge ("ENQUIRE NOW →").
 * Mobile: Non-intrusive sticky bottom CTA bar ("SCHEDULE A SITE VISIT").
 * Shows after user scrolls past the hero band (>400px).
 */

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { routes } from "@constants/routes";
import { ctaConfig } from "@config/cta";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

export function FloatingEnquiry() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop Floating Pill */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-8 z-[110] hidden lg:block"
          >
            <Link
              href={routes.contact}
              className="group flex items-center gap-3 rounded-full border border-accent-500/40 bg-surface-subtle/90 px-6 py-3.5 shadow-cinematic backdrop-blur-md text-foreground transition-all duration-300 hover:border-accent-500 hover:bg-surface hover:shadow-card hover:-translate-y-0.5"
            >
              <span className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
                {ctaConfig.enquireNow.label}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-neutral-950 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>

          {/* Mobile Bottom Bar */}
          <motion.div
            initial={reduced ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-[110] block lg:hidden border-t border-border bg-background/95 p-3.5 backdrop-blur-md shadow-card"
          >
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <Link
                href={routes.contact}
                className="flex-1 flex items-center justify-center gap-2 rounded-button bg-primary-600 px-4 py-3 text-center text-xs font-medium uppercase tracking-eyebrow text-neutral-50 shadow-sm transition-active active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4" />
                <span>{ctaConfig.scheduleSiteVisit.label}</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
