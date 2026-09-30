import * as React from "react"
import { cn } from "cn"

type StatCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  label: React.ReactNode
  value: React.ReactNode
  /** Percentage change; positive renders green, negative red. */
  delta?: number
  /** Quiet text after the delta, e.g. "vs last month". */
  deltaNote?: React.ReactNode
  icon?: React.ReactNode
  /** Top-right slot, e.g. a period selector scoped to this figure. */
  action?: React.ReactNode
  /** Extra breakdown under the value. */
  sub?: React.ReactNode
  /** The one figure a screen exists to answer; at most one per view. */
  hero?: boolean
}

/** Prototype Kpi tile. */
function StatCard({
  label,
  value,
  delta,
  deltaNote,
  icon,
  action,
  sub,
  hero = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      data-hero={hero || undefined}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-1",
        hero ? "p-6" : "p-5",
        className
      )}
      {...props}
    >
      <div className="mb-2 flex items-center gap-2 [&_svg]:size-[18px] [&_svg]:text-muted-foreground">
        {icon}
        <span
          className={cn(
            "text-muted-foreground",
            hero
              ? "text-[11px] font-[680] tracking-[0.09em] uppercase"
              : "text-xs"
          )}
        >
          {label}
        </span>
        {action && <span className="ms-auto">{action}</span>}
      </div>
      <div
        className={cn(
          "min-w-0 font-bold [overflow-wrap:anywhere] text-foreground tabular-nums",
          hero ? "text-[34px] leading-none tracking-[-0.02em]" : "text-lg"
        )}
      >
        {value}
      </div>
      {delta !== undefined && (
        <p className="mt-1.5 flex items-baseline gap-1.5">
          <Delta value={delta} />
          {deltaNote && (
            <span className="text-xs text-muted-foreground">{deltaNote}</span>
          )}
        </p>
      )}
      {sub && (
        <div
          className={cn(
            "text-xs text-muted-foreground",
            hero ? "mt-3" : "mt-2"
          )}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

/** Growth figure as plain coloured text, e.g. +12% or -4%. */
function Delta({
  value,
  className,
  ...props
}: React.ComponentProps<"span"> & { value: number }) {
  if (value === 0) {
    return (
      <span
        className={cn("text-xs font-semibold text-muted-foreground", className)}
        {...props}
      >
        0%
      </span>
    )
  }
  return (
    <span
      data-slot="delta"
      className={cn(
        "text-xs font-semibold tabular-nums",
        value > 0 ? "text-success-strong" : "text-destructive-strong",
        className
      )}
      {...props}
    >
      {value > 0 ? `+${value}` : value}%
    </span>
  )
}

export { StatCard, Delta, type StatCardProps }
