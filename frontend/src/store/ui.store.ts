/** UI store — global ephemeral UI state (toasts, overlays, scroll position). */

import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

export type ToastTone = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs?: number;
}

interface UIState {
  theme: Theme;
  /** True when the mobile navigation drawer is open. */
  mobileNavOpen: boolean;
  /** True when any modal/drawer is open (locks body scroll). */
  overlayOpen: boolean;
  /** Accessible modal stack — topmost entry owns focus. */
  modalStack: string[];
  toasts: Toast[];
  /** Set by a route change listener; drives view-transition animations. */
  isNavigating: boolean;

  setTheme: (theme: Theme) => void;
  setMobileNavOpen: (open: boolean) => void;
  pushModal: (id: string) => void;
  popModal: (id: string) => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  setIsNavigating: (isNavigating: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  theme: "system",
  mobileNavOpen: false,
  overlayOpen: false,
  modalStack: [],
  toasts: [],
  isNavigating: false,

  setTheme: (theme) => set({ theme }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  pushModal: (id) => set((state) => ({ modalStack: [...state.modalStack, id], overlayOpen: true })),
  popModal: (id) =>
    set((state) => {
      const modalStack = state.modalStack.filter((m) => m !== id);
      return { modalStack, overlayOpen: modalStack.length > 0 };
    }),
  pushToast: (toast) => {
    const id = crypto.randomUUID();
    const toastWithId: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, toastWithId] }));
    const durationMs = toast.durationMs ?? 4000;
    if (durationMs > 0) {
      setTimeout(() => {
        useUIStore.getState().dismissToast(id);
      }, durationMs);
    }
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setIsNavigating: (isNavigating) => set({ isNavigating }),
}));

/** Convenience helpers used across the app. */
export const ui = {
  toast: (toast: Omit<Toast, "id">) => useUIStore.getState().pushToast(toast),
};
