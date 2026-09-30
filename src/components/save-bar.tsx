"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

type SaveBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Show the bar, typically when the form is dirty. */
  open: boolean
  message?: React.ReactNode
  onSave?: () => void
  onDiscard: () => void
  saveLabel?: React.ReactNode
  discardLabel?: React.ReactNode
  loading?: boolean
  /** Disables Save only, e.g. while the form is invalid. */
  disabled?: boolean
  /** Extra buttons before Discard. */
  actions?: React.ReactNode
  /** Save button type; "submit" lets the bar sit inside a <form>. */
  saveType?: "button" | "submit"
}

function SaveBar({
  open,
  message = "Unsaved changes",
  onSave,
  onDiscard,
  saveLabel = "Save",
  discardLabel = "Discard",
  loading = false,
  disabled = false,
  actions,
  saveType = "button",
  className,
  ...props
}: SaveBarProps) {
  if (!open) return null

  return (
    <div
      data-slot="save-bar"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      <div
        role="region"
        aria-label={typeof message === "string" ? message : "Save changes"}
        className={cn(
          "pointer-events-auto flex w-full max-w-xl animate-in flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sidebar px-4 py-2.5 text-sm text-sidebar-foreground shadow-pop duration-200 fade-in-0 slide-in-from-bottom-4 sm:w-auto sm:flex-nowrap",
          className
        )}
        {...props}
      >
        <span className="me-auto font-[560]">{message}</span>
        {actions}
        <Button
          variant="ghost"
          size="sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          disabled={loading}
          onClick={onDiscard}
        >
          {discardLabel}
        </Button>
        <Button
          size="sm"
          type={saveType}
          loading={loading}
          disabled={disabled}
          onClick={onSave}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}

export { SaveBar, type SaveBarProps }
