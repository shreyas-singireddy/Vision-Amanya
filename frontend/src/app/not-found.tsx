import Link from "next/link";

import { Button } from "@components/ui/button";

/** Root 404 UI — rendered for unknown routes and `notFound()` calls. */
export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-24">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          The page you are looking for does not exist or has moved. Check the address, or head back
          to the homepage.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
