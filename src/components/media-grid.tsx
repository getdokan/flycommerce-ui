"use client"

import * as React from "react"
import { cn } from "cn"
import { FiImage as ImageIcon } from "react-icons/fi"

import {
  MediaTile,
  type MediaItem,
  type MediaTileLabels,
} from "@/components/media-tile"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

type MediaGridLabels = MediaTileLabels & {
  loadMore?: string
  emptyTitle?: string
  emptyDescription?: string
  maxReached?: (max: number) => string
}

type MediaGridProps = {
  items: MediaItem[]
  /** Selected ids, in selection order. */
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  multiple?: boolean
  /** Most items that can be selected at once (multiple only). */
  max?: number
  /** The item whose details are shown; defaults to the last one clicked. */
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  /** Clicking a tile's picture opens it, also while others are selected; selection moves to a checkbox on each tile. */
  onOpen?: (item: MediaItem) => void
  /** Each tile's top-end slot, e.g. a ⋯ menu. */
  actions?: (item: MediaItem) => React.ReactNode
  onPreview?: (item: MediaItem) => void
  onRemove?: (item: MediaItem) => void
  /** Shows each file's name and a second line under its picture. */
  caption?: boolean
  /** Replaces a caption's second line ("JPG · 1.2 MB", or "Video"). */
  description?: (item: MediaItem) => React.ReactNode
  /** `square` for a managed library; `default` is 6:5. */
  aspect?: "default" | "square"
  /** `responsive`: 2 per row, then 3, 4, 5 and 6 as the grid widens; `auto` fills rows with tiles of about 140px. */
  columns?: "auto" | "responsive"
  /** Formats the sizes in the captions. */
  locale?: string
  loading?: boolean
  skeletonCount?: number
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  empty?: React.ReactNode
  labels?: MediaGridLabels
  className?: string
}

const DEFAULT_LABELS = {
  loadMore: "Load more",
  emptyTitle: "No media yet",
  emptyDescription: "Files you upload will appear here.",
  maxReached: (max: number) =>
    `You can select up to ${max} ${max === 1 ? "file" : "files"}.`,
}

/** Selectable media grid shared by the picker and the media page. */
function MediaGrid({
  items,
  selected = [],
  onSelectedChange,
  multiple = false,
  max,
  activeId: activeIdProp,
  onActiveChange,
  onOpen,
  actions,
  onPreview,
  onRemove,
  caption = false,
  description,
  aspect = "default",
  columns = "auto",
  locale,
  loading = false,
  skeletonCount = 12,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  empty,
  labels: labelsProp,
  className,
}: MediaGridProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [activeState, setActiveState] = React.useState<string | null>(null)
  const activeId = activeIdProp === undefined ? activeState : activeIdProp
  const full = multiple && max !== undefined && selected.length >= max

  const setActive = (id: string | null) => {
    if (activeIdProp === undefined) setActiveState(id)
    onActiveChange?.(id)
  }

  const toggle = (item: MediaItem) => {
    const isSelected = selected.includes(item.id)
    if (isSelected) {
      const next = selected.filter((id) => id !== item.id)
      onSelectedChange?.(next)
      setActive(next.at(-1) ?? null)
      return
    }
    if (!multiple) onSelectedChange?.([item.id])
    else if (!full) onSelectedChange?.([...selected, item.id])
    else return
    setActive(item.id)
  }

  const responsive = columns === "responsive"
  const grid = cn(
    "grid",
    responsive
      ? "grid-cols-2 @sm/media-grid:grid-cols-3 @xl/media-grid:grid-cols-4 @3xl/media-grid:grid-cols-5 @5xl/media-grid:grid-cols-6"
      : "grid-cols-[repeat(auto-fill,minmax(min(140px,40%),1fr))]",
    caption ? "gap-x-3 gap-y-4" : "gap-3"
  )

  if (loading) {
    const skeletons = Array.from({ length: skeletonCount }, (_, i) => {
      const pictureClass = cn(
        "rounded-lg",
        aspect === "square" ? "aspect-square" : "aspect-[6/5]"
      )
      if (!caption) return <Skeleton key={i} className={pictureClass} />
      return (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className={pictureClass} />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      )
    })
    if (!responsive)
      return (
        <div className={cn(grid, className)} aria-busy="true">
          {skeletons}
        </div>
      )
    return (
      <div className={cn("@container/media-grid", className)} aria-busy="true">
        <div className={grid}>{skeletons}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        responsive && "@container/media-grid",
        className
      )}
    >
      {full && (
        <p role="status" className="text-xs text-muted-foreground">
          {labels.maxReached(max!)}
        </p>
      )}
      <div className={grid}>
        {items.map((item) => {
          const select = onSelectedChange ? () => toggle(item) : undefined
          return (
            <MediaTile
              key={item.id}
              item={item}
              selected={selected.includes(item.id)}
              active={activeId === item.id}
              disabled={full}
              onClick={onOpen ? undefined : select}
              onOpen={onOpen ? () => onOpen(item) : undefined}
              onSelectedChange={onOpen ? select : undefined}
              selecting={selected.length > 0}
              actions={actions?.(item)}
              onPreview={onPreview ? () => onPreview(item) : undefined}
              onRemove={onRemove ? () => onRemove(item) : undefined}
              caption={caption}
              description={description?.(item)}
              aspect={aspect}
              locale={locale}
              labels={labels}
            />
          )
        })}
      </div>
      {hasMore && onLoadMore && (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          loading={loadingMore}
          onClick={onLoadMore}
        >
          {labels.loadMore}
        </Button>
      )}
    </div>
  )
}

export { MediaGrid, type MediaGridLabels, type MediaGridProps }
