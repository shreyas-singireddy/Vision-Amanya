"use client";

/** NavLink — anchor for the luxury navigation. Gold underline animates in
 * from the left on hover and while active. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps } from "react";

import { cn } from "@utils/cn";

export interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  /** Highlight when the current path equals the href, or starts with it. */
  active?: boolean | ((pathname: string) => boolean);
  className?: string;
  /** Emit the underline — set to false for tight glyph clusters (e.g. CTAs). */
  underline?: boolean;
}

export function NavLink({
  href,
  active,
  className,
  underline = true,
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    typeof active === "function" ? active(pathname) : (active ?? pathname === href.toString());

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center text-sm font-medium text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm",
        isActive && "text-foreground",
        className
      )}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {children}
      {underline ? (
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-gold transition-transform duration-slow ease-out-expo group-hover:scale-x-100",
            isActive && "scale-x-100"
          )}
        />
      ) : null}
    </Link>
  );
}
