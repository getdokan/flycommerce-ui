"use client"

import * as React from "react"
import { cn } from "cn"

import { ImageWithFallback } from "@/components/image-with-fallback"

type MediaCellProps = Omit<React.ComponentProps<"div">, "title"> & {
  src?: string
  /** Drawn in the thumbnail's box instead of the image (`src` is then not used), e.g. a file-type glyph, or a video poster with a play mark. The box clips it to its rounded corners, unless a `MediaFileGlyph` is passed directly (alone or in a fragment), so the glyph's extension badge isn't cut. */
  media?: React.ReactNode
  /** The first line, truncated; text or a number also shows in full on hover. With `href`, don't pass a link here: links can't nest. */
  title: React.ReactNode
  /** Makes the title a link to the record, e.g. the product's edit page. */
  href?: string
  /** Called on a plain click of the link, for a client-side router; a click with Ctrl, ⌘, Shift or Alt is left to the browser (a new tab or window). */
  onNavigate?: () => void
  /** Second line, e.g. "by Fashion BD" or a SKU. */
  description?: React.ReactNode
  /** Empty by default: the title next to the thumbnail already names it. */
  alt?: string
  /** Square thumbnail size in px. */
  size?: number
}

/** Table cell with a thumbnail, a title and an optional second line (Figma product rows). */
function MediaCell({
  src,
  media,
  title,
  href,
  onNavigate,
  description,
  alt,
  size = 36,
  className,
  ...props
}: MediaCellProps) {
  const hover =
    typeof title === "string" || typeof title === "number"
      ? String(title)
      : undefined
  // A blank title would make an empty link with no name, so it stays plain.
  const linked = !!href && title != null && title !== "" && title !== false

  return (
    <div
      data-slot="media-cell"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    >
      <span className="flex shrink-0" style={{ width: size, height: size }}>
        {media ? (
          <span
            data-slot="media-cell-media"
            className="relative flex size-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-muted text-muted-foreground has-[>[data-slot=media-file-glyph]]:overflow-visible"
          >
            {media}
            {alt && <span className="sr-only">{alt}</span>}
          </span>
        ) : (
          <ImageWithFallback
            src={src}
            alt={alt ?? ""}
            containerClassName="size-full rounded-md border border-border-subtle"
          />
        )}
      </span>
      <div className="min-w-0">
        {linked ? (
          // Truncated on the link itself, so its focus ring isn't clipped, as in PersonCell.
          <div className="flex min-w-0 font-[560] text-foreground">
            <a
              href={href}
              title={hover}
              className="truncate rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
              onClick={
                onNavigate &&
                ((event) => {
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return
                  event.preventDefault()
                  onNavigate()
                })
              }
            >
              {title}
            </a>
          </div>
        ) : (
          <div className="truncate font-[560] text-foreground" title={hover}>
            {title}
          </div>
        )}
        {description && (
          <div className="truncate text-[12.5px] text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export { MediaCell, type MediaCellProps }
