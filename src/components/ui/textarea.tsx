"use client"

import * as React from "react"
import { cn } from "cn"

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Shows "12/500 characters" under the field; uses `maxLength` when set. */
  showCount?: boolean
  /** A limit the count measures against without truncating: past it the count turns to the warning tone. Shows the count. */
  softLimit?: number
  countLabel?: (count: number, max?: number) => React.ReactNode
}

function Textarea({
  className,
  showCount = false,
  softLimit,
  countLabel = (count, max) =>
    max ? `${count}/${max} characters` : `${count} characters`,
  onChange,
  ...props
}: TextareaProps) {
  const [typed, setTyped] = React.useState(
    () => String(props.defaultValue ?? "").length
  )
  const count = props.value !== undefined ? String(props.value).length : typed
  const over = softLimit !== undefined && count > softLimit

  const field = (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[78px] w-full rounded-control border border-input bg-background px-3 py-2.5 text-base shadow-none ring-0 transition-colors outline-none placeholder:text-placeholder hover:border-placeholder focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted-foreground aria-invalid:border-destructive md:text-sm dark:aria-invalid:border-destructive/50",
        className
      )}
      onChange={(event) => {
        setTyped(event.target.value.length)
        onChange?.(event)
      }}
      {...props}
    />
  )

  if (!showCount && softLimit === undefined) return field

  return (
    <div data-slot="textarea-wrapper" className="flex w-full flex-col gap-1.5">
      {field}
      <span
        data-slot="textarea-count"
        data-over={over || undefined}
        aria-live="polite"
        className="text-[11.5px] text-muted-foreground tabular-nums data-over:text-warning-strong"
      >
        {countLabel(count, softLimit ?? props.maxLength)}
      </span>
    </div>
  )
}

export { Textarea, type TextareaProps }
