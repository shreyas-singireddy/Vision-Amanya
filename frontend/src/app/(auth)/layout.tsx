import Link from "next/link";

import { siteConfig } from "@config/site";

/**
 * Auth shell — narrow centered column, no marketing chrome.
 * Sign-in/sign-up flows live under this group.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-16 items-center justify-center border-b border-border">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
