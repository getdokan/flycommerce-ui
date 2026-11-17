"use client"

import * as React from "react"
import { cn } from "cn"
import { FiImage as ImageIcon } from "react-icons/fi"

import { CellLink } from "@/components/cell-link"
import { ImageWithFallback } from "@/components/image-with-fallback"
import { MediaThumb } from "@/components/media-tile"

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

// A title that draws nothing would make a link with no name, so it stays plain.
function hasContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false
  if (typeof node === "string") return node.trim() !== ""
  if (Array.isArray(node)) return node.some(hasContent)
  if (React.isValidElement<React.PropsWithChildren>(node))
    return node.type !== React.Fragment || hasContent(node.props.children)
  return true
}

// The thumbnail's frame: 8px corners and a hairline ring that holds on light and dark rows.
const FRAME = "rounded-lg ring-1 ring-foreground/6"

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

  return (
    <div
      data-slot="media-cell"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    >
      <span className="flex shrink-0" style={{ width: size, height: size }}>
        {media ? (
          <MediaThumb
            data-slot="media-cell-media"
            className={cn("size-full", FRAME)}
          >
            {media}
            {alt && <span className="sr-only">{alt}</span>}
          </MediaThumb>
        ) : (
          <ImageWithFallback
            src={src}
            alt={alt ?? ""}
            containerClassName={cn("size-full", FRAME)}
            // A third of the box, but never under 16px (a 40px cell drew it at 13px, too small to read) or over 32px.
            fallback={
              <ImageIcon
                aria-hidden="true"
                className="size-1/3 max-h-8 min-h-4 max-w-8 min-w-4"
              />
            }
          />
        )}
      </span>
      <div className="min-w-0">
        {href && hasContent(title) ? (
          <div className="flex min-w-0 font-medium text-foreground">
            <CellLink href={href} title={hover} onNavigate={onNavigate}>
              {title}
            </CellLink>
          </div>
        ) : (
          <div className="truncate font-medium text-foreground" title={hover}>
            {title}
          </div>
        )}
        {description && (
          <div className="truncate type-caption-m text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export { MediaCell, type MediaCellProps }
