"use client";

/** ImageCard — photography-forward card with a gradient overlay and content
 * pinned to the lower edge. The default treatment for residence, floor-plan
 * and gallery tiles. */

import { forwardRef, type HTMLAttributes, type MouseEvent } from "react";
import { type StaticImageData } from "next/image";

import { cn } from "@utils/cn";

type Aspect = "landscape" | "portrait" | "square" | "wide" | "cinematic";

const aspectClasses: Record<Aspect, string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
  cinematic: "aspect-[21/9]",
};

export interface ImageCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  src: string | StaticImageData;
  alt: string;
  aspect?: Aspect;
  /** Overlay treatment (depth vs. light). */
  overlay?: "ink" | "soft";
  /** Clicking the card anywhere triggers `onClick`. */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  priority?: boolean;
  children?: React.ReactNode;
}

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      className,
      src,
      alt,
      aspect = "landscape",
      overlay = "ink",
      onClick,
      priority = false,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-card-lg border border-border bg-surface-subtle shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        aspectClasses[aspect],
        className
      )}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={typeof src === "string" ? src : src.src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          overlay === "ink" ? "bg-gradient-ink-soft" : "bg-gradient-card"
        )}
      />
      {children ? (
        <div className="relative flex h-full flex-col justify-end gap-sm p-md sm:p-lg">
          {children}
        </div>
      ) : null}
    </div>
  )
);
ImageCard.displayName = "ImageCard";
