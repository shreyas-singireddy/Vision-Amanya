/** TanStack Query defaults — one place to tune caching behaviour. */

export interface QueryConfig {
  /** Global default stale time for fresh server data. */
  defaultStaleTime: number;
  /** How long inactive cache entries are kept. */
  defaultGcTime: number;
  /** Global retry policy (0 = fail fast, false = never, number = attempts). */
  defaultRetry: number;
  /** Don't refetch on window focus by default (reduces surprise traffic). */
  refetchOnWindowFocus: boolean;
  /** Retry backoff in ms. */
  retryDelay: number;
}

export const queryConfig: QueryConfig = {
  defaultStaleTime: 60_000,
  defaultGcTime: 5 * 60_000,
  defaultRetry: 1,
  refetchOnWindowFocus: false,
  retryDelay: 500,
};
