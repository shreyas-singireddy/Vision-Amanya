/** Public marketing shell — header + main + footer placeholders.
 *
 * Header/footer chrome is driven by `@config/navigation`; richer components
 * (mobile menu, dropdowns) mount here in a later phase. `main` carries the
 * `#main-content` id consumed by the skip link.
 */

import Link from "next/link";

import { navigationConfig } from "@config/navigation";
import { siteConfig } from "@config/site";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const primaryNav = navigationConfig.main.filter((item) => !item.requiresAuth && !item.guestOnly);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-sticky border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>{siteConfig.developer.name}</span>
        </div>
      </footer>
    </div>
  );
}
