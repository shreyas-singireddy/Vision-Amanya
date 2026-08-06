"use client";

/** Theme provider — resolves `light | dark | system` and applies the `dark`
 * class to `<html>`, so Tailwind v4 `dark:` variants and CSS variables react.
 */

import { useEffect } from "react";

import { useUIStore, type Theme } from "@store/ui.store";

const STORAGE_KEY = "vision-amanya:theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference: Theme): "light" | "dark" {
  if (preference === "system") return getSystemTheme();
  return preference;
}

function applyTheme(resolved: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  // Initial application on mount (after hydration).
  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  // Persist the preference.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Follow OS changes while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(getSystemTheme());
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  // Restore a saved preference on first load.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        setTheme(saved);
      }
    } catch {
      // ignore
    }
  }, [setTheme]);

  return null;
}
