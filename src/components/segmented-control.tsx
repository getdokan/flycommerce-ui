"use client"

import * as React from "react"
import { cn } from "cn"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

type SegmentedControlSize = "default" | "sm"

const SegmentedControlContext =
  React.createContext<SegmentedControlSize>("default")

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "value" | "defaultValue" | "orientation"
> & {
  size?: SegmentedControlSize
} & (
    | {
        /** The selected option; pair with `onValueChange`. */
        value: string
        defaultValue?: never
      }
    | {
        value?: never
        /** The option selected on first render when uncontrolled. */
        defaultValue: string
      }
  )

/** One required choice among 2–5 short options: radios in a segmented track; arrow keys select. */
function SegmentedControl({
  className,
  size = "default",
  ...props
}: SegmentedControlProps) {
  return (
    <SegmentedControlContext.Provider value={size}>
      <RadioGroupPrimitive.Root
        data-slot="segmented-control"
        data-size={size}
        className={cn(
          "no-scrollbar flex w-fit max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-lg bg-border p-1",
          className
        )}
        {...props}
      />
    </SegmentedControlContext.Provider>
  )
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const size = React.useContext(SegmentedControlContext)

  return (
    <RadioGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap text-foreground-secondary transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-checked:bg-background data-checked:text-foreground data-checked:shadow-1 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "sm" ? "px-3 py-0.5" : "px-4 py-2",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem, type SegmentedControlProps }
