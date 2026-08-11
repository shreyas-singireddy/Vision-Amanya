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
  /** Invert for dark surfaces (transparent header over a hero). */
  inverted?: boolean;
  className?: string;
  /** Emit the underline — set to false for tight glyph clusters (e.g. CTAs). */
  underline?: boolean;
}

export function NavLink({
  href,
  active,
  inverted = false,
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
        "group relative inline-flex items-center text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm",
        inverted
          ? "text-neutral-50/70 hover:text-neutral-50"
          : "text-muted-foreground hover:text-foreground",
        isActive && (inverted ? "text-neutral-50" : "text-foreground"),
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
