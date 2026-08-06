/** Typed Zustand persist helpers with a consistent storage strategy. */

import { createJSONStorage } from "zustand/middleware";

/**
 * Safe JSON storage — returns a no-op storage when unavailable (SSR, private
 * mode, disabled cookies). This keeps `createJSONStorage`'s type contract
 * satisfied in every environment.
 */
export const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  try {
    window.localStorage.setItem("__va_probe__", "1");
    window.localStorage.removeItem("__va_probe__");
    return window.localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
});

/** Base persistence options (namespaced key + storage). */
export function persistBase(name: string): {
  name: string;
  storage: typeof storage;
  skipHydration: true;
} {
  return {
    name: `vision-amanya:${name}`,
    storage,
    skipHydration: true,
  };
}
