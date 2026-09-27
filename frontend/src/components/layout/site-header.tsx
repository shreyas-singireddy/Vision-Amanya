"use client";

/**
 * SiteHeader — the global chrome, fixed to the top.
 *
 * Transparent over the hero (inverted text voice), then transitions to a
 * refined semi-transparent frosted glass surface on scroll.
 *
 * Behaviour:
 *   - Transparent: border transparent, background transparent
 *   - Scrolled: soft border, 95% opacity surface with backdrop blur
 *   - Hide on scroll down (after 120px), reveal on scroll up
 *   - Active page: gold underline via NavLink
 */

import { useEffect, useRef, useState } from "react";

import { cn } from "@utils/cn";

import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";
import { SiteNavigation } from "./site-navigation";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      // Surface transition (after 32px)
      setScrolled(y > 32);

      // Hide on scroll down, reveal on scroll up
      // Only hide after scrolling below 120px to avoid hiding on small scrolls
      if (y > 120) {
        if (y > lastY.current + 8) {
          setHidden(true);
        } else if (y < lastY.current - 4) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] will-change-transform",
        "transition-all duration-500 ease-out",
        // Hide/reveal on scroll direction
        hidden ? "-translate-y-full" : "translate-y-0",
        // Surface state
        scrolled
          ? "border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-[0_1px_24px_-4px_rgba(25,25,23,0.08)]"
          : "border-b border-white/0 bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-16">
        <BrandMark inverted={!scrolled} />
        <SiteNavigation inverted={!scrolled} />
        <div className="lg:hidden">
          <MobileNavigation inverted={!scrolled} />
        </div>
      </div>
    </header>
  );
}
