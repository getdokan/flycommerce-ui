import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const iconChipVariants = cva(
  "inline-flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      shape: {
        square: "rounded-lg",
        round: "rounded-full",
      },
      size: {
        sm: "size-7 [&_svg:not([class*='size-'])]:size-4",
        md: "size-9 [&_svg:not([class*='size-'])]:size-5",
        lg: "size-10 [&_svg:not([class*='size-'])]:size-5",
        xl: "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
      tone: {
        neutral: "bg-card-header text-muted-foreground",
        grey: "bg-secondary text-foreground-secondary",
        primary: "bg-primary-subtle text-primary-ink",
        success: "bg-success-subtle text-success-strong",
        warning: "bg-warning-subtle text-warning-strong",
        destructive: "bg-destructive-subtle text-destructive-strong",
        soon: "bg-soon-subtle text-soon",
      },
    },
    defaultVariants: {
      shape: "square",
      size: "md",
      tone: "neutral",
    },
  }
)

/** An icon on a tinted tile: stat cards, settings rows, card titles, empty states. */
function IconChip({
  className,
  shape,
  size,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconChipVariants>) {
  return (
    <span
      data-slot="icon-chip"
      className={cn(iconChipVariants({ shape, size, tone }), className)}
      {...props}
    />
  )
}

export { IconChip, iconChipVariants }
