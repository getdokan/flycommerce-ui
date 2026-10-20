import * as React from "react"
import { cn } from "cn"
import { FiArrowRight as ArrowRightIcon } from "react-icons/fi"

type ButtonArrowProps = React.ComponentProps<"span"> & {
  /** Holds the arrow at the end of a full-width pill whose label centres across it. */
  pinned?: boolean
}

/** The forward arrow of a pill call to action, in its own circle tinted for the button's variant. */
function ButtonArrow({
  pinned = false,
  className,
  ...props
}: ButtonArrowProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="button-arrow"
      data-pinned={pinned || undefined}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-muted transition-transform duration-300 ease-fluid group-hover/button:translate-x-0.5 group-data-[variant=default]/button:bg-primary-foreground/15 group-data-[variant=destructive-solid]/button:bg-primary-foreground/15 rtl:group-hover/button:-translate-x-0.5",
        pinned && "absolute end-1.5 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      <ArrowRightIcon className="size-4 rtl:rotate-180" />
    </span>
  )
}

export { ButtonArrow, type ButtonArrowProps }
