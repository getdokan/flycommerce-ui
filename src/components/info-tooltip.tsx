"use client"

import * as React from "react"
import { cn } from "cn"
import { FiInfo as InfoIcon } from "react-icons/fi"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type InfoTooltipProps = {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  /** Accessible name for the icon button. */
  label?: string
  className?: string
  contentClassName?: string
  /** Replaces the default info icon. */
  children?: React.ReactNode
}

/** One-line tooltip: an info icon that explains the thing next to it. */
function InfoTooltip({
  content,
  side = "top",
  label = "More information",
  className,
  contentClassName,
  children,
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3.5",
            className
          )}
        >
          {children ?? <InfoIcon aria-hidden="true" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className={cn("max-w-60", contentClassName)}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export { InfoTooltip, type InfoTooltipProps }
