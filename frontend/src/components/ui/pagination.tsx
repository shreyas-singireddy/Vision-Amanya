"use client";

/** Pagination — understated numbered paging with previous/next controls. */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  totalPages: number;
  currentPage: number;
  /** Receives the target page. Wire to navigation in business phases. */
  onPageChange: (page: number) => void;
}

function PageButton({
  page,
  current,
  onPageChange,
  ...props
}: ComponentProps<"button"> & {
  page: number;
  current: number;
  onPageChange: (page: number) => void;
}) {
  const isActive = page === current;
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={() => onPageChange(page)}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15",
        isActive
          ? "bg-primary-600 text-white"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      )}
      {...props}
    >
      {page}
    </button>
  );
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast ease-standard hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <PageButton key={page} page={page} current={currentPage} onPageChange={onPageChange} />
      ))}

      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast ease-standard hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
