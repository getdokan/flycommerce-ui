"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

const progressIndicatorVariants = cva(
  "size-full flex-1 transition-all rtl:-scale-x-100",
  {
    variants: {
      tone: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

function Progress({
  className,
  value,
  max = 100,
  tone = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: NonNullable<VariantProps<typeof progressIndicatorVariants>["tone"]>
}) {
  const limit = max > 0 ? max : 100
  const current =
    value == null
      ? null
      : Number.isFinite(value)
        ? Math.min(Math.max(value, 0), limit)
        : 0
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-tone={tone}
      value={current}
      max={max}
      className={cn(
        "relative flex h-2 w-full items-center overflow-x-hidden rounded-full bg-border",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ tone })}
        style={{
          transform: `translateX(-${100 - ((current ?? 0) * 100) / limit}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
