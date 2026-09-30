"use client"

import * as React from "react"
import { cn } from "cn"
import { UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type FileRejection = {
  file: File
  reason: "type" | "size" | "count"
}

type DropzoneProps = Omit<React.ComponentProps<"div">, "onDrop" | "title"> & {
  /** Accepted files, after validation. */
  onFiles: (files: File[]) => void
  /** Files that failed validation, with the reason. */
  onReject?: (rejections: FileRejection[]) => void
  /** Same syntax as the input `accept` attribute, e.g. "image/*,.pdf". */
  accept?: string
  /** Bytes. */
  maxSize?: number
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  title?: React.ReactNode
  /** Accessible name of the file input, e.g. "Upload category image". */
  inputLabel?: string
  description?: React.ReactNode
  /** Primary button that opens the file picker, e.g. "Choose Image". */
  browseLabel?: React.ReactNode
  /** Extra buttons beside it, e.g. "Choose Existing" for a media library. */
  actions?: React.ReactNode
  /** Replaces the default icon, title, description and buttons. */
  children?: React.ReactNode
  inputProps?: React.ComponentProps<"input">
}

function Dropzone({
  onFiles,
  onReject,
  accept,
  maxSize,
  multiple = true,
  maxFiles,
  disabled = false,
  inputLabel = "Upload files",
  title = (
    <>
      <span className="font-semibold text-primary">Drag &amp; Drop</span> your
      files here
    </>
  ),
  description,
  browseLabel,
  actions,
  children,
  className,
  inputProps,
  ...props
}: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const depth = React.useRef(0)

  const handle = (list: FileList | null) => {
    if (!list || disabled) return
    const accepted: File[] = []
    const rejected: FileRejection[] = []
    const limit = multiple ? (maxFiles ?? Infinity) : 1
    for (const file of Array.from(list)) {
      if (accept && !matchesAccept(file, accept))
        rejected.push({ file, reason: "type" })
      else if (maxSize !== undefined && file.size > maxSize)
        rejected.push({ file, reason: "size" })
      else if (accepted.length >= limit)
        rejected.push({ file, reason: "count" })
      else accepted.push(file)
    }
    if (accepted.length) onFiles(accepted)
    if (rejected.length) onReject?.(rejected)
  }

  return (
    <div
      data-slot="dropzone"
      data-dragging={dragging || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative isolate flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card-header p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary-subtle-2 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 data-dragging:border-primary data-dragging:bg-primary-subtle-2",
        className
      )}
      onDragEnter={(event) => {
        event.preventDefault()
        depth.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        depth.current -= 1
        if (depth.current <= 0) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        depth.current = 0
        setDragging(false)
        handle(event.dataTransfer.files)
      }}
      {...props}
    >
      {children ?? (
        <>
          <UploadCloudIcon
            aria-hidden="true"
            className="size-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-2">
            <span className="text-base text-foreground-secondary">{title}</span>
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </div>
          {(browseLabel || actions) && (
            <div className="relative z-10 flex flex-wrap justify-center gap-4">
              {actions}
              {browseLabel && (
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  {browseLabel}
                </Button>
              )}
            </div>
          )}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        aria-label={inputLabel}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => {
          handle(event.target.files)
          event.target.value = ""
        }}
        {...inputProps}
      />
    </div>
  )
}

function matchesAccept(file: File, accept: string) {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule
    )
}

export { Dropzone, type DropzoneProps, type FileRejection }
