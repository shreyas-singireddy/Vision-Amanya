"use client";

/** BudgetSelect — budget range picker for enquiry forms, presented as
 * selectable price chips (INR crore/lakh brackets by default). */

import { Check } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

export interface BudgetOption {
  value: string;
  label: string;
}

export const defaultBudgetOptions: BudgetOption[] = [
  { value: "under-50l", label: "Under ₹50 L" },
  { value: "50l-1cr", label: "₹50 L – ₹1 Cr" },
  { value: "1cr-2cr", label: "₹1 Cr – ₹2 Cr" },
  { value: "2cr-5cr", label: "₹2 Cr – ₹5 Cr" },
  { value: "above-5cr", label: "Above ₹5 Cr" },
];

export interface BudgetSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: BudgetOption[];
  className?: string;
}

export const BudgetSelect = forwardRef<HTMLDivElement, BudgetSelectProps>(
  ({ value, onChange, options = defaultBudgetOptions, className }, ref) => (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Budget"
      className={cn("grid grid-cols-2 gap-xs sm:grid-cols-3", className)}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "flex h-11 items-center justify-center gap-1.5 rounded-input border px-3 text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15",
              selected
                ? "border-primary-600 bg-primary-600 text-white shadow-glow-primary"
                : "border-input bg-card text-muted-foreground hover:border-neutral-400 hover:text-foreground"
            )}
          >
            {selected ? <Check className="h-4 w-4" aria-hidden /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  )
);
BudgetSelect.displayName = "BudgetSelect";
