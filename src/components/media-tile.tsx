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

import { Checkbox } from "@/components/ui/checkbox"

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
  /** Names the picture's button with `onOpen`. */
  open?: (name: string) => string
  preview?: (name: string) => string
  remove?: (name: string) => string
  private?: string
  /** Also the caption's second line for a video. */
  video?: string
  /** The caption's second line for a file, e.g. "JPG · 1.2 MB". */
  fileCaption?: (type: string, size: string) => string
}

const DEFAULT_TILE_LABELS: Required<MediaTileLabels> = {
  select: (name) => `Select ${name}`,
  open: (name) => `Open ${name}`,
  preview: (name) => `Preview ${name}`,
  remove: (name) => `Remove ${name}`,
  private: "Private",
  video: "Video",
  fileCaption: (type, size) => `${type} · ${size}`,
}

const REVEAL =
  "opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100 pointer-coarse:opacity-100"

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
  /** Clicking the picture calls this instead of `onClick`, e.g. to open the file's details; the tile isn't dimmed when `disabled`. */
  onOpen?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Adds a selection checkbox at the top start, shown on hover, focus, touch and while selected, in place of `onClick`; a selected tile gets a ring and a tint. */
  onSelectedChange?: (selected: boolean) => void
  /** Keeps the checkbox shown, e.g. while any file in the grid is selected. */
  selecting?: boolean
  /** Top-end chip, e.g. a ⋯ menu on a ghost `icon-xs` button; shown like the checkbox, and while its menu is open. */
  actions?: React.ReactNode
  onPreview?: () => void
  onRemove?: () => void
  /** Shows the file name and a second line under the picture. */
  caption?: boolean
  /** Replaces the caption's second line ("JPG · 1.2 MB", or "Video"). */
  description?: React.ReactNode
  /** `square` for a managed library; `default` is 6:5. */
  aspect?: "default" | "square"
  /** Formats the size in the caption. */
  locale?: string
  labels?: MediaTileLabels
  className?: string
}

function captionLine(
  item: MediaItem,
  labels: Required<MediaTileLabels>,
  locale?: string
) {
  if (item.videoUrl) return labels.video
  const type = fileExtension(item.name)
  const size = item.size === undefined ? "" : formatBytes(item.size, locale)
  return type && size ? labels.fileCaption(type, size) : type || size
}

/** Figma media tile: thumbnail or file glyph, selection check or checkbox, hover Preview / Remove or actions, and an optional caption. */
function MediaTile({
  item,
  selected = false,
  active = false,
  disabled = false,
  onClick,
  onOpen,
  onSelectedChange,
  selecting = false,
  actions,
  onPreview,
  onRemove,
  caption = false,
  description,
  aspect = "default",
  locale,
  labels: labelsProp,
  className,
}: MediaTileProps) {
  const labels = { ...DEFAULT_TILE_LABELS, ...labelsProp }
  const [broken, setBroken] = React.useState(false)
  const showImage = isImage(item) && !broken
  const src = item.thumbnailUrl || item.url
  const selectable = Boolean(onSelectedChange)
  const blocked = disabled && !selected

  const picture = (
    <div
      data-slot={caption ? "media-tile-picture" : "media-tile"}
      data-selected={selected || undefined}
      data-active={active || undefined}
      className={cn(
        "group/tile relative overflow-hidden rounded-lg border border-border bg-page transition-shadow data-selected:border-primary data-active:ring-2 data-active:ring-primary",
        aspect === "square" ? "aspect-square" : "aspect-[6/5]",
        selectable && "data-selected:ring-2 data-selected:ring-primary",
        !caption && className
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
          {!caption && (
            <span className="w-full truncate text-center text-xs text-muted-foreground">
              {item.name}
            </span>
          )}
        </span>
      )}

      {item.videoUrl && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground/60 text-background">
            <PlayIcon className="size-4 fill-current" aria-hidden="true" />
            {!(caption && description === undefined) && (
              <span className="sr-only">{labels.video}</span>
            )}
          </span>
        </span>
      )}
      {selectable && selected && (
        <span className="pointer-events-none absolute inset-0 bg-primary/10" />
      )}
      {item.isPrivate && (
        <span className="pointer-events-none absolute start-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground-secondary shadow-1">
          <LockIcon className="size-3" aria-hidden="true" />
          {labels.private}
        </span>
      )}

      {onOpen ? (
        <button
          type="button"
          aria-label={labels.open(item.title || item.name)}
          onClick={onOpen}
          className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
        />
      ) : (
        onClick &&
        !selectable && (
          <button
            type="button"
            aria-label={labels.select(item.title || item.name)}
            aria-pressed={selected}
            aria-disabled={blocked || undefined}
            onClick={(event) => {
              if (blocked) return
              onClick(event)
            }}
            className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset aria-disabled:cursor-not-allowed"
          />
        )
      )}
      {blocked && !onOpen && (
        <span className="pointer-events-none absolute inset-0 bg-background/50" />
      )}

      {selectable && (
        <span
          className={cn(
            "absolute start-2 top-2 flex size-7 items-center justify-center rounded-md bg-background shadow-1",
            !(selected || selecting) && REVEAL
          )}
        >
          <Checkbox
            checked={selected}
            disabled={blocked}
            aria-label={labels.select(item.title || item.name)}
            onCheckedChange={(checked) => onSelectedChange?.(checked === true)}
          />
        </span>
      )}

      {selected && !selectable && (
        <span className="pointer-events-none absolute end-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-1">
          <CheckIcon className="size-3" strokeWidth={3} aria-hidden="true" />
        </span>
      )}

      {(onPreview || onRemove || actions) && !(selected && !selectable) && (
        <span
          className={cn(
            "absolute end-2 top-2 flex gap-1.5 has-data-[state=open]:opacity-100",
            REVEAL
          )}
        >
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
          {actions && (
            <span className="flex size-7 items-center justify-center rounded-md bg-background text-foreground-secondary shadow-1">
              {actions}
            </span>
          )}
        </span>
      )}
    </div>
  )

  if (!caption) return picture

  return (
    <div
      data-slot="media-tile"
      data-selected={selected || undefined}
      data-active={active || undefined}
      className={cn("group/tile flex min-w-0 flex-col gap-2", className)}
    >
      {picture}
      <div className="min-w-0">
        <div
          title={item.name}
          className="truncate text-sm font-[560] text-foreground"
        >
          {item.name}
        </div>
        <div className="truncate text-xs text-muted-foreground tabular-nums">
          {description ?? captionLine(item, labels, locale)}
        </div>
      </div>
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
