"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiCheckCircle as CheckCircle2Icon,
  FiCheck as CheckIcon,
  FiAlertCircle as CircleAlertIcon,
  FiTrash2 as Trash2Icon,
  FiAlertTriangle as TriangleAlertIcon,
  FiUploadCloud as UploadCloudIcon,
  FiX as XIcon,
} from "react-icons/fi"

import { ImageWithFallback } from "@/components/image-with-fallback"
import { formatBytes, MediaFileGlyph } from "@/components/media-tile"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type UploadQueueItem = {
  id: string
  name: string
  /** Bytes. */
  size: number
  /** 0–100. */
  progress: number
  status: "uploading" | "done" | "error"
  error?: string
  /** A link reads "Added" when done. */
  kind?: "file" | "link"
  /** The picture to show, e.g. `URL.createObjectURL(file)` or a video poster. */
  thumbnailUrl?: string
  /** Replaces the thumbnail, e.g. a type icon. */
  media?: React.ReactNode
}

type UploadQueueLabels = {
  uploading?: string
  done?: string
  failed?: string
  of?: (loaded: string, total: string) => string
  cancel?: (name: string) => string
  remove?: (name: string) => string
  /** `variant="compact"`: names the list. */
  list?: string
  /** `variant="compact"`: the line beside the progress bar. */
  progress?: (size: string, percent: string) => string
  /** `variant="compact"`: a finished file. */
  uploaded?: (size: string) => string
  /** A finished link, in place of `done` or `uploaded`. */
  added?: string
}

type UploadQueueProps = {
  items: UploadQueueItem[]
  onCancel?: (id: string) => void
  onRemove?: (id: string) => void
  /** Formats the sizes and the percent: "tr" gives "1,5 MB" and "%62". */
  locale?: string
  labels?: UploadQueueLabels
  /** `compact`: divided rows in one box that scrolls, for an upload modal. */
  variant?: "default" | "compact"
  className?: string
}

const DEFAULT_LABELS: Required<UploadQueueLabels> = {
  uploading: "Uploading…",
  done: "Complete",
  failed: "Failed",
  of: (loaded, total) => `${loaded} of ${total}`,
  cancel: (name) => `Cancel ${name}`,
  remove: (name) => `Remove ${name}`,
  list: "Uploads",
  progress: (size, percent) => `${size} · ${percent}`,
  uploaded: (size) => `Uploaded · ${size}`,
  added: "Added",
}

const formatPercent = (value: number, locale?: string) =>
  locale === undefined
    ? `${Math.round(value)}%`
    : new Intl.NumberFormat(locale, { style: "percent" }).format(
        Math.round(value) / 100
      )

