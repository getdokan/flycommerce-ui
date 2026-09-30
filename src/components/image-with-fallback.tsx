"use client"

import * as React from "react"
import { cn } from "cn"
import { ImageIcon } from "lucide-react"

type ImageWithFallbackProps = React.ComponentProps<"img"> & {
  /** Rendered when `src` is missing or fails to load. */
  fallback?: React.ReactNode
  /** e.g. "1 / 1" or "16 / 9"; keeps the box from jumping while loading. */
  aspectRatio?: string
  containerClassName?: string
}

/** Product and store images: rounded frame, lazy loading, and a neutral placeholder on error. */
function ImageWithFallback({
  src,
  alt,
  fallback,
  aspectRatio,
  className,
  containerClassName,
  onError,
  loading = "lazy",
  ...props
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | undefined>()
  const failed = !src || failedSrc === src

  return (
    <span
      data-slot="image"
      data-failed={failed || undefined}
      style={aspectRatio ? { aspectRatio } : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-placeholder",
        containerClassName
      )}
    >
      {failed ? (
        (fallback ?? (
          <ImageIcon aria-hidden="true" className="size-1/3 max-h-8 max-w-8" />
        ))
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={cn("size-full object-cover", className)}
          onError={(event) => {
            setFailedSrc(src)
            onError?.(event)
          }}
          {...props}
        />
      )}
      {failed && alt && <span className="sr-only">{alt}</span>}
    </span>
  )
}

export { ImageWithFallback, type ImageWithFallbackProps }
