"use client";

/** Field — form-group wrapper that composes Label, control and messaging.
 *
 * Accepts either a single control as children (auto-wired with `id` and
 * `aria-invalid` via clone) or a render prop for full control:
 *
 *   <Field label="Name" error="…"><Input /></Field>
 *   <Field label="Name">{({ id, "aria-invalid": invalid }) => <Input id={id} aria-invalid={invalid} />}</Field>
 */

import {
  Children,
  cloneElement,
  forwardRef,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

import { Label } from "./label";

import { cn } from "@utils/cn";

export interface FieldControlProps {
  id: string;
  "aria-invalid": boolean;
}

export interface FieldProps {
  /** Accessible name; also used to derive the control `id`. */
  label: string;
  htmlFor?: string;
  /** Rendered with the label, above the control. */
  hint?: ReactNode;
  /** Error text — swaps the hint colour and flags `aria-invalid`. */
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactElement | ((props: FieldControlProps) => ReactNode);
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ label, htmlFor, hint, error, required = false, className, children }, ref) => {
    const generatedId = useId();
    const controlId = htmlFor ?? `field-${generatedId}`;
    const controlProps: FieldControlProps = { id: controlId, "aria-invalid": Boolean(error) };

    const control =
      typeof children === "function"
        ? children(controlProps)
        : cloneElement(Children.only(children) as ReactElement, controlProps);

    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)}>
        <Label htmlFor={controlId} required={required}>
          {label}
        </Label>
        {control}
        {error ? (
          <p
            id={`${controlId}-error`}
            role="alert"
            className="text-sm text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p className="text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Field.displayName = "Field";
