"use client";

/** PhoneInput — phone field with selectable country code prefix and light
 * digit formatting. Used in enquiry/contact forms. */

import { forwardRef, useId, useState } from "react";

import { cn } from "@utils/cn";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface CountryCode {
  iso: string;
  dial: string;
  label: string;
  /** Default leading digits for common cases, e.g. "98" for India. */
  placeholder: string;
}

const defaultCountries: CountryCode[] = [
  { iso: "IN", dial: "+91", label: "India", placeholder: "98765 43210" },
  { iso: "AE", dial: "+971", label: "UAE", placeholder: "50 123 4567" },
  { iso: "GB", dial: "+44", label: "UK", placeholder: "7700 900123" },
  { iso: "US", dial: "+1", label: "USA", placeholder: "(555) 123-4567" },
  { iso: "SG", dial: "+65", label: "Singapore", placeholder: "8123 4567" },
];

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  /** Extra countries beyond the defaults. */
  countries?: CountryCode[];
  defaultDial?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, countries = [], defaultDial = "+91", value = "", onChange, ...props }, ref) => {
    const id = useId();
    const [dial, setDial] = useState(defaultDial);
    const all = [
      ...defaultCountries,
      ...countries.filter((c) => !defaultCountries.some((d) => d.iso === c.iso)),
    ];

    const active = all.find((c) => c.dial === dial) ?? all[0]!;

    return (
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-input border border-input bg-card shadow-xs transition-[border-color,box-shadow] duration-fast ease-standard hover:border-neutral-400 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15",
          className
        )}
      >
        <Select value={dial} onValueChange={setDial}>
          <SelectTrigger
            aria-label="Country code"
            className="h-11 w-24 shrink-0 rounded-none border-0 bg-transparent px-3 shadow-none hover:border-0 focus-visible:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {all.map((c) => (
              <SelectItem key={c.iso} value={c.dial}>
                {c.label} {c.dial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span
          aria-hidden
          className="flex items-center border-l border-border px-2 text-sm text-muted-foreground"
        >
          {active.dial}
        </span>
        <input
          ref={ref}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={active.placeholder}
          className="h-11 w-full min-w-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          {...props}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";
