"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiCheck as CheckIcon,
  FiEye as EyeIcon,
  FiFile as FileIcon,
  FiLock as LockIcon,
  FiPlay as PlayIcon,
  FiTrash2 as Trash2Icon,
} from "react-icons/fi"

type MediaItem = {
  id: string
  url: string
  /** Smaller rendition for grids; falls back to `url`. */
  thumbnailUrl?: string
  name: string
  mimeType?: string
  /** Bytes. */
  size?: number
  width?: number
  height?: number
  alt?: string
  title?: string
  date?: Date | string
  /** Private files never render their image, only a file glyph. */
  isPrivate?: boolean
  /** Set for video entries, e.g. a YouTube link. */
  videoUrl?: string
}

type MediaTileLabels = {
  select?: (name: string) => string
  preview?: (name: string) => string
  remove?: (name: string) => string
  private?: string
  video?: string
}

const DEFAULT_TILE_LABELS: Required<MediaTileLabels> = {
  select: (name) => `Select ${name}`,
  preview: (name) => `Preview ${name}`,
  remove: (name) => `Remove ${name}`,
  private: "Private",
  video: "Video",
}

function isImage(item: Pick<MediaItem, "mimeType" | "url" | "isPrivate">) {
  if (item.isPrivate) return false
  if (item.mimeType) return item.mimeType.startsWith("image/")
  return /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/i.test(item.url)
}

function fileExtension(name: string) {
  const match = /\.([a-z0-9]+)$/i.exec(name)
  return match ? match[1].toUpperCase() : ""
}

function formatBytes(bytes: number, locale?: string) {
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`
}

/** File-type glyph with its extension, used where an image can't be shown. */
function MediaFileGlyph({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const ext = fileExtension(name)
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-center justify-center text-muted-foreground",
        className
      )}
    >
      <FileIcon className="size-full" strokeWidth={1.25} />
      {ext && (
        <span className="absolute start-[-8%] bottom-[18%] rounded-[3px] bg-primary px-1 text-[9px] leading-[14px] font-bold text-primary-foreground">
          {ext.slice(0, 4)}
        </span>
      )}
    </span>
  )
}

type MediaTileProps = {
  item: MediaItem
  selected?: boolean
  /** The tile whose details are shown. */
  active?: boolean
  /** Unselected tiles can't be picked, e.g. the selection limit is reached. */
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onPreview?: () => void
  onRemove?: () => void
  labels?: MediaTileLabels
  className?: string
}

/** Figma media tile: thumbnail or file glyph, selection check, hover Preview / Remove. */
function MediaTile({
  item,
  selected = false,
  active = false,
  disabled = false,
  onClick,
  onPreview,
  onRemove,
  labels: labelsProp,
  className,
}: MediaTileProps) {
  const labels = { ...DEFAULT_TILE_LABELS, ...labelsProp }
  const [broken, setBroken] = React.useState(false)
  const showImage = isImage(item) && !broken
  const src = item.thumbnailUrl || item.url

  return (
    <div
      data-slot="media-tile"
      data-selected={selected || undefined}
      data-active={active || undefined}
      className={cn(
        "group/tile relative aspect-[6/5] overflow-hidden rounded-lg border border-border bg-page transition-shadow data-selected:border-primary data-active:ring-2 data-active:ring-primary",
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-2 p-3">
          <MediaFileGlyph name={item.name} className="size-10" />
          <span className="w-full truncate text-center text-xs text-muted-foreground">
            {item.name}
          </span>
        </span>
      )}

      {item.videoUrl && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground/60 text-background">
            <PlayIcon className="size-4 fill-current" aria-hidden="true" />
            <span className="sr-only">{labels.video}</span>
          </span>
        </span>
      )}
      {item.isPrivate && (
        <span className="pointer-events-none absolute start-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground-secondary shadow-1">
          <LockIcon className="size-3" aria-hidden="true" />
          {labels.private}
        </span>
      )}

      {onClick && (
        <button
          type="button"
          aria-label={labels.select(item.title || item.name)}
          aria-pressed={selected}
          aria-disabled={(disabled && !selected) || undefined}
          onClick={(event) => {
            if (disabled && !selected) return
            onClick(event)
          }}
          className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset aria-disabled:cursor-not-allowed"
        />
      )}
      {disabled && !selected && (
        <span className="pointer-events-none absolute inset-0 bg-background/50" />
      )}

      {selected && (
        <span className="pointer-events-none absolute end-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-1">
          <CheckIcon className="size-3" strokeWidth={3} aria-hidden="true" />
        </span>
      )}

      {(onPreview || onRemove) && !selected && (
        <span className="absolute end-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100 pointer-coarse:opacity-100">
          {onPreview && (
            <TileAction label={labels.preview(item.name)} onClick={onPreview}>
              <EyeIcon />
            </TileAction>
          )}
          {onRemove && (
            <TileAction label={labels.remove(item.name)} onClick={onRemove}>
              <Trash2Icon />
            </TileAction>
          )}
        </span>
      )}
    </div>
  )
}

function TileAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md bg-background text-foreground-secondary shadow-1 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring [&_svg]:size-3.5"
    >
      {children}
    </button>
  )
}

export {
  formatBytes,
  isImage,
  MediaFileGlyph,
  MediaTile,
  type MediaItem,
  type MediaTileLabels,
  type MediaTileProps,
}
