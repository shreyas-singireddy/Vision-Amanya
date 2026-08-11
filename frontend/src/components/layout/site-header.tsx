"use client";

/** SiteHeader — the global chrome, fixed to the top.
 *
 * Transparent over the page's hero band (inverted voice), then slides to a
 * solid surface once the user scrolls. Right side swaps desktop navigation
 * for the mobile drawer on small screens.
 */

import { useEffect, useState } from "react";

import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";
import { SiteNavigation } from "./site-navigation";

import { cn } from "@utils/cn";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-base ease-standard",
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <BrandMark inverted={!scrolled} />
        <SiteNavigation inverted={!scrolled} />
        <div className="lg:hidden">
          <MobileNavigation inverted={!scrolled} />
        </div>
      </div>
    </header>
  );
}
