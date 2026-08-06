import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readSessionCookie } from "@lib/server/cookies";

/**
 * Authenticated-area shell.
 *
 * Server-side gate: without a session cookie the user is bounced to /login.
 * Note that layouts do not re-run on client-side navigations — the full
 * guard (page/route-handler level) is introduced when real account pages land.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const refreshToken = await readSessionCookie();
  if (!refreshToken) {
    const pathname = (await headers()).get("x-pathname") ?? "/dashboard";
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold tracking-tight">Account</span>
          {/* Authenticated navigation goes here (see @config/navigation). */}
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
