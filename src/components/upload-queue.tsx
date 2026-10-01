"use client"

import { cn } from "cn"
import {
  FiCheckCircle as CheckCircle2Icon,
  FiAlertCircle as CircleAlertIcon,
  FiTrash2 as Trash2Icon,
  FiUploadCloud as UploadCloudIcon,
  FiX as XIcon,
} from "react-icons/fi"

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
}

type UploadQueueLabels = {
  uploading?: string
  done?: string
  failed?: string
  of?: (loaded: string, total: string) => string
  cancel?: (name: string) => string
  remove?: (name: string) => string
}

type UploadQueueProps = {
  items: UploadQueueItem[]
  onCancel?: (id: string) => void
  onRemove?: (id: string) => void
  locale?: string
  labels?: UploadQueueLabels
  className?: string
}

const DEFAULT_LABELS: Required<UploadQueueLabels> = {
  uploading: "Uploading…",
  done: "Complete",
  failed: "Failed",
  of: (loaded, total) => `${loaded} of ${total}`,
  cancel: (name) => `Cancel ${name}`,
  remove: (name) => `Remove ${name}`,
}

/** Figma upload rows: file, bytes sent, status and a progress bar. */
function UploadQueue({
  items,
  onCancel,
  onRemove,
  locale,
  labels: labelsProp,
  className,
}: UploadQueueProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  if (items.length === 0) return null

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
            <MediaFileGlyph name={item.name} className="mt-0.5 size-9" />
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
                    {labels.done}
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
                    {Math.round(item.progress)}%
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

function QueueAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      onClick={onClick}
      className="-me-1 -mt-0.5 text-muted-foreground"
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
