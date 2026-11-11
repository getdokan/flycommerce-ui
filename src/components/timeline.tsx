"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { IconChip } from "./icon-chip"

const timelineDotVariants = cva("mt-1.5 size-2.5 shrink-0 rounded-full", {
  variants: {
    tone: {
      default: "",
      primary: "",
      success: "",
      warning: "",
      destructive: "",
    },
    upcoming: {
      true: "border border-dashed border-muted-foreground",
      false: "",
    },
  },
  compoundVariants: [
    { upcoming: false, tone: "default", className: "bg-muted-foreground/50" },
    { upcoming: false, tone: "primary", className: "bg-primary" },
    { upcoming: false, tone: "success", className: "bg-success" },
    { upcoming: false, tone: "warning", className: "bg-warning" },
    { upcoming: false, tone: "destructive", className: "bg-destructive" },
  ],
  defaultVariants: { tone: "default", upcoming: false },
})

type TimelineTone = NonNullable<
  VariantProps<typeof timelineDotVariants>["tone"]
>

const ICON_TONES = {
  default: "grey",
  primary: "primary",
  success: "success",
  warning: "warning",
  destructive: "destructive",
} as const

const TimelineItemContext = React.createContext({ upcoming: false })

/** Events in order, each marked by a dot (or an icon) on a line that joins it to the next; children are `TimelineItem`s only. */
function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      // Safari drops list semantics from a list without markers unless the role is explicit.
      role="list"
      className={cn(
        // Once any of its own items has an icon, all its own markers take the icon's width, so the line stays straight.
        "flex list-none flex-col p-0 has-[>li>[data-slot=timeline-marker]>[data-slot=icon-chip]]:[&>li>[data-slot=timeline-marker]]:w-7",
        className
      )}
      {...props}
    />
  )
}

type TimelineItemProps = React.ComponentProps<"li"> & {
  tone?: TimelineTone
  /** A step still to come: a hollow dashed marker and quieter text. */
  upcoming?: boolean
  /** Read before the title for a step still to come, since the marker is hidden from assistive tech. */
  upcomingLabel?: string
  /** Replaces the dot, e.g. `<Icon name="email" />` for an activity log. */
  icon?: React.ReactNode
  /** The entry the user is at, e.g. their installed version: its text sits on a brand tint. */
  highlighted?: boolean
  /** Read before a highlighted item, since the tint alone says nothing to assistive tech. */
  highlightedLabel?: string
}

function TimelineItem({
  tone = "default",
  upcoming = false,
  upcomingLabel = "Upcoming",
  highlighted = false,
  highlightedLabel = "Current",
  icon,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const context = React.useMemo(() => ({ upcoming }), [upcoming])

  return (
    <li
      data-slot="timeline-item"
      data-tone={tone}
      data-upcoming={upcoming || undefined}
      data-highlighted={highlighted || undefined}
      className={cn(
        "flex gap-3 [&:last-child>[data-slot=timeline-marker]>[data-slot=timeline-connector]]:hidden",
        highlighted
          ? // Nothing above the first item to overhang into, so its marker steps down with the text instead.
            "[&:first-child>[data-slot=timeline-body]]:mt-0 [&:first-child>[data-slot=timeline-marker]]:pt-1.5 [&:last-child>[data-slot=timeline-body]]:mb-0"
          : "[&:last-child>[data-slot=timeline-body]]:pb-0",
        className
      )}
      {...props}
    >
      <div
        data-slot="timeline-marker"
        aria-hidden
        className="flex shrink-0 flex-col items-center"
      >
        {icon ? (
          <IconChip
            shape="round"
            size="sm"
            tone={upcoming ? "neutral" : ICON_TONES[tone]}
            className={cn(
              upcoming && "border border-dashed border-muted-foreground"
            )}
          >
            {icon}
          </IconChip>
        ) : (
          <span className={timelineDotVariants({ tone, upcoming })} />
        )}
        <span
          data-slot="timeline-connector"
          className="mt-1 w-px flex-1 bg-border"
        />
      </div>
      <div
        data-slot="timeline-body"
        // relative keeps the sr-only label inside; pt-1 lines the first row up with the icon's middle.
        className={cn(
          "relative min-w-0 flex-1 pb-4",
          icon && "pt-1",
          // The tint overhangs into the gaps by its own padding, so the text, the dot and the next item stay where they were.
          highlighted &&
            "-mt-1.5 mb-2.5 rounded-md bg-primary-subtle px-3 py-1.5 forced-colors:outline",
          highlighted && icon && "pt-2.5"
        )}
      >
        {highlighted && <span className="sr-only">{highlightedLabel}: </span>}
        {upcoming && <span className="sr-only">{upcomingLabel}: </span>}
        <TimelineItemContext.Provider value={context}>
          {children}
        </TimelineItemContext.Provider>
      </div>
    </li>
  )
}

/** Title and time on one row; the time wraps under the title when there's no room. */
function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-3",
        className
      )}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  const { upcoming } = React.useContext(TimelineItemContext)

  return (
    <p
      data-slot="timeline-title"
      className={cn(
        "min-w-0 text-sm font-medium break-words",
        upcoming ? "text-foreground-secondary" : "text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Pass `dateTime` (ISO) so assistive tech and machines read the exact moment; without it this is plain text. */
function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  const Comp = props.dateTime ? "time" : "span"
  return (
    <Comp
      data-slot="timeline-time"
      className={cn(
        "text-xs whitespace-nowrap text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn(
        "mt-0.5 min-w-0 text-xs break-words text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
  type TimelineItemProps,
  type TimelineTone,
}
