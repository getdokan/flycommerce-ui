"use client"

import * as React from "react"
import { cn } from "cn"
import { IconChip } from "./icon-chip"

const StatGroupContext = React.createContext(false)

type StatCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  label: React.ReactNode
  value: React.ReactNode
  /** Percentage change; positive renders green, negative red. */
  delta?: number
  /** Quiet text after the delta, e.g. "vs last month". */
  deltaNote?: React.ReactNode
  icon?: React.ReactNode
  /** Top-right slot (after the label when label-first), e.g. a period selector scoped to this figure. */
  action?: React.ReactNode
  /** Extra breakdown under the value. */
  sub?: React.ReactNode
  /** The one figure a screen exists to answer; at most one per view. */
  hero?: boolean
  layout?: "value-first" | "label-first"
  valueSize?: "default" | "sm"
  foot?: React.ReactNode
}

/** KPI tile, value over label or `layout="label-first"`; `StatGroup` joins several into one band. */
function StatCard({
  label,
  value,
  delta,
  deltaNote,
  icon,
  action,
  sub,
  foot,
  hero = false,
  layout = "value-first",
  valueSize = "default",
  className,
  ...props
}: StatCardProps) {
  const grouped = React.useContext(StatGroupContext)
  const labelFirst = layout === "label-first"
  const isHero = hero && !labelFirst

  const valueNode = (
    <div
      data-slot="stat-card-value"
      className={cn(
        "min-w-0 [overflow-wrap:anywhere] text-foreground tabular-nums",
        labelFirst
          ? cn(
              "mt-1.5",
              valueSize === "sm" ? "type-stat-value-sm" : "type-stat-value"
            )
          : isHero
            ? "text-[34px] leading-none font-bold tracking-[-0.02em]"
            : "type-overview-value"
      )}
    >
      {value}
    </div>
  )
  const labelNode = (
    <p
      data-slot="stat-card-label"
      className={cn(
        labelFirst
          ? "min-w-0 text-sm font-medium text-foreground-secondary"
          : cn(
              "text-muted-foreground",
              isHero
                ? "mt-2 text-[11px] font-[680] tracking-[0.09em] uppercase"
                : "mt-0.5 text-xs"
            )
      )}
    >
      {label}
    </p>
  )
  const end = labelFirst ? null : action

  return (
    <div
      data-slot="stat-card"
      data-layout={layout}
      data-value-size={labelFirst ? valueSize : undefined}
      data-hero={isHero || undefined}
      className={cn(
        !grouped && "rounded-xl bg-card text-card-foreground shadow-card",
        labelFirst ? "px-5 py-5 sm:px-6" : isHero ? "p-6" : "p-5",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {labelFirst ? (
            <>
              <div className="flex items-center gap-1.5">
                {labelNode}
                {action}
              </div>
              {valueNode}
            </>
          ) : (
            <>
              {valueNode}
              {labelNode}
            </>
          )}
        </div>
        {(end || icon) && (
          <div className="flex shrink-0 items-center gap-2">
            {end}
            {icon && <IconChip>{icon}</IconChip>}
          </div>
        )}
      </div>
      {delta !== undefined && (
        <p className="mt-3 flex items-baseline gap-1.5">
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
            isHero ? "mt-3" : "mt-2"
          )}
        >
          {sub}
        </div>
      )}
      {foot && (
        <div
          data-slot="stat-card-foot"
          className="mt-1 text-xs text-muted-foreground tabular-nums has-[>[data-slot=progress]:first-child]:mt-2.5"
        >
          {foot}
        </div>
      )}
    </div>
  )
}

type StatGroupProps = React.ComponentProps<"div"> & {
  flush?: boolean
}

/** Stat cards joined into one band on hairline gaps, each child a list item; pass the columns in `className`, e.g. `grid-cols-2 lg:grid-cols-4`. */
function StatGroup({
  flush = false,
  className,
  children,
  ...props
}: StatGroupProps) {
  return (
    <div
      role="list"
      data-slot="stat-group"
      data-flush={flush || undefined}
      className={cn(
        "grid gap-px bg-border-subtle",
        !flush && "overflow-hidden rounded-xl shadow-card",
        className
      )}
      {...props}
    >
      <StatGroupContext.Provider value={true}>
        {React.Children.map(children, (child) =>
          child == null ? null : (
            <div
              role="listitem"
              data-slot="stat-group-item"
              className="grid bg-card text-card-foreground *:min-w-0"
            >
              {child}
            </div>
          )
        )}
      </StatGroupContext.Provider>
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

export { StatCard, StatGroup, Delta, type StatCardProps, type StatGroupProps }
