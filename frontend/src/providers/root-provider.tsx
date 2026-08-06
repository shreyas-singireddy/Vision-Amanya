"use client";

/** Root provider — composes client providers and bootstraps app state. */

import { useEffect, type PropsWithChildren } from "react";

import { setSessionExpiredHandler } from "@api/refresh";

import { useAuthStore, syncUserStore } from "@store/index";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export function RootProvider({ children }: PropsWithChildren) {
  const auth = useAuthStore((state) => state);

  // Restore the persisted session once, on the client.
  useEffect(() => {
    void auth.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the lightweight user store in sync.
  useEffect(() => {
    syncUserStore(auth.user);
  }, [auth.user]);

  // Redirect to login when the refresh token can no longer be exchanged.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      auth.clearSession();
      if (typeof window !== "undefined") {
        const current = window.location.pathname;
        if (current !== "/login") {
          window.location.assign(`/login?next=${encodeURIComponent(current)}`);
        }
      }
    });
    return () => setSessionExpiredHandler(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider />
      <ToastProvider />
      {children}
    </QueryProvider>
  );
}