/** Figma upload rows: file, bytes sent, status and a progress bar. */
function UploadQueue({
  items,
  onCancel,
  onRemove,
  locale,
  labels: labelsProp,
  variant = "default",
  className,
}: UploadQueueProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  if (items.length === 0) return null
  if (variant === "compact")
    return (
      <CompactQueue
        items={items}
        onCancel={onCancel}
        onRemove={onRemove}
        locale={locale}
        labels={labels}
        className={className}
      />
    )

  return (
    <ul
      data-slot="upload-queue"
      className={cn("flex flex-col gap-2", className)}
    >
      {items.map((item) => {
        const loaded = Math.round((item.size * item.progress) / 100)
        const uploading = item.status === "uploading"
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-card-header p-4",
              item.status === "error"
                ? "border-destructive/40"
                : "border-border-subtle"
            )}
          >
            {item.media || item.thumbnailUrl ? (
              <Thumbnail
                item={item}
                className="mt-0.5 size-9 bg-transparent"
                glyphClassName="size-full"
              />
            ) : (
              <MediaFileGlyph name={item.name} className="mt-0.5 size-9" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {item.name}
                </span>
                {uploading && onCancel && (
                  <QueueAction
                    label={labels.cancel(item.name)}
                    onClick={() => onCancel(item.id)}
                  >
                    <XIcon />
                  </QueueAction>
                )}
                {!uploading && onRemove && (
                  <QueueAction
                    label={labels.remove(item.name)}
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2Icon />
                  </QueueAction>
                )}
              </div>
              <div
                aria-live="polite"
                className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"
              >
                <span className="tabular-nums">
                  {item.status === "uploading"
                    ? labels.of(
                        formatBytes(loaded, locale),
                        formatBytes(item.size, locale)
                      )
                    : formatBytes(item.size, locale)}
                </span>
                <span aria-hidden="true">|</span>
                {item.status === "uploading" && (
                  <span className="inline-flex items-center gap-1">
                    <UploadCloudIcon className="size-3.5" aria-hidden="true" />
                    {labels.uploading}
                  </span>
                )}
                {item.status === "done" && (
                  <span className="inline-flex items-center gap-1 text-success-strong">
                    <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
                    {item.kind === "link" ? labels.added : labels.done}
                  </span>
                )}
                {item.status === "error" && (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <CircleAlertIcon className="size-3.5" aria-hidden="true" />
                    {item.error ?? labels.failed}
                  </span>
                )}
              </div>
              {item.status !== "error" && (
                <div className="flex items-center gap-3">
                  <Progress
                    value={item.progress}
                    aria-label={item.name}
                    className="h-1.5"
                  />
                  <span className="w-9 text-end text-xs text-foreground-secondary tabular-nums">
                    {formatPercent(item.progress, locale)}
                  </span>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function CompactQueue({
  items,
  onCancel,
  onRemove,
  locale,
  labels,
  className,
}: Omit<UploadQueueProps, "labels" | "variant"> & {
  labels: Required<UploadQueueLabels>
}) {
  const list = React.useRef<HTMLUListElement>(null)
  const [scrolls, setScrolls] = React.useState(false)

  React.useEffect(() => {
    const el = list.current
    if (!el) return
    const measure = () => setScrolls(el.scrollHeight > el.clientHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [items.length])

  return (
    <ul
      ref={list}
      data-slot="upload-queue"
      data-variant="compact"
      aria-label={labels.list}
      tabIndex={scrolls ? 0 : undefined}
      className={cn(
        "flex max-h-72 flex-col divide-y divide-border-subtle overflow-y-auto rounded-lg border border-border-subtle outline-none focus-visible:ring-3 focus-visible:ring-ring",
        className
      )}
    >
      {items.map((item) => {
        const size = formatBytes(item.size, locale)
        const action =
          item.status === "uploading"
            ? onCancel && { label: labels.cancel(item.name), run: onCancel }
            : item.status === "error"
              ? onRemove && { label: labels.remove(item.name), run: onRemove }
              : undefined
        return (
          <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
            {item.status === "error" ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <TriangleAlertIcon className="size-4" aria-hidden="true" />
              </span>
            ) : (
              <Thumbnail item={item} className="size-10" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{item.name}</span>
              {item.status === "uploading" && (
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress
                    value={item.progress}
                    aria-label={item.name}
                    className="h-1.5 flex-1"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {labels.progress(
                      size,
                      formatPercent(item.progress, locale)
                    )}
                  </span>
                </div>
              )}
              <div aria-live="polite">
                {item.status === "done" && (
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-success-strong">
                    <CheckIcon className="size-3.5" aria-hidden="true" />
                    {item.kind === "link"
                      ? labels.added
                      : labels.uploaded(size)}
                  </span>
                )}
                {item.status === "error" && (
                  <span className="mt-0.5 block text-xs text-destructive">
                    {item.error ?? labels.failed}
                  </span>
                )}
              </div>
            </div>
            {action && (
              <QueueAction
                label={action.label}
                onClick={() => action.run(item.id)}
                size="icon-sm"
              >
                <XIcon />
              </QueueAction>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Thumbnail({
  item,
  className,
  glyphClassName = "size-3/5",
}: {
  item: UploadQueueItem
  className?: string
  glyphClassName?: string
}) {
  const glyph = <MediaFileGlyph name={item.name} className={glyphClassName} />
  if (item.media)
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
          className
        )}
      >
        {item.media}
      </span>
    )
  return (
    <ImageWithFallback
      src={item.thumbnailUrl}
      alt=""
      fallback={glyph}
      containerClassName={cn("rounded-md", className)}
    />
  )
}

function QueueAction({
  label,
  onClick,
  size = "icon-xs",
  children,
}: {
  label: string
  onClick: () => void
  size?: "icon-xs" | "icon-sm"
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "text-muted-foreground",
        size === "icon-xs" && "-me-1 -mt-0.5"
      )}
    >
      {children}
    </Button>
  )
}

export {
  UploadQueue,
  type UploadQueueItem,
  type UploadQueueLabels,
  type UploadQueueProps,
}
