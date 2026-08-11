"use client";

/** `useActiveSection` — tracks which section is currently in view.
 *
 * Drives in-page navigation indicators (a nav dot/line that follows the
 * reading position). Uses a single IntersectionObserver over the provided
 * section ids.
 */

import { useEffect, useState } from "react";

export interface ActiveSectionOptions {
  /** Ids of the sections to observe (without the leading `#`). */
  ids: readonly string[];
  /** Root margin — how far the section must enter before it counts. */
  rootMargin?: string;
  /** Report on scroll instead of relying only on intersection ratio. */
  scroll?: boolean;
}

export function useActiveSection({
  ids,
  rootMargin = "-45% 0px -45% 0px",
  scroll = false,
}: ActiveSectionOptions): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  useEffect(() => {
    if (!scroll) return;

    const onScroll = () => {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          current = id;
        }
      }
      if (current) setActive(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, scroll]);

  return active;
}
