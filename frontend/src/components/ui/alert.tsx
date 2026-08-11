"use client";

/** Alert — inline contextual notice for form validation, booking feedback
 * and section-level errors. Tones map to the semantic palette. */

import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Tone = "info" | "success" | "warning" | "error";

const config: Record<Tone, { icon: LucideIcon; wrap: string; iconCls: string }> = {
  info: {
    icon: Info,
    wrap: "border-info-200 bg-info-50 text-info-900 dark:border-info-900 dark:bg-info-950 dark:text-info-200",
    iconCls: "text-info-600 dark:text-info-400",
  },
  success: {
    icon: CheckCircle2,
    wrap: "border-success-200 bg-success-50 text-success-900 dark:border-success-900 dark:bg-success-950 dark:text-success-200",
    iconCls: "text-success-600 dark:text-success-400",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-200",
    iconCls: "text-warning-600 dark:text-warning-400",
  },
  error: {
    icon: XCircle,
    wrap: "border-error-200 bg-error-50 text-error-900 dark:border-error-900 dark:bg-error-950 dark:text-error-200",
    iconCls: "text-error-600 dark:text-error-400",
  },
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  title?: string;
  description?: string;
  /** Optional action slot (button / link). */
  action?: React.ReactNode;
  /** Hide the leading icon. */
  hideIcon?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "info", title, description, action, hideIcon = false, ...props }, ref) => {
    const { icon: Icon, wrap, iconCls } = config[tone];
    return (
      <div
        ref={ref}
        role={tone === "error" ? "alert" : "status"}
        className={cn("flex items-start gap-3 rounded-card border px-4 py-3.5", wrap, className)}
        {...props}
      >
        {!hideIcon ? (
          <Icon
            aria-hidden
            className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", iconCls)}
            strokeWidth={1.75}
          />
        ) : null}
        <div className="flex-1 space-y-0.5">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          {description ? <p className="text-sm leading-relaxed opacity-85">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  }
);
Alert.displayName = "Alert";
