/** Typed storage helpers wrapping `localStorage` / `sessionStorage`. */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function createStorage(backing: StorageLike) {
  return {
    get<T>(key: string, fallback: T): T {
      try {
        const raw = backing.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): void {
      try {
        backing.setItem(key, JSON.stringify(value));
      } catch {
        // Quota exceeded or storage unavailable — ignore for non-critical state.
      }
    },
    remove(key: string): void {
      try {
        backing.removeItem(key);
      } catch {
        // no-op
      }
    },
  };
}

/** `localStorage`-backed typed store. */
export const localStorageStore = createStorage({
  getItem: (key) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key, value) => globalThis.localStorage?.setItem(key, value),
  removeItem: (key) => globalThis.localStorage?.removeItem(key),
});

/** `sessionStorage`-backed typed store. */
export const sessionStorageStore = createStorage({
  getItem: (key) => globalThis.sessionStorage?.getItem(key) ?? null,
  setItem: (key, value) => globalThis.sessionStorage?.setItem(key, value),
  removeItem: (key) => globalThis.sessionStorage?.removeItem(key),
});
