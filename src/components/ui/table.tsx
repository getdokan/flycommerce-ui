"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

type TableVariant = "default" | "list"
type TableSize = "sm" | "default" | "lg"

const TableContext = React.createContext<{
  variant: TableVariant
  size: TableSize
}>({ variant: "default", size: "default" })

function Table({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"table"> & {
  /** `list`: a light table inside a card: sentence-case header without a band, hairline rows, hover tint only on rows with `onClick`. */
  variant?: TableVariant
  /** Row padding, one 4px step tighter (`sm`) or roomier (`lg`) than `default`. */
  size?: TableSize
}) {
  const context = React.useMemo(() => ({ variant, size }), [variant, size])
  return (
    <TableContext.Provider value={context}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto"
      >
        <table
          data-slot="table"
          data-variant={variant}
          data-size={size}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
}

const tableHeaderVariants = cva("", {
  variants: {
    variant: {
      default:
        "bg-card-header [&_tr]:border-b [&_tr]:border-border-subtle [&_tr]:hover:bg-transparent",
      list: "[&_tr]:border-b [&_tr]:border-border",
    },
  },
})

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const { variant } = React.useContext(TableContext)
  return (
    <thead
      data-slot="table-header"
      className={cn(tableHeaderVariants({ variant }), className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border-subtle bg-card-header font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

const tableRowVariants = cva("", {
  variants: {
    variant: {
      default:
        "border-b border-border-subtle transition-colors hover:bg-card-header has-aria-expanded:bg-card-header data-[state=selected]:bg-primary-subtle-2",
      list: "border-b border-border transition-colors data-clickable:cursor-pointer data-clickable:hover:bg-muted/50 data-clickable:focus-visible:ring-3 data-clickable:focus-visible:ring-ring data-clickable:focus-visible:outline-none data-clickable:focus-visible:ring-inset data-[state=selected]:bg-primary-subtle-2",
    },
  },
})

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const { variant } = React.useContext(TableContext)
  return (
    <tr
      data-slot="table-row"
      data-clickable={
        (variant === "list" && Boolean(props.onClick)) || undefined
      }
      className={cn(tableRowVariants({ variant }), className)}
      {...props}
    />
  )
}

const tableHeadVariants = cva("", {
  variants: {
    variant: {
      default:
        "px-4 text-start align-middle text-xs font-semibold whitespace-nowrap text-muted-foreground uppercase [&:has([role=checkbox])]:pe-0",
      list: "px-3 py-2.5 text-start align-middle text-xs font-medium whitespace-nowrap text-muted-foreground first:ps-5 last:pe-5 sm:first:ps-6 sm:last:pe-6 [&:has([role=checkbox])]:pe-0",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
  },
  compoundVariants: [
    { variant: "default", size: "sm", className: "py-4" },
    { variant: "default", size: "default", className: "py-5" },
    { variant: "default", size: "lg", className: "py-6" },
  ],
})

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { variant, size } = React.useContext(TableContext)
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const tableCellVariants = cva("", {
  variants: {
    variant: {
      default:
        "px-4 align-middle whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pe-0",
      list: "px-3 align-middle tabular-nums first:ps-5 last:pe-5 sm:first:ps-6 sm:last:pe-6 [&:has([role=checkbox])]:pe-0",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
  },
  compoundVariants: [
    { variant: "default", size: "sm", className: "py-4" },
    { variant: "default", size: "default", className: "py-5" },
    { variant: "default", size: "lg", className: "py-6" },
    { variant: "list", size: "sm", className: "py-2" },
    { variant: "list", size: "default", className: "py-3" },
    { variant: "list", size: "lg", className: "py-4" },
  ],
})

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { variant, size } = React.useContext(TableContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
