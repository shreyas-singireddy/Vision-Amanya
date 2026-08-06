"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary: handles failures inside the root layout itself.
 * Must render its own `<html>`/`<body>` and carries no global styles, so the
 * theme tokens are inlined directly.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Vision Amanya — Error</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; }
          body {
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            background: #fbfaf7; color: #1c1917;
            min-height: 100vh; display: grid; place-items: center; padding: 24px;
          }
          .card { max-width: 420px; text-align: center; }
          h1 { font-size: 28px; margin-bottom: 12px; }
          p { color: #57534e; line-height: 1.6; margin-bottom: 24px; }
          button {
            font: inherit; border: 0; cursor: pointer; border-radius: 8px;
            background: #2c6f52; color: #fff; padding: 12px 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again, or refresh the page.</p>
          <button onClick={() => unstable_retry()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
