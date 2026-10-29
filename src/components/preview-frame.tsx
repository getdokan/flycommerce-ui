import * as React from "react"
import { cn } from "cn"

import { ImageWithFallback } from "@/components/image-with-fallback"

type PreviewFrameProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The picture, e.g. a theme's screenshot; missing or broken shows `fallback`. */
  src?: string
  alt: string
  /** The store's domain in the address field, e.g. "maisonoriel.com". */
  address?: string
  /** `browser` draws a window bar above the picture; `none` is just the rounded picture. */
  chrome?: "browser" | "none"
  /** Shown when `src` is missing or fails to load. */
  fallback?: React.ReactNode
  /** e.g. "16 / 10"; fills the box and shows the top of a taller picture, as a browser window would. */
  aspectRatio?: string
}

/** A store or theme picture in a mock browser window with the domain in its address field. */
function PreviewFrame({
  src,
  alt,
  address,
  chrome = "browser",
  fallback,
  aspectRatio,
  className,
  ...props
}: PreviewFrameProps) {
  return (
    <div
      data-slot="preview-frame"
      data-chrome={chrome}
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-preview",
        className
      )}
      {...props}
    >
      {chrome === "browser" && (
        <div
          data-slot="preview-frame-bar"
          className="flex items-center gap-3 border-b border-border bg-muted px-3 py-2"
        >
          <span aria-hidden="true" className="flex shrink-0 gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          </span>
          <span
            data-slot="preview-frame-address"
            aria-hidden={address ? undefined : true}
            className="flex h-6 min-w-0 flex-1 items-center rounded-md border border-border bg-card px-2.5 text-xs text-muted-foreground"
          >
            {/* The domain takes its own direction, so it keeps its start when cut short on either page direction. */}
            {address && (
              <span dir="auto" translate="no" className="min-w-0 truncate">
                {address}
              </span>
            )}
          </span>
        </div>
      )}
      <ImageWithFallback
        src={src}
        alt={alt}
        fallback={fallback}
        aspectRatio={aspectRatio}
        draggable={false}
        className="object-top"
        containerClassName="flex w-full rounded-none bg-card data-failed:aspect-video"
      />
    </div>
  )
}

export { PreviewFrame, type PreviewFrameProps }
