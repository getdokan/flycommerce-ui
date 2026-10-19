"use client"

import * as React from "react"
import { cn } from "cn"

type InputProps = React.ComponentProps<"input"> & {
  /** Shows "12/60 characters" under the field; uses `maxLength` when set. */
  showCount?: boolean
  /** A limit the count measures against without truncating: past it the count turns to the warning tone. Shows the count. */
  softLimit?: number
  countLabel?: (count: number, max?: number) => React.ReactNode
  /** Announced once when the count goes past `softLimit`. */
  overLimitLabel?: (limit: number) => React.ReactNode
}

function Input({
  className,
  type,
  showCount = false,
  softLimit,
  countLabel = (count, max) =>
    max ? `${count}/${max} characters` : `${count} characters`,
  overLimitLabel = (limit) => `Over the ${limit} character limit`,
  onChange,
  "aria-describedby": describedBy,
  ...props
}: InputProps) {
  const [typed, setTyped] = React.useState(
    () => String(props.defaultValue ?? "").length
  )
  const countId = React.useId()
  const counted = showCount || softLimit !== undefined

  const field = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-control border border-input bg-background px-3 py-1 text-base shadow-none ring-0 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder hover:border-placeholder focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-page disabled:text-muted-foreground aria-invalid:border-destructive md:text-sm dark:aria-invalid:border-destructive/50",
        className
      )}
      aria-describedby={
        counted ? [describedBy, countId].filter(Boolean).join(" ") : describedBy
      }
      onChange={
        counted
          ? (event) => {
              setTyped(event.target.value.length)
              onChange?.(event)
            }
          : onChange
      }
      {...props}
    />
  )

  if (!counted) return field

  const count = props.value !== undefined ? String(props.value).length : typed
  const over = softLimit !== undefined && count > softLimit

  return (
    <div data-slot="input-wrapper" className="flex w-full flex-col gap-1.5">
      {field}
      <span
        id={countId}
        data-slot="input-count"
        data-over={over || undefined}
        className="relative text-[11.5px] text-muted-foreground tabular-nums data-over:text-warning-strong"
      >
        {countLabel(count, softLimit ?? props.maxLength)}
        {softLimit !== undefined && (
          <span
            data-slot="input-count-status"
            aria-live="polite"
            className="sr-only"
          >
            {over && <> {overLimitLabel(softLimit)}</>}
          </span>
        )}
      </span>
    </div>
  )
}

export { Input, type InputProps }
