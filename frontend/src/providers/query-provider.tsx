"use client";

/** TanStack Query provider. */

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, type PropsWithChildren } from "react";

import { env } from "@lib/env";
import { createQueryClient } from "@lib/query-client";

// The devtools package is large and relies on browser-only APIs. Loading it
// dynamically avoids chunk-load failures during Fast Refresh / webpack dev.
// It is only ever enabled in development so the chunk is never requested in
// production bundles.
const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.NEXT_PUBLIC_ENVIRONMENT === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
