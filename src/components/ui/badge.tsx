import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-[23px] w-fit shrink-0 items-center justify-center gap-[5px] overflow-hidden rounded-full border border-transparent px-2.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary-subtle text-primary-strong",
        secondary: "bg-page text-foreground-secondary",
        success: "bg-success-subtle text-success-strong",
        warning: "bg-warning-subtle text-warning-strong",
        destructive: "bg-destructive-subtle text-destructive-strong",
        soon: "bg-soon-subtle text-soon",
        outline: "border-border text-foreground",
        ghost: "hover:bg-page",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  dot = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Leading status dot in the badge's own colour. */
    dot?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && !asChild && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
