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
  onPreview?: (item: MediaItem) => void
  onRemove?: (item: MediaItem) => void
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
  onPreview,
  onRemove,
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

  const grid =
    "grid grid-cols-[repeat(auto-fill,minmax(min(140px,40%),1fr))] gap-3"

  if (loading) {
    return (
      <div className={cn(grid, className)} aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Skeleton key={i} className="aspect-[6/5] rounded-lg" />
        ))}
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
    <div className={cn("flex flex-col gap-4", className)}>
      {full && (
        <p role="status" className="text-xs text-muted-foreground">
          {labels.maxReached(max!)}
        </p>
      )}
      <div className={grid}>
        {items.map((item) => (
          <MediaTile
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            active={activeId === item.id}
            disabled={full}
            onClick={onSelectedChange ? () => toggle(item) : undefined}
            onPreview={onPreview ? () => onPreview(item) : undefined}
            onRemove={onRemove ? () => onRemove(item) : undefined}
            labels={labels}
          />
        ))}
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
