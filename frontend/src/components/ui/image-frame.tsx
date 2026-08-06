"use client";

/** ImageFrame — luxury photography frame: hairline border, soft inner
 * shadow, and optional gradient overlays (hero / card treatments).
 *
 * Motion choreography (zoom-on-hover, parallax) belongs to the motion phase;
 * this phase ships the static presentation only. */

import { forwardRef, type HTMLAttributes } from "react";
import { type StaticImageData } from "next/image";

import { cn } from "@utils/cn";

export type ImageFrameVariant = "standard" | "hero" | "card";

export interface ImageFrameProps extends HTMLAttributes<HTMLDivElement> {
  src: string | StaticImageData;
  alt: string;
  aspect?: "portrait" | "square" | "landscape" | "wide" | "cinematic";
  /** Photography treatment. */
  variant?: ImageFrameVariant;
  /** Show a gold caption strip (title + optional detail). */
  caption?: string;
  captionDetail?: string;
  priority?: boolean;
}

const aspectClasses = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  cinematic: "aspect-[21/9]",
};

export const ImageFrame = forwardRef<HTMLDivElement, ImageFrameProps>(
  (
    {
      className,
      src,
      alt,
      aspect = "landscape",
      variant = "standard",
      caption,
      captionDetail,
      ...props
    },
    ref
  ) => (
    <figure
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-card border border-border bg-surface-subtle",
        variant === "standard" && "shadow-card",
        variant === "hero" && "shadow-2xl",
        variant === "card" && "shadow-card",
        className
      )}
      {...props}
    >
      <div className={cn("relative overflow-hidden", aspectClasses[aspect])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={typeof src === "string" ? src : src.src}
          alt={alt}
          className="h-full w-full object-cover"
          loading={props.priority ? "eager" : "lazy"}
        />
        {/* Soft inner vignette for editorial depth. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
        />
        {variant === "hero" ? (
          <div aria-hidden className="absolute inset-0 bg-gradient-hero-overlay" />
        ) : null}
      </div>

      {caption ? (
        <figcaption className="flex items-baseline justify-between gap-4 px-5 py-4">
          <span className="text-sm font-medium text-foreground">{caption}</span>
          {captionDetail ? (
            <span className="whitespace-nowrap text-xs uppercase tracking-eyebrow text-muted-foreground">
              {captionDetail}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  )
);
ImageFrame.displayName = "ImageFrame";
