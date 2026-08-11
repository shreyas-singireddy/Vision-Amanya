"use client";

/** BuildingCard — tower/tower-phase overview card: title, phase, residence
 * count, floors and a "View residences" affordance. */

import { Building2 } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TextLink } from "../ui/link";
import { Stat } from "../ui/stat";
import { PropertyBadge, type PropertyBadgeProps } from "./badges";

export interface BuildingCardProps {
  title: string;
  description?: string;
  status?: PropertyBadgeProps["status"];
  residences?: number;
  floors?: number;
  /** Text + href for the footer link. */
  href?: string;
  linkLabel?: string;
  className?: string;
}

export const BuildingCard = forwardRef<HTMLDivElement, BuildingCardProps>(
  (
    {
      title,
      description,
      status,
      residences,
      floors,
      href,
      linkLabel = "View residences",
      className,
    },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn(
        "flex h-full flex-col transition-[transform,box-shadow,border-color] duration-slow ease-out-expo hover:-translate-y-1 hover:shadow-elevated",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-sm">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
          >
            <Building2 className="h-5 w-5" strokeWidth={1.5} />
          </span>
          {status ? <PropertyBadge status={status} /> : null}
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      {residences || floors ? (
        <CardContent className="flex items-center gap-lg border-t border-border pt-5">
          {residences ? <Stat label="Residences" value={String(residences)} /> : null}
          {floors ? <Stat label="Floors" value={String(floors)} /> : null}
        </CardContent>
      ) : null}

      {href ? (
        <CardFooter className="mt-auto">
          <TextLink href={href} arrow="right">
            {linkLabel}
          </TextLink>
        </CardFooter>
      ) : null}
    </Card>
  )
);
BuildingCard.displayName = "BuildingCard";
