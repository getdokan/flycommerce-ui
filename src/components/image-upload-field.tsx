"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiImage as ImageIcon,
  FiRefreshCw as RefreshIcon,
  FiX as XIcon,
} from "react-icons/fi"

import { Dropzone, type FileRejection } from "@/components/dropzone"
import { LoadingOverlay } from "@/components/loading-overlay"
import { formatBytes } from "@/components/media-tile"
import { Button } from "@/components/ui/button"
import { sortFiles } from "@/lib/files"

type ImageUploadFieldValue = {
  src: string
  name?: string
  /** Bytes. */
  size?: number
}

type ImageUploadFieldLabels = {
  dropTitle?: React.ReactNode
  description?: React.ReactNode
  upload?: string
  input?: string
  change?: string
  library?: string
  remove?: string
  uploading?: string
}

type ImageUploadFieldProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> & {
  value?: ImageUploadFieldValue | null
  onFiles: (files: File[]) => void
  onReject?: (rejections: FileRejection[]) => void
  onRemove?: () => void
  /** Adds a "Media library" action; open `MediaPickerDialog` from it. */
  onChooseExisting?: () => void
  accept?: string
  /** Bytes. */
  maxSize?: number
  /** The preview tile's colour, e.g. the brand colour behind a logo. */
  previewBackground?: string
  loading?: boolean
  invalid?: boolean
  disabled?: boolean
  labels?: ImageUploadFieldLabels
}

const DEFAULT_LABELS = {
  dropTitle: (
    <>
      <span className="font-semibold text-primary-ink">Drag and drop</span> your
      image here
    </>
  ),
  upload: "Upload image",
  input: "Upload image",
  change: "Change image",
  library: "Media library",
  remove: "Remove image",
  uploading: "Uploading",
}

/** One image: a drop zone while empty, then a preview with change, remove and media library. */
function ImageUploadField({
  value,
  onFiles,
  onReject,
  onRemove,
  onChooseExisting,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp",
  maxSize,
  previewBackground,
  loading = false,
  invalid = false,
  disabled = false,
  labels: labelsProp,
  id,
  "aria-describedby": describedBy,
  className,
  ...props
}: ImageUploadFieldProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const description =
    labels.description ??
    (maxSize === undefined
      ? "PNG, JPG, SVG or WebP"
      : `PNG, JPG, SVG or WebP. Max file size: ${formatBytes(maxSize)}`)
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const restoreFocus = React.useRef(false)
  const [brokenSrc, setBrokenSrc] = React.useState<string>()
  const filled = Boolean(value)

  React.useEffect(() => {
    if (loading || !restoreFocus.current) return
    restoreFocus.current = false
    const active = document.activeElement
    if (active && active !== document.body) return
    document.getElementById(inputId)?.focus()
  }, [filled, loading, inputId])

  const take = (files: File[]) => {
    restoreFocus.current = true
    onFiles(files)
  }

  const inputProps = {
    id: inputId,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  }

  return (
    <LoadingOverlay
      loading={loading}
      label={labels.uploading}
      data-slot="image-upload-field"
      data-state={value ? "filled" : "empty"}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={className}
      {...props}
    >
      {value ? (
        <div
          className={cn(
            "flex min-h-37 flex-col justify-between gap-4 rounded-xl border border-border p-4",
            invalid && "border-destructive"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              data-slot="image-upload-field-preview"
              style={
                previewBackground
                  ? { backgroundColor: previewBackground }
                  : undefined
              }
              className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted ring-1 ring-border"
            >
              {brokenSrc === value.src ? (
                <ImageIcon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              ) : (
                <img
                  src={value.src}
                  alt=""
                  className="size-full object-contain"
                  onError={() => setBrokenSrc(value.src)}
                />
              )}
            </span>
            <div className="w-0 flex-1">
              {value.name && (
                <p className="truncate text-sm font-medium text-foreground">
                  <bdi>{value.name}</bdi>
                </p>
              )}
              {value.size !== undefined && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  <bdi>{formatBytes(value.size)}</bdi>
                </p>
              )}
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={labels.remove}
                disabled={disabled}
                onClick={() => {
                  restoreFocus.current = true
                  onRemove()
                }}
              >
                <XIcon />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium text-primary-ink hover:underline has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring">
              <input
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                onChange={(event) => {
                  const { accepted, rejected } = sortFiles(
                    Array.from(event.target.files ?? []),
                    { accept, maxSize, maxFiles: 1 }
                  )
                  if (accepted.length) take(accepted)
                  if (rejected.length) onReject?.(rejected)
                  event.target.value = ""
                }}
                {...inputProps}
              />
              <RefreshIcon aria-hidden="true" className="size-3.5" />
              {labels.change}
            </label>
            {onChooseExisting && (
              <button
                type="button"
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                onClick={onChooseExisting}
              >
                <ImageIcon aria-hidden="true" className="size-3.5" />
                {labels.library}
              </button>
            )}
          </div>
        </div>
      ) : (
        <Dropzone
          accept={accept}
          maxSize={maxSize}
          multiple={false}
          disabled={disabled}
          icon={null}
          title={labels.dropTitle}
          description={description}
          browseLabel={labels.upload}
          inputLabel={labels.input}
          inputProps={inputProps}
          actions={
            onChooseExisting && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={onChooseExisting}
              >
                <ImageIcon data-icon="inline-start" />
                {labels.library}
              </Button>
            )
          }
          onFiles={take}
          onReject={onReject}
          className={cn("min-h-37 p-4", invalid && "border-destructive")}
        />
      )}
    </LoadingOverlay>
  )
}

export {
  ImageUploadField,
  type ImageUploadFieldLabels,
  type ImageUploadFieldProps,
  type ImageUploadFieldValue,
}
