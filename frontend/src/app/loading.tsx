import { Spinner } from "@components/feedback/spinner";

/** Streaming fallback for Suspense boundaries without a custom loading UI. */
export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-24">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}
