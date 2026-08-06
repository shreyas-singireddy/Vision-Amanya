/** Authentication store — session state for the whole app.
 *
 * Only non-sensitive state is persisted (user + status). The access token is
 * kept in the in-memory `tokenStore`; the refresh token lives in an httpOnly
 * cookie owned by the BFF route handlers.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@domain/auth";

import { tokenStore } from "@lib/token-store";

import { persistBase, storage } from "./create-store";

export type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface PersistedAuthState {
  status: AuthStatus;
  user: User | null;
  lastHydratedAt: number | null;
}

interface AuthState extends PersistedAuthState {
  /** True until the persisted session has been restored on the client. */
  isHydrating: boolean;

  /** Record a fresh token pair + user from a successful auth call. */
  setSession: (user: User, accessToken: string, expiresAtMs: number) => void;

  /** Update the in-memory access token after a refresh. */
  setAccessToken: (accessToken: string, expiresAtMs: number) => void;

  /** Update just the user profile. */
  setUser: (user: User) => void;

  /** Clear the session (logout / session expired). */
  clearSession: () => void;

  /** Restore persisted state once the client is ready. */
  hydrate: () => Promise<void>;
}

const initialState: PersistedAuthState = {
  status: "idle",
  user: null,
  lastHydratedAt: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isHydrating: true,

      setSession: (user, accessToken, expiresAtMs) => {
        tokenStore.set(accessToken, expiresAtMs);
        set({
          status: "authenticated",
          user,
          lastHydratedAt: Date.now(),
          isHydrating: false,
        });
      },

      setAccessToken: (accessToken, expiresAtMs) => {
        tokenStore.set(accessToken, expiresAtMs);
      },

      setUser: (user) => set({ user }),

      clearSession: () => {
        tokenStore.clear();
        set({ status: "unauthenticated", user: null });
      },

      hydrate: async () => {
        if (typeof window === "undefined") return;
        await useAuthStore.persist.rehydrate();
        const persistedUser = useAuthStore.getState().user;
        if (persistedUser) {
          set({ status: "authenticated", isHydrating: false });
        } else {
          set({ status: "unauthenticated", isHydrating: false });
        }
      },
    }),
    {
      ...persistBase("auth"),
      partialize: (state) => ({
        status: state.status,
        user: state.user,
        lastHydratedAt: state.lastHydratedAt,
      }),
      storage,
    }
  )
);

/** Convenience selector for the most common reads. */
export const selectAuthState = (s: AuthState) => ({
  status: s.status,
  isAuthenticated: s.status === "authenticated",
  isHydrating: s.isHydrating,
  user: s.user,
});
