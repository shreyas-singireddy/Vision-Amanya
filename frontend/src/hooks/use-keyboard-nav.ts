"use client";

/** `useKeyboardNav` — arrow-key navigation for lists (menus, carousels). */

import { useEffect, type RefObject } from "react";

interface KeyboardNavOptions {
  /** Query selector for focusable items within the container. */
  selector?: string;
  /** Loop from the last item back to the first. */
  loop?: boolean;
  enabled?: boolean;
}

const DEFAULT_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useKeyboardNav<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: KeyboardNavOptions = {}
): void {
  const { selector = DEFAULT_SELECTOR, loop = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const container = ref.current;
    if (!container) return;

    const focusables = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute("hidden")
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const items = focusables();
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = event.key === "ArrowDown" ? 0 : items.length - 1;
      } else {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        nextIndex = currentIndex + direction;
        if (loop) nextIndex = (nextIndex + items.length) % items.length;
        else if (nextIndex < 0 || nextIndex >= items.length) return;
      }

      event.preventDefault();
      items[nextIndex]?.focus();
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [ref, selector, loop, enabled]);
}
