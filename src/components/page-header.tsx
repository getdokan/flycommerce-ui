import * as React from "react"
import { cn } from "cn"
import { FiChevronLeft as ChevronLeftIcon } from "react-icons/fi"
import { Slot } from "radix-ui"

function PageHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "mb-[22px] flex flex-wrap items-start gap-x-4 gap-y-3",
        className
      )}
      {...props}
    />
  )
}

/** Back link above the title; pass `asChild` to render your router's Link. */
function PageHeaderBack({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="page-header-back"
      className={cn(
        "-mb-1 inline-flex w-full items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-4 [&_svg]:rtl:rotate-180",
        className
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <ChevronLeftIcon aria-hidden="true" />
          {children}
        </>
      )}
    </Comp>
  )
}

function PageHeaderContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-content"
      className={cn("min-w-0 flex-[1_1_18rem]", className)}
      {...props}
    />
  )
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn("text-2xl font-bold text-foreground", className)}
      {...props}
    />
  )
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn(
        "mt-1.5 max-w-[70ch] text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  PageHeader,
  PageHeaderBack,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
}
