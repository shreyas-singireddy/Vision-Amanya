/** User session store — lightweight mirror of the auth user for UI components.
 *
 * The source of truth is `useAuthStore`; this store exists so feature slices
 * (favourites, assistant, notifications) can react to the user's presence
 * without reaching into the auth store.
 */

import { create } from "zustand";

import type { User } from "@domain/auth";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

/** Keep the user store in sync with the auth store. */
export function syncUserStore(authUser: User | null): void {
  const { user, setUser, clearUser } = useUserStore.getState();
  const same = authUser?.id === user?.id && Boolean(authUser) === Boolean(user);
  if (!same) {
    if (authUser) setUser(authUser);
    else clearUser();
  }
}
