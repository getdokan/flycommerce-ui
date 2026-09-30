"use client"

import * as React from "react"
import { cn } from "cn"
import { StarIcon } from "lucide-react"

type RatingProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value: number
  /** Makes the rating editable; without it the stars are display-only. */
  onValueChange?: (value: number) => void
  max?: number
  size?: "sm" | "default" | "lg"
  /** Accessible name, e.g. "Product rating". */
  label?: string
  starLabel?: (value: number, max: number) => string
}

const SIZES = { sm: "size-3.5", default: "size-4", lg: "size-5" }

function Rating({
  value,
  onValueChange,
  max = 5,
  size = "default",
  label = "Rating",
  starLabel = (n, total) => `${n} of ${total} stars`,
  className,
  ...props
}: RatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const editable = Boolean(onValueChange)
  const shown = hover ?? value
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  if (!editable) {
    return (
      <div
        data-slot="rating"
        role="img"
        aria-label={`${label}: ${starLabel(Math.round(value * 10) / 10, max)}`}
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {stars.map((n) => {
          const fill = Math.max(0, Math.min(1, value - (n - 1)))
          return (
            <span key={n} className={cn("relative inline-flex", SIZES[size])}>
              <StarIcon aria-hidden="true" className="size-full text-border" />
              {fill > 0 && (
                <span
                  className="absolute inset-y-0 start-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarIcon
                    aria-hidden="true"
                    className={cn("fill-warning text-warning", SIZES[size])}
                  />
                </span>
              )}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div
      data-slot="rating"
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => setHover(null)}
      {...props}
    >
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={starLabel(n, max)}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onMouseEnter={() => setHover(n)}
          onClick={() => onValueChange?.(n)}
          onKeyDown={(event) => {
            const step =
              event.key === "ArrowRight" || event.key === "ArrowUp"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowDown"
                  ? -1
                  : 0
            if (!step) return
            event.preventDefault()
            const next = Math.min(max, Math.max(1, (value || 0) + step))
            onValueChange?.(next)
            const sibling =
              event.currentTarget.parentElement?.children[next - 1]
            ;(sibling as HTMLElement | undefined)?.focus()
          }}
          className="rounded-sm p-0.5 transition-transform outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring"
        >
          <StarIcon
            aria-hidden="true"
            className={cn(
              SIZES[size],
              n <= shown ? "fill-warning text-warning" : "text-border"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export { Rating, type RatingProps }
