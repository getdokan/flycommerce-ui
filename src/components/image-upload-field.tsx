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
import { describeAccept, sortFiles } from "@/lib/files"

type ImageUploadFieldValue = {
  src?: string
  name?: string
  /** Bytes. */
  size?: number
}

type ImageUploadFieldLabels = {
  dropTitle?: React.ReactNode
  /** Replaces the description that `fileRules` builds. */
  description?: React.ReactNode
  /** The drop zone's description, from the accepted types ("PNG, JPG, SVG or WebP") and the size limit ("5 MB"); either can be missing. */
  fileRules?: (
    types: string | undefined,
    maxSize: string | undefined
  ) => React.ReactNode
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
  /** The field's name for screen readers, e.g. "Logo": its buttons are named "Change image, Logo" and so on, so several fields on a page stay distinct. */
  label?: string
  onFiles: (files: File[]) => void
  onReject?: (rejections: FileRejection[]) => void
  onRemove?: () => void
  /** Adds a "Media library" action; open `MediaPickerDialog` from it. */
  onChooseExisting?: () => void
  accept?: string
  /** Bytes. */
  maxSize?: number
  /** Drawn in the preview tile instead of the image, e.g. a wordmark. */
  preview?: React.ReactNode
  /** The preview tile's colour, e.g. the brand colour behind a logo. Its text is white, or dark on a light hex colour. */
  previewBackground?: string
  previewFit?: "cover" | "contain"
  loading?: boolean
  invalid?: boolean
  disabled?: boolean
  /** Formats the sizes and the list of accepted types: "tr" gives "1,5 MB" and "PNG, JPG, SVG veya WebP". */
  locale?: string
  labels?: ImageUploadFieldLabels
}

const DEFAULT_LABELS = {
  dropTitle: (
    <>
      <span className="font-semibold text-primary-ink">Drag and drop</span> your
      image here
    </>
  ),
  fileRules: (types: string | undefined, maxSize: string | undefined) =>
    [types, maxSize && `Max file size: ${maxSize}`].filter(Boolean).join(". "),
  upload: "Upload image",
  input: "Upload image",
  change: "Change image",
  library: "Media library",
  remove: "Remove image",
  uploading: "Uploading",
}

function isLightColor(color: string) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1]
  if (!hex) return false
  const full = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex
  const [r, g, b] = [0, 2, 4].map((at) => {
    const channel = parseInt(full.slice(at, at + 2), 16) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2174
}

/** One image: a drop zone while empty, then a preview with change, remove and media library. */
function ImageUploadField({
  value,
  label,
  onFiles,
  onReject,
  onRemove,
  onChooseExisting,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp",
  maxSize,
  preview,
  previewBackground,
  previewFit = "cover",
  loading = false,
  invalid = false,
  disabled = false,
  locale,
  labels: labelsProp,
  id,
  "aria-describedby": describedBy,
  className,
  ...props
}: ImageUploadFieldProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const named = (text: string) => (label ? `${text}, ${label}` : text)
  const types = describeAccept(accept, locale) || undefined
  const limit = maxSize === undefined ? undefined : formatBytes(maxSize, locale)
  const description =
    labels.description ??
    (types || limit ? labels.fileRules(types, limit) : undefined)
  const background = previewBackground
    ? isLightColor(previewBackground)
      ? "light"
      : "dark"
    : undefined
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
              data-background={background}
              style={
                previewBackground
                  ? { backgroundColor: previewBackground }
                  : undefined
              }
              className={cn(
                "grid h-16 w-24 shrink-0 grid-cols-1 grid-rows-1 place-items-center overflow-hidden rounded-lg ring-1 ring-border data-[background=dark]:text-on-dark data-[background=light]:text-on-light",
                !background && "bg-muted"
              )}
            >
              {preview ||
                (value.src && brokenSrc !== value.src ? (
                  <img
                    src={value.src}
                    alt=""
                    data-fit={previewFit}
                    className={cn(
                      "size-full",
                      previewFit === "contain"
                        ? "object-contain"
                        : "object-cover"
                    )}
                    onError={() => setBrokenSrc(value.src)}
                  />
                ) : (
                  <ImageIcon
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                ))}
            </span>
            <div className="w-0 flex-1">
              {value.name && (
                <p className="truncate text-sm font-medium text-foreground">
                  <bdi>{value.name}</bdi>
                </p>
              )}
              {value.size !== undefined && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  <bdi>{formatBytes(value.size, locale)}</bdi>
                </p>
              )}
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={named(labels.remove)}
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
            <label className="relative">
              <input
                type="file"
                accept={accept}
                disabled={disabled}
                aria-label={label ? named(labels.change) : undefined}
                className="peer sr-only"
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
              <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-primary-ink peer-focus-visible:ring-3 peer-focus-visible:ring-ring peer-disabled:pointer-events-none peer-disabled:opacity-50 hover:underline">
                <RefreshIcon aria-hidden="true" className="size-3.5" />
                <span className="text-sm font-medium">{labels.change}</span>
              </span>
            </label>
            {onChooseExisting && (
              <button
                type="button"
                aria-label={label ? named(labels.library) : undefined}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                onClick={onChooseExisting}
              >
                <ImageIcon aria-hidden="true" className="size-3.5" />
                <span className="text-sm font-medium">{labels.library}</span>
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
          browseLabel={
            label ? (
              <>
                <span aria-hidden="true">{labels.upload}</span>
                <span className="sr-only">{named(labels.upload)}</span>
              </>
            ) : (
              labels.upload
            )
          }
          inputLabel={named(labels.input)}
          inputProps={inputProps}
          actions={
            onChooseExisting && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={label ? named(labels.library) : undefined}
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
