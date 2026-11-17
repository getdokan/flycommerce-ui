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
  /**
   * `"pill"`: Discard and Save as 36px pills, Discard quiet with a faint hairline border, and a bar that stops
   * widening at `lg`. The default keeps the outlined Discard and the standard buttons.
   */
  shape?: "default" | "pill"
}

const PILL_ACTION = "h-9 gap-2 px-4 font-semibold"
// The halves of a split Save button don't shrink on press: one alone would open a seam between them.
const SPLIT_HALF = "active:scale-100"

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
  shape = "default",
  className,
  ...props
}: SaveBarProps) {
  if (!open) return null

  const pill = shape === "pill"

  const save = (
    <Button
      type={saveType}
      shape={shape}
      loading={loading}
      disabled={disabled}
      onClick={onSave}
      className={cn(
        pill && PILL_ACTION,
        saveMenu && SPLIT_HALF,
        saveMenu && "rounded-e-none"
      )}
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
        data-shape={pill ? shape : undefined}
        className={cn(
          "pointer-events-auto flex w-full max-w-lg animate-in flex-wrap items-center justify-between gap-4 bg-inverse text-sm text-inverse-foreground shadow-lg duration-200 fade-in-0 slide-in-from-bottom-4 md:max-w-2xl md:flex-nowrap lg:max-w-3xl",
          pill
            ? "rounded-xl px-5 py-3.5 sm:px-6"
            : "rounded-lg px-6 py-4 xl:max-w-4xl",
          className
        )}
        {...props}
      >
        <span className="font-medium">{message}</span>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button
            variant={pill ? "ghost" : "outline"}
            shape={shape}
            className={
              pill
                ? cn(
                    PILL_ACTION,
                    "border-inverse-foreground/20 text-inverse-foreground/90 hover:bg-inverse-foreground/10 hover:text-inverse-foreground"
                  )
                : "border-inverse-foreground bg-transparent text-inverse-foreground hover:border-inverse-foreground hover:bg-inverse-foreground hover:text-inverse"
            }
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
                    shape={shape}
                    aria-label={saveMenuLabel}
                    disabled={disabled || loading}
                    className={cn(
                      "rounded-s-none border-s-primary-press",
                      SPLIT_HALF,
                      pill && "size-9"
                    )}
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
