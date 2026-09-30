"use client"

import * as React from "react"
import { cn } from "cn"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type VideoUrlListLabels = {
  label?: string
  placeholder?: string
  add?: string
  remove?: string
  invalid?: string
}

type VideoUrlListProps = {
  /** Always at least one field is shown; empty strings are blank rows. */
  value: string[]
  onValueChange: (value: string[]) => void
  /** Return false for a URL the app can't embed. Defaults to YouTube / Vimeo. */
  validate?: (url: string) => boolean
  max?: number
  disabled?: boolean
  labels?: VideoUrlListLabels
  className?: string
}

const DEFAULT_LABELS: Required<VideoUrlListLabels> = {
  label: "Video Url",
  placeholder: "https://youtube.com/watch?v=abcdef",
  add: "Add more video url",
  remove: "Remove",
  invalid: "Use a YouTube or Vimeo link",
}

const isVideoUrl = (url: string) =>
  /^https?:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/|vimeo\.com\/)\S+$/i.test(
    url.trim()
  )

/** Figma "Video Url" rows: one input per link, add more, remove. */
function VideoUrlList({
  value,
  onValueChange,
  validate = isVideoUrl,
  max,
  disabled,
  labels: labelsProp,
  className,
}: VideoUrlListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const id = React.useId()
  const [touched, setTouched] = React.useState<Set<number>>(new Set())
  const rows = value.length > 0 ? value : [""]
  const canAdd = max === undefined || rows.length < max

  const update = (index: number, url: string) =>
    onValueChange(rows.map((v, i) => (i === index ? url : v)))

  return (
    <div
      data-slot="video-url-list"
      className={cn("flex flex-col gap-4", className)}
    >
      {rows.map((url, index) => {
        const invalid =
          touched.has(index) && url.trim() !== "" && !validate(url)
        const last = index === rows.length - 1
        return (
          <div key={index} className="flex flex-col gap-2">
            {index === 0 && (
              <label htmlFor={`${id}-${index}`} className="type-field-label">
                {labels.label}
              </label>
            )}
            <Input
              id={`${id}-${index}`}
              type="url"
              inputMode="url"
              value={url}
              disabled={disabled}
              placeholder={labels.placeholder}
              aria-label={
                index === 0 ? undefined : `${labels.label} ${index + 1}`
              }
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-${index}-error` : undefined}
              onChange={(event) => update(index, event.target.value)}
              onBlur={() => setTouched((prev) => new Set(prev).add(index))}
            />
            {invalid && (
              <p
                id={`${id}-${index}-error`}
                className="text-xs text-destructive"
              >
                {labels.invalid}
              </p>
            )}
            {(last || url.trim()) && (
              <div className="flex items-center justify-between gap-3">
                {last && canAdd ? (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    disabled={disabled || url.trim() === ""}
                    onClick={() => onValueChange([...rows, ""])}
                  >
                    <PlusIcon /> {labels.add}
                  </Button>
                ) : (
                  <span />
                )}
                {url.trim() !== "" && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-auto p-0"
                    disabled={disabled}
                    onClick={() => {
                      const next = rows.filter((_, i) => i !== index)
                      setTouched(new Set())
                      onValueChange(next)
                    }}
                  >
                    <Trash2Icon /> {labels.remove}
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export {
  isVideoUrl,
  VideoUrlList,
  type VideoUrlListLabels,
  type VideoUrlListProps,
}
