import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent text-sm font-[560] whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-busy:pointer-events-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(21_93_252/0.24)] hover:border-primary-hover hover:bg-primary-hover active:border-primary-press active:bg-primary-press",
        outline:
          "border-border bg-background text-foreground hover:border-placeholder hover:shadow-1 aria-expanded:border-placeholder",
        secondary:
          "border-primary/35 bg-background font-semibold text-primary-ink hover:border-primary hover:bg-primary-subtle-2 aria-expanded:border-primary",
        ghost:
          "bg-transparent text-foreground hover:bg-page aria-expanded:bg-page",
        destructive:
          "bg-transparent text-destructive hover:bg-destructive-subtle focus-visible:ring-destructive/30",
        "destructive-solid":
          "border-destructive bg-destructive text-white hover:border-destructive-strong hover:bg-destructive-strong focus-visible:ring-destructive/30",
        link: "h-auto border-0 bg-transparent p-0 font-semibold text-primary-ink hover:underline [&>svg[data-icon=inline-start]:first-child]:-ms-0.75",
      },
      size: {
        default:
          "h-10 px-[15px] has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-4",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      shape: {
        default: "rounded-control",
        pill: "relative rounded-full transition-[color,background-color,border-color,box-shadow,scale] duration-200 ease-fluid active:scale-98",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        className:
          "h-auto px-0 has-data-[icon=inline-end]:pe-0 has-data-[icon=inline-start]:ps-0",
      },
      {
        shape: "pill",
        size: "default",
        className:
          "h-11 gap-3 px-5 has-[[data-slot=button-arrow]:not([data-pinned])]:pe-1.5 has-[[data-slot=button-arrow][data-pinned]]:w-full has-[[data-slot=button-arrow][data-pinned]]:px-12",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /**
     * Shows a spinner and ignores clicks, Enter and Space until it ends, including a form submit. The button keeps
     * focus and stays in the tab order (`aria-disabled`, `aria-busy`), so keyboard users don't lose their place.
     * Ignored with `asChild`.
     */
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const isLoading = loading && !asChild

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape === "pill" ? shape : undefined}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      disabled={asChild ? undefined : disabled}
      aria-busy={isLoading || undefined}
      {...props}
      aria-disabled={isLoading || props["aria-disabled"]}
      onClick={
        isLoading
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              // Enter and Space reach here as a click too; preventing it also stops a form submit.
              event.preventDefault()
              event.stopPropagation()
            }
          : onClick
      }
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
