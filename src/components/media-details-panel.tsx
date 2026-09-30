"use client"

import * as React from "react"
import { cn } from "cn"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { formatBytes, type MediaItem } from "@/components/media-tile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type MediaDetailsPanelLabels = {
  title?: string
  none?: string
  fileName?: string
  date?: string
  size?: string
  dimensions?: string
  dimensionsValue?: (width: number, height: number) => string
  edit?: string
  delete?: string
  deleteTitle?: (name: string) => string
  deleteDescription?: string
  cancel?: string
  alt?: string
  altPlaceholder?: string
  imageTitle?: string
  imageTitlePlaceholder?: string
}

type MediaDetailsPanelProps = {
  item: MediaItem | null | undefined
  /** Called on blur with the changed field, e.g. `{ alt }`. */
  onUpdate?: (item: MediaItem, patch: Pick<MediaItem, "alt" | "title">) => void
  /** Shows "Edit Image" for images, e.g. to open a cropper. */
  onEdit?: (item: MediaItem) => void
  /** Shows "Delete Permanently", confirmed first. */
  onDelete?: (item: MediaItem) => void | Promise<void>
  locale?: string
  labels?: MediaDetailsPanelLabels
  className?: string
}

const DEFAULT_LABELS: Required<MediaDetailsPanelLabels> = {
  title: "Attachment Details",
  none: "Select a file to see its details.",
  fileName: "File name",
  date: "Date",
  size: "Size",
  dimensions: "Ratio",
  dimensionsValue: (w, h) => `${w} by ${h} px`,
  edit: "Edit Image",
  delete: "Delete Permanently",
  deleteTitle: (name) => `Delete ${name}?`,
  deleteDescription:
    "It's removed from the library and from everywhere it's used. This can't be undone.",
  cancel: "Cancel",
  alt: "Alt text",
  altPlaceholder: "Describe the image for screen readers",
  imageTitle: "Title",
  imageTitlePlaceholder: "Image title",
}

/** Figma "Attachment Details": file facts, alt text and title, edit and delete. */
function MediaDetailsPanel({
  item,
  onUpdate,
  onEdit,
  onDelete,
  locale,
  labels: labelsProp,
  className,
}: MediaDetailsPanelProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const id = React.useId()

  return (
    <aside
      data-slot="media-details-panel"
      aria-label={labels.title}
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-card-header p-4 text-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-foreground">{labels.title}</h3>
        <Separator />
      </div>
      {!item ? (
        <p className="text-muted-foreground">{labels.none}</p>
      ) : (
        // Remount per item so the fields reset to its values.
        <DetailsBody
          key={item.id}
          id={id}
          item={item}
          labels={labels}
          locale={locale}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </aside>
  )
}

function DetailsBody({
  id,
  item,
  labels,
  locale,
  onUpdate,
  onEdit,
  onDelete,
}: {
  id: string
  item: MediaItem
  labels: Required<MediaDetailsPanelLabels>
  locale?: string
  onUpdate?: MediaDetailsPanelProps["onUpdate"]
  onEdit?: MediaDetailsPanelProps["onEdit"]
  onDelete?: MediaDetailsPanelProps["onDelete"]
}) {
  const [alt, setAlt] = React.useState(item.alt ?? "")
  const [title, setTitle] = React.useState(item.title ?? "")
  const isImageFile = (item.mimeType ?? "image/").startsWith("image/")
  const date = item.date ? new Date(item.date) : null

  const facts: [string, React.ReactNode][] = [
    [labels.fileName, item.name],
    ...(date && !Number.isNaN(date.getTime())
      ? ([
          [
            labels.date,
            new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date),
          ],
        ] as [string, React.ReactNode][])
      : []),
    ...(item.size !== undefined
      ? ([[labels.size, formatBytes(item.size, locale)]] as [
          string,
          React.ReactNode,
        ][])
      : []),
    ...(item.width && item.height
      ? ([
          [labels.dimensions, labels.dimensionsValue(item.width, item.height)],
        ] as [string, React.ReactNode][])
      : []),
  ]

  return (
    <>
      <dl className="flex flex-col gap-1 text-foreground-secondary">
        {facts.map(([term, value]) => (
          <div key={term} className="flex min-w-0 gap-1">
            <dt className="shrink-0">{term}:</dt>
            <dd className="min-w-0 truncate font-semibold text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {(onEdit || onDelete) && (
        <div className="flex flex-col gap-2">
          {onEdit && isImageFile && !item.isPrivate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(item)}
            >
              {labels.edit}
            </Button>
          )}
          {onDelete && (
            <ConfirmDialog
              destructive
              title={labels.deleteTitle(item.title || item.name)}
              description={labels.deleteDescription}
              confirmLabel={labels.delete}
              cancelLabel={labels.cancel}
              onConfirm={() => onDelete(item)}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive-subtle hover:text-destructive"
                >
                  {labels.delete}
                </Button>
              }
            />
          )}
        </div>
      )}
      {isImageFile && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-alt`} className="type-field-label">
            {labels.alt}
          </label>
          <Textarea
            id={`${id}-alt`}
            value={alt}
            readOnly={!onUpdate}
            placeholder={labels.altPlaceholder}
            onChange={(event) => setAlt(event.target.value)}
            onBlur={() => {
              if (alt !== (item.alt ?? "")) onUpdate?.(item, { alt })
            }}
            className="min-h-24 bg-background"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-title`} className="type-field-label">
          {labels.imageTitle}
        </label>
        <Input
          id={`${id}-title`}
          value={title}
          readOnly={!onUpdate}
          placeholder={labels.imageTitlePlaceholder}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (title !== (item.title ?? "")) onUpdate?.(item, { title })
          }}
          className="bg-background"
        />
      </div>
    </>
  )
}

export {
  MediaDetailsPanel,
  type MediaDetailsPanelLabels,
  type MediaDetailsPanelProps,
}
