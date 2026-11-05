"use client"

import * as React from "react"
import { cn } from "cn"

import { ImageWithFallback } from "@/components/image-with-fallback"
import { MediaFileGlyph, MediaPlayMark } from "@/components/media-tile"

type PreviewStageProps = React.ComponentProps<"div">

/** A dot-grid ground that centres a file or a page preview at its own shape. */
function PreviewStage({ className, ...props }: PreviewStageProps) {
  return (
    <div
      data-slot="preview-stage"
      className={cn(
        "relative grid min-h-64 min-w-0 place-items-center bg-muted dot-grid p-5 sm:p-8 md:min-h-128",
        className
      )}
      {...props}
    />
  )
}

type PreviewStageImageProps = Omit<React.ComponentProps<"img">, "alt"> & {
  /** The file's alt text, or its name when it has none. */
  alt: string
  /** Shown when `src` is missing or fails to load. */
  fallback?: React.ReactNode
}

/** An image at its own shape with a soft shadow, as large as the stage allows. */
function PreviewStageImage({
  src,
  alt,
  width,
  height,
  fallback,
  className,
  style,
  onLoad,
  onError,
  ...props
}: PreviewStageImageProps) {
  // Which src has settled, so a new file starts over.
  const [settled, setSettled] = React.useState<{
    src: typeof src
    failed: boolean
  }>()
  const current = settled?.src === src ? settled : undefined

  if (!src || current?.failed)
    return (
      <ImageWithFallback
        alt={alt}
        fallback={fallback}
        containerClassName={cn(
          "aspect-video w-full max-w-lg rounded-md shadow-preview",
          className
        )}
      />
    )

  const ratio = Number(width) / Number(height)
  // With its size known, the image holds its box until it loads: as wide as fits, never past its own width. Once loaded, the file's own size takes over.
  const reserve = !current && ratio > 0 && Number.isFinite(ratio)
  return (
    <img
      data-slot="preview-stage-image"
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      className={cn(
        "block h-auto max-h-(--preview-stage-media-h) w-auto max-w-full rounded-md object-contain shadow-preview [--preview-stage-media-h:--spacing(56)] md:[--preview-stage-media-h:--spacing(104)]",
        className
      )}
      style={
        reserve
          ? {
              aspectRatio: `auto ${width} / ${height}`,
              width: `min(100%, ${width}px, calc(var(--preview-stage-media-h) * ${ratio}))`,
              ...style,
            }
          : style
      }
      onLoad={(event) => {
        setSettled({ src, failed: false })
        onLoad?.(event)
      }}
      onError={(event) => {
        setSettled({ src, failed: true })
        onError?.(event)
      }}
      {...props}
    />
  )
}

type PreviewStageVideoLabels = {
  /** The play button's name; `newTab` is true when it opens `href` in a new tab. */
  play?: (name: string, newTab: boolean) => string
}

const DEFAULT_VIDEO_LABELS: Required<PreviewStageVideoLabels> = {
  play: (name, newTab) =>
    newTab ? `Play ${name} (opens in a new tab)` : `Play ${name}`,
}

type PreviewStageVideoProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onPlay"
> & {
  ref?: React.Ref<HTMLElement>
  /** The poster image, e.g. the YouTube thumbnail. */
  poster: string
  /** The video's name, read in the play button's name. */
  name: string
  /** Where the video plays, e.g. its YouTube link; opens in a new tab. */
  href?: string
  /** Called on play, a click or a middle-click; without `href`, the app opens the video itself. `preventDefault()` keeps the link from opening. */
  onPlay?: (event: React.MouseEvent<HTMLElement>) => void
  labels?: PreviewStageVideoLabels
}

/** A video poster with a large play mark that opens the video. */
function PreviewStageVideo({
  poster,
  name,
  href,
  onPlay,
  labels: labelsProp,
  className,
  ref,
  onClick,
  onAuxClick,
  "aria-label": ariaLabel,
  ...props
}: PreviewStageVideoProps) {
  const labels = { ...DEFAULT_VIDEO_LABELS, ...labelsProp }
  const label = ariaLabel ?? labels.play(name, Boolean(href))
  const content = (
    <>
      <img
        src={poster}
        alt=""
        draggable={false}
        className="block aspect-video w-full object-cover"
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <MediaPlayMark
          size="lg"
          className="backdrop-blur-sm transition-colors group-hover/video:bg-foreground/75"
        />
      </span>
    </>
  )
  const classes = cn(
    "group/video relative block w-full max-w-lg overflow-hidden rounded-md shadow-preview outline-none focus-visible:ring-3 focus-visible:ring-ring",
    className
  )

  const click = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event)
    onPlay?.(event)
  }

  if (href) {
    return (
      <a
        {...props}
        ref={ref as React.Ref<HTMLAnchorElement>}
        data-slot="preview-stage-video"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={click}
        onAuxClick={(event) => {
          onAuxClick?.(event)
          if (event.button === 1) onPlay?.(event)
        }}
        className={classes}
      >
        {content}
      </a>
    )
  }
  return (
    <button
      {...props}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      data-slot="preview-stage-video"
      aria-label={label}
      onClick={click}
      onAuxClick={onAuxClick}
      className={cn("cursor-pointer", classes)}
    >
      {content}
    </button>
  )
}

type PreviewStageDocumentProps = Omit<
  React.ComponentProps<"span">,
  "children"
> & {
  /** The file name with its extension; the extension shows on the glyph. */
  name: string
}

/** A document's file-type glyph with its extension, for files with no picture. */
function PreviewStageDocument({
  name,
  className,
  ...props
}: PreviewStageDocumentProps) {
  return (
    <span
      data-slot="preview-stage-document"
      role="img"
      aria-label={name}
      className={cn("inline-flex", className)}
      {...props}
    >
      <MediaFileGlyph name={name} size="lg" className="size-20 sm:size-24" />
    </span>
  )
}

export {
  PreviewStage,
  PreviewStageDocument,
  PreviewStageImage,
  PreviewStageVideo,
  type PreviewStageDocumentProps,
  type PreviewStageImageProps,
  type PreviewStageProps,
  type PreviewStageVideoLabels,
  type PreviewStageVideoProps,
}
