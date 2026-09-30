import * as React from "react"
import { cn } from "cn"

import { ImageWithFallback } from "@/components/image-with-fallback"

type MediaCellProps = React.ComponentProps<"div"> & {
  src?: string
  title: React.ReactNode
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
  title,
  description,
  alt,
  size = 36,
  className,
  ...props
}: MediaCellProps) {
  return (
    <div
      data-slot="media-cell"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    >
      <span className="flex shrink-0" style={{ width: size, height: size }}>
        <ImageWithFallback
          src={src}
          alt={alt ?? ""}
          containerClassName="size-full rounded-md border border-border-subtle"
        />
      </span>
      <div className="min-w-0">
        <div className="truncate font-[560] text-foreground">{title}</div>
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
