/** TanStack Query client factory. */

import { QueryClient } from "@tanstack/react-query";

import { queryConfig } from "@config/query";

/** Create a fresh QueryClient wired to the app's caching defaults. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryConfig.defaultStaleTime,
        gcTime: queryConfig.defaultGcTime,
        retry: queryConfig.defaultRetry,
        retryDelay: queryConfig.retryDelay,
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
