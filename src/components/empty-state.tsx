import * as React from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** An icon element, e.g. `<Icon name="orders" />`, shown in the tinted tile. */
  icon?: React.ReactNode
  /** An illustration or image shown as it is, without the tile; used instead of `icon`. */
  media?: React.ReactNode
  /** `destructive` tints the tile red, for a list that failed to load. */
  tone?: "default" | "destructive"
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons or links under the text, such as "Add product" or "Retry". */
  actions?: React.ReactNode
}

// A count of 0 is something to show; nothing, false (from `cond && …`) and "" are not.
const given = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== ""

/** An empty or failed list in one line: icon, title, description and the way forward. */
function EmptyState({
  icon,
  media,
  tone = "default",
  title,
  description,
  actions,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Empty data-tone={tone} className={className} {...props}>
      <EmptyHeader>
        {given(media) ? (
          <EmptyMedia>{media}</EmptyMedia>
        ) : given(icon) ? (
          <EmptyMedia variant="icon" tone={tone}>
            {icon}
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {given(description) ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {given(actions) ? (
        <EmptyContent className="flex-row flex-wrap justify-center gap-2">
          {actions}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

export { EmptyState, type EmptyStateProps }
