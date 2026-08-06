"use client";

/** EmptyState / ErrorState — editorial placeholders for empty and failed
 * sections. No business logic: purely presentational. */

import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface StateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Optional action slot (button / link). */
  action?: React.ReactNode;
}

const StateBase = forwardRef<HTMLDivElement, StateProps>(
  ({ icon: Icon = Inbox, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-3 rounded-card-lg border border-dashed border-border bg-surface-subtle px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      ) : null}
      <div className="space-y-1">
        <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
);
StateBase.displayName = "StateBase";

export const EmptyState = forwardRef<HTMLDivElement, StateProps>((props, ref) => (
  <StateBase ref={ref} {...props} />
));
EmptyState.displayName = "EmptyState";

export const ErrorState = forwardRef<HTMLDivElement, Omit<StateProps, "icon">>((props, ref) => (
  <StateBase ref={ref} icon={AlertTriangle} {...props} />
));
ErrorState.displayName = "ErrorState";
