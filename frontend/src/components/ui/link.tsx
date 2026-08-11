"use client";

/** TextLink — editorial inline link with an animated underline and optional
 * trailing arrow. Uses `next/link` for internal routes and plain `<a>` for
 * external `href`s. */

import { ArrowUpRight } from "lucide-react";
import { forwardRef } from "react";
import type { Route } from "next";
import NextLink from "next/link";

import { cn } from "@utils/cn";

type Arrow = "right" | "up-right" | "none";

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Internal route; if false (or a full URL) an `<a>` is rendered. */
  internal?: boolean;
  arrow?: Arrow;
  /** Underline style. */
  variant?: "underline" | "subtle";
  /** Invert for dark surfaces. */
  inverted?: boolean;
}

const arrowClass = (arrow: Arrow) =>
  arrow === "right"
    ? "after:content-[''] after:ml-1 after:inline-block after:w-0 after:overflow-hidden after:whitespace-nowrap after:transition-all after:duration-200 group-hover:after:w-[1.2em]"
    : arrow === "up-right"
      ? ""
      : "";

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      className,
      href,
      internal = true,
      arrow = "right",
      variant = "underline",
      inverted = false,
      children,
      ...props
    },
    ref
  ) => {
    const external = !internal || /^https?:\/\//i.test(href);
    const cls = cn(
      "group inline-flex items-baseline gap-1 text-sm font-medium transition-colors",
      inverted
        ? "text-neutral-50 hover:text-neutral-100"
        : arrow === "none"
          ? "text-muted-foreground hover:text-foreground"
          : "text-primary-800 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-200",
      variant === "underline" &&
        (inverted
          ? "underline decoration-neutral-50/40 underline-offset-4 hover:decoration-neutral-50/80"
          : "underline decoration-primary-400/40 underline-offset-4 hover:decoration-primary-600/70"),
      arrow === "up-right" && "items-center",
      arrowClass(arrow),
      className
    );

    const content = (
      <>
        {children}
        {arrow === "up-right" ? (
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        ) : null}
      </>
    );

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <NextLink ref={ref} href={href as Route} className={cls} {...props}>
        {content}
      </NextLink>
    );
  }
);
TextLink.displayName = "TextLink";
