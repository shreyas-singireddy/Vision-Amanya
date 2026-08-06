"use client";

/** `useLocalStorage` — SSR-safe state synced to `localStorage`. */

import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") {
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // Corrupt entry — fall through to the default.
    }
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    setStored((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Quota/private-mode failures are non-fatal.
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [stored, setValue];
}
