"use client"

import * as React from "react"
import { cn } from "cn"
import { FiChevronDown as ChevronDownIcon } from "react-icons/fi"

import { Card } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type CollapsibleCardProps = Omit<
  React.ComponentProps<typeof Card>,
  "title" | "children"
> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Before the title, usually an `IconChip`. */
  icon?: React.ReactNode
  /** Trailing summary inside the header button, e.g. "4 of 6 on" or a `Badge`. Read as part of the button's description. */
  meta?: React.ReactNode
  /** Trailing controls outside the header button, so using them never opens or closes the card. */
  actions?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Stops the card opening or closing; `actions` and an open body stay usable. */
  disabled?: boolean
  /** The title's heading level, to fit the page's outline. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** `none` (default) runs a `divide-y` list of `SwitchField variant="row"` rows or a table edge to edge; `default` pads the body like `CardContent`. */
  padding?: "none" | "default"
  children?: React.ReactNode
}

const isShown = (node: React.ReactNode) =>
  node != null && node !== false && node !== ""

/** A card whose header opens and closes its body: grouped settings, long lists split into sections. */
function CollapsibleCard({
  title,
  description,
  icon,
  meta,
  actions,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  headingLevel = 3,
  padding = "none",
  className,
  children,
  ...props
}: CollapsibleCardProps) {
  const id = React.useId()
  const Heading = `h${headingLevel}` as const
  const hasDescription = isShown(description)
  const hasMeta = isShown(meta)
  const hasActions = isShown(actions)
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const metaId = `${id}-meta`
  const describedBy =
    [hasDescription && descriptionId, hasMeta && metaId]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <Collapsible
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      asChild
    >
      <Card
        data-slot="collapsible-card"
        className={cn("gap-0 py-0", className)}
        {...props}
      >
        <div className="@container/collapsible-card">
          <div
            data-slot="collapsible-card-header"
            className={cn(
              "flex flex-col @md/collapsible-card:flex-row @md/collapsible-card:items-center @md/collapsible-card:gap-2",
              hasActions && "@md/collapsible-card:pe-(--card-spacing)"
            )}
          >
            <Heading className="m-0 flex min-w-0 @md/collapsible-card:flex-1">
              <CollapsibleTrigger
                data-slot="collapsible-card-trigger"
                aria-labelledby={titleId}
                aria-describedby={describedBy}
                className={cn(
                  "group/collapsible-card-trigger flex min-w-0 flex-1 items-center gap-3 rounded-t-xl px-(--card-spacing) py-4 text-start font-sans font-normal outline-none group-data-[size=sm]/card:py-3 group-data-closed/card:rounded-b-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset enabled:hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50",
                  hasActions &&
                    "group-data-closed/card:rounded-b-none @md/collapsible-card:rounded-e-none"
                )}
              >
                {icon}
                <span className="flex min-w-0 flex-1 flex-col gap-1 @md/collapsible-card:flex-row @md/collapsible-card:items-center @md/collapsible-card:gap-4">
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      id={titleId}
                      data-slot="collapsible-card-title"
                      className="font-heading text-base leading-7 font-bold text-card-foreground group-data-[size=sm]/card:text-sm"
                    >
                      {title}
                    </span>
                    {hasDescription && (
                      <span
                        id={descriptionId}
                        data-slot="collapsible-card-description"
                        className="text-sm text-foreground-secondary"
                      >
                        {description}
                      </span>
                    )}
                  </span>
                  {hasMeta && (
                    <span
                      id={metaId}
                      data-slot="collapsible-card-meta"
                      className="shrink-0 text-sm text-muted-foreground"
                    >
                      {meta}
                    </span>
                  )}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  data-slot="collapsible-card-chevron"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open/collapsible-card-trigger:rotate-180 motion-reduce:transition-none"
                />
              </CollapsibleTrigger>
            </Heading>
            {hasActions && (
              <div
                data-slot="collapsible-card-actions"
                className="flex shrink-0 flex-wrap items-center gap-2 px-(--card-spacing) pb-4 group-data-[size=sm]/card:pb-3 @md/collapsible-card:p-0"
              >
                {actions}
              </div>
            )}
          </div>
        </div>
        <CollapsibleContent
          data-slot="collapsible-card-content"
          className="overflow-hidden motion-safe:data-open:animate-collapsible-down motion-safe:data-closed:animate-collapsible-up"
        >
          <div
            data-padding={padding}
            className="border-t border-border-subtle data-[padding=default]:p-(--card-spacing)"
          >
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export { CollapsibleCard, type CollapsibleCardProps }
