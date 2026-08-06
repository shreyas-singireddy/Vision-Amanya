"use client";

import { useEffect } from "react";

import { Button } from "@components/ui/button";

/**
 * Root error boundary. Renders when a segment throws during rendering.
 * In production, server errors surface a generic message; `digest` links to
 * the matching server-side log.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Route to an error-reporting service (Sentry/LogRocket) in a later phase.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-24">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          An unexpected error occurred. Try again, or refresh the page. If the problem persists,
          contact us.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button onClick={() => unstable_retry()}>Try again</Button>
        </div>
      </div>
    </main>
  );
}
