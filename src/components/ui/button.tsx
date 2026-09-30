import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-control border border-transparent text-sm font-[560] whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(21_93_252/0.24)] hover:border-primary-hover hover:bg-primary-hover active:border-primary-press active:bg-primary-press",
        outline:
          "border-border bg-background text-foreground hover:border-placeholder hover:shadow-1 aria-expanded:border-placeholder",
        secondary:
          "border-primary/35 bg-background font-semibold text-primary hover:border-primary hover:bg-primary-subtle-2 aria-expanded:border-primary",
        ghost:
          "bg-transparent text-foreground hover:bg-page aria-expanded:bg-page",
        destructive:
          "bg-transparent text-destructive hover:bg-destructive-subtle focus-visible:ring-destructive/30",
        link: "h-auto border-0 bg-transparent p-0 font-semibold text-primary hover:underline",
      },
      size: {
        default:
          "h-[38px] px-[15px] has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-4",
        icon: "size-[38px]",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner and disables the button; ignored with `asChild`. */
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const isLoading = loading && !asChild

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner aria-hidden="true" role={undefined} aria-label={undefined} />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
