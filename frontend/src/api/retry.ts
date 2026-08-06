/** Automatic retry strategy for idempotent requests. */

export interface RetryConfig {
  /** Max automatic attempts after the original request. */
  maxRetries: number;
  /** Base delay before the first retry (ms). */
  baseDelayMs: number;
  /** Ceiling for the exponential backoff delay (ms). */
  maxDelayMs: number;
  /** Whether to add random jitter to avoid thundering-herd retries. */
  jitter: boolean;
  /** Methods considered safe to retry automatically. */
  retryableMethods: readonly string[];
  /** Statuses considered transient (retried with backoff). */
  retryableStatuses: readonly number[];
}

export const retryConfig: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 300,
  maxDelayMs: 3000,
  jitter: true,
  retryableMethods: ["GET", "HEAD", "OPTIONS"],
  retryableStatuses: [500, 502, 503, 504],
};

/** True when a request should be considered for automatic retry. */
export function isRetryable(
  method: string,
  status: number | null,
  attempts: number,
  config: RetryConfig = retryConfig
): boolean {
  if (attempts >= config.maxRetries) return false;
  if (!config.retryableMethods.includes(method)) return false;
  if (status !== null) return config.retryableStatuses.includes(status);
  // Network errors (no status) are always retryable.
  return true;
}

/** Exponential backoff with optional jitter, in ms. */
export function backoffDelay(attempt: number, config: RetryConfig = retryConfig): number {
  const exponential = Math.min(config.maxDelayMs, config.baseDelayMs * 2 ** attempt);
  if (!config.jitter) return exponential;
  // Add up to 50% jitter around the base delay.
  return exponential / 2 + Math.random() * (exponential / 2);
}

/** Sleep helper. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
