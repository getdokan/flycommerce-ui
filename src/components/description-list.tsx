import * as React from "react"
import { cn } from "cn"

/** Read-only facts as divided label and value rows, e.g. on a detail page or in a card. */
function DescriptionList({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="description-list"
      className={cn("divide-y divide-border", className)}
      {...props}
    />
  )
}

/** One fact: the label on the left, the value (children) on the right; they stack when the row is narrow. */
function DescriptionItem({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  label: React.ReactNode
}) {
  return (
    <div
      data-slot="description-item"
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-6",
        className
      )}
      {...props}
    >
      <dt
        data-slot="description-label"
        className="text-sm text-muted-foreground"
      >
        {label}
      </dt>
      <dd
        data-slot="description-value"
        className="text-end text-sm font-medium text-foreground"
      >
        {children}
      </dd>
    </div>
  )
}

export { DescriptionList, DescriptionItem }
