"use client"

import * as React from "react"
import { cn } from "cn"
import { FiChevronDown } from "react-icons/fi"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  /** `DropdownMenuItem`s behind a chevron joined to Save, e.g. "Save and publish". */
  saveMenu?: React.ReactNode
  /** Accessible name of the chevron that opens `saveMenu`. */
  saveMenuLabel?: string
  /** Save button type; "submit" lets the bar sit inside a <form>. */
  saveType?: "button" | "submit"
}

/** The dashboard's unsaved-changes bar: dark, centred at the bottom, Discard outlined and Save primary. */
function SaveBar({
  open,
  message = "Unsaved changes",
  onSave,
  onDiscard,
  saveLabel = "Save changes",
  discardLabel = "Discard",
  loading = false,
  disabled = false,
  actions,
  saveMenu,
  saveMenuLabel = "More save options",
  saveType = "button",
  className,
  ...props
}: SaveBarProps) {
  if (!open) return null

  const save = (
    <Button
      type={saveType}
      loading={loading}
      disabled={disabled}
      onClick={onSave}
      className={cn(saveMenu && "rounded-e-none")}
    >
      {saveLabel}
    </Button>
  )

  return (
    <div
      data-slot="save-bar"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-6"
    >
      <div
        role="region"
        aria-label={typeof message === "string" ? message : "Save changes"}
        className={cn(
          "pointer-events-auto flex w-full max-w-lg animate-in flex-wrap items-center justify-between gap-4 rounded-lg bg-inverse px-6 py-4 text-sm text-inverse-foreground shadow-lg duration-200 fade-in-0 slide-in-from-bottom-4 md:max-w-2xl md:flex-nowrap lg:max-w-3xl xl:max-w-4xl",
          className
        )}
        {...props}
      >
        <span className="font-medium">{message}</span>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button
            variant="outline"
            className="border-inverse-foreground bg-transparent text-inverse-foreground hover:border-inverse-foreground hover:bg-inverse-foreground hover:text-inverse"
            disabled={loading}
            onClick={onDiscard}
          >
            {discardLabel}
          </Button>
          {saveMenu ? (
            <div className="flex">
              {save}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    aria-label={saveMenuLabel}
                    disabled={disabled || loading}
                    className="rounded-s-none border-s-primary-press"
                  >
                    <FiChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                  {saveMenu}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            save
          )}
        </div>
      </div>
    </div>
  )
}

export { SaveBar, type SaveBarProps }
