"use client"

import * as React from "react"
import { cn } from "cn"

import { isPlainClick } from "@/lib/events"

type CellLinkProps = React.ComponentProps<"a"> & {
  href: string
  /** Called on a plain click, for a client-side router; a modified click (new tab) opens `href` as usual. */
  onNavigate?: () => void
}

/** A table cell's name as a link, truncated on the link itself so its focus ring isn't clipped. */
function CellLink({ onNavigate, onClick, className, ...props }: CellLinkProps) {
  return (
    <a
      className={cn(
        "truncate rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!onNavigate || !isPlainClick(event)) return
        event.preventDefault()
        onNavigate()
      }}
      {...props}
    />
  )
}

export { CellLink, type CellLinkProps }
