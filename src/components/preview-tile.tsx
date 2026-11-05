"use client"

import * as React from "react"
import { cn } from "cn"

import { ImageWithFallback } from "@/components/image-with-fallback"
import { MediaPill } from "@/components/media-tile"
import { isPlainClick } from "@/lib/events"

type PreviewTileProps = React.ComponentProps<"div"> & {
  /** The picture; a missing or broken one shows `fallback`. */
  src?: string
  alt: string
  /** e.g. "16 / 9"; the picture keeps this shape at any width. */
  aspectRatio?: string
  /** Pill over the bottom of the picture on hover and keyboard focus (always on touch screens), e.g. "Look inside"; only with `onOpen` or `href`. */
  label?: string
  /** Drawn in the pill before `label`, or alone. */
  labelIcon?: React.ReactNode
  /** Accessible name of the picture's button or link; include the `label` words, e.g. "Look inside Lumen". Defaults to `alt`. */
  openLabel?: string
  /** Draws the brand ring, e.g. on the live theme; say why in the footer too, e.g. a "Live" badge. */
  highlighted?: boolean
  /** Shown when `src` is missing or fails to load. */
  fallback?: React.ReactNode
} & (
    | {
        /** Makes the picture a button. */
        onOpen?: () => void
        href?: never
        onNavigate?: never
      }
    | {
        onOpen?: never
        /** Makes the picture a link. */
        href: string
        /** Called on a plain click of the link, for a client-side router; a modified click (new tab) opens `href` as usual. */
        onNavigate?: () => void
      }
  )

const OPEN_CONTROL =
  "absolute inset-0 cursor-pointer rounded-t-xl outline-none group-has-[+:empty]/picture:rounded-b-xl focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"

/** A picture tile that opens a detail view, with a hover label, a highlighted ring and its own footer below the picture. */
function PreviewTile({
  src,
  alt,
  aspectRatio = "4 / 3",
  label,
  openLabel,
  labelIcon,
  onOpen,
  href,
  onNavigate,
  highlighted = false,
  fallback,
  className,
  children,
  ...props
}: PreviewTileProps) {
  const interactive = Boolean(href || onOpen)

  return (
    <div
      data-slot="preview-tile"
      data-highlighted={highlighted || undefined}
      className={cn(
        "isolate flex min-w-0 flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground shadow-card data-highlighted:ring-2 data-highlighted:ring-primary",
        className
      )}
      {...props}
    >
      <div data-slot="preview-tile-picture" className="group/picture relative">
        <ImageWithFallback
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          fallback={fallback}
          containerClassName="flex w-full rounded-none"
          className={cn(
            interactive &&
              "transition-transform duration-300 motion-safe:group-hover/picture:scale-105 motion-safe:group-has-focus-visible/picture:scale-105"
          )}
        />
        {(label || labelIcon) && interactive && (
          <MediaPill
            aria-hidden="true"
            className="opacity-0 transition-opacity group-hover/picture:opacity-100 group-has-focus-visible/picture:opacity-100 pointer-coarse:opacity-100"
          >
            {labelIcon}
            {label}
          </MediaPill>
        )}
        {href ? (
          <a
            href={href}
            aria-label={openLabel ?? alt}
            onClick={(event) => {
              if (!onNavigate || !isPlainClick(event)) return
              event.preventDefault()
              onNavigate()
            }}
            className={OPEN_CONTROL}
          />
        ) : (
          onOpen && (
            <button
              type="button"
              aria-label={openLabel ?? alt}
              onClick={() => onOpen()}
              className={OPEN_CONTROL}
            />
          )
        )}
      </div>
      {/* Always rendered, so one :empty rule hides it and rounds the picture's corners. */}
      <div
        data-slot="preview-tile-footer"
        className="flex flex-1 flex-col gap-3 p-4 empty:hidden"
      >
        {children}
      </div>
    </div>
  )
}

export { PreviewTile, type PreviewTileProps }
