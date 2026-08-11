"use client";

/** PreferenceSelect — multi-select interest chips for enquiry forms
 * (e.g. "2 BHK", "Pool-facing", "Ready to move"). */

import { forwardRef } from "react";

import { cn } from "@utils/cn";

import { Tag } from "../ui/tag";

export interface PreferenceOption {
  value: string;
  label: string;
}

export interface PreferenceSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options?: PreferenceOption[];
  className?: string;
  /** Invert for dark sections. */
  inverted?: boolean;
}

export const PreferenceSelect = forwardRef<HTMLDivElement, PreferenceSelectProps>(
  ({ value = [], onChange, options, className, inverted = false }, ref) => {
    if (!options || options.length === 0) return null;

    const toggle = (v: string) => {
      const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
      onChange?.(next);
    };

    return (
      <div ref={ref} className={cn("flex flex-wrap gap-xs", className)}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(opt.value)}
              className={cn(
                "transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15",
                inverted ? (selected ? "rounded-full" : "opacity-70 hover:opacity-100") : undefined
              )}
            >
              {inverted ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-sm",
                    selected
                      ? "border-primary-400 bg-primary-400/20 text-neutral-50"
                      : "border-neutral-50/30 text-neutral-50/80"
                  )}
                >
                  {opt.label}
                </span>
              ) : (
                <Tag
                  tone={selected ? "primary" : "neutral"}
                  className={selected ? undefined : "bg-transparent"}
                >
                  {opt.label}
                </Tag>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);
PreferenceSelect.displayName = "PreferenceSelect";
