"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ConfirmDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog when it is uncontrolled. */
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Extra content between the description and the buttons. */
  children?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  destructive?: boolean
  /** Overrides the pending state that an async `onConfirm` sets on its own. */
  loading?: boolean
  /** Require typing this exact text before confirming (e.g. a store name). */
  confirmText?: string
  confirmTextLabel?: React.ReactNode
  /** Require ticking a checkbox with this label before confirming (e.g. "I am sure I want to remove them"). */
  acknowledgeLabel?: React.ReactNode
  /** The dialog closes when this resolves and stays open when it throws. */
  onConfirm: () => void | Promise<void>
  /**
   * Where focus goes when the dialog closes, for a dialog opened without its own `trigger` (e.g. from a menu item,
   * which is gone by then): an element, a ref, or a function read at close. Ignored when the target has left the page.
   */
  returnFocusTo?: FocusTarget
  /** Runs before focus returns; call `event.preventDefault()` to place focus yourself. */
  onCloseAutoFocus?: (event: Event) => void
}

type FocusTarget =
  | HTMLElement
  | null
  | React.RefObject<HTMLElement | null>
  | (() => HTMLElement | null | undefined)

function resolveTarget(target: FocusTarget | undefined) {
  if (!target) return null
  if (typeof target === "function") return target() ?? null
  if ("current" in target) return target.current
  return target
}

function ConfirmDialog({
  open: openProp,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading,
  confirmText,
  confirmTextLabel,
  acknowledgeLabel,
  onConfirm,
  returnFocusTo,
  onCloseAutoFocus,
}: ConfirmDialogProps) {
  const [openState, setOpenState] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const [acknowledged, setAcknowledged] = React.useState(false)
  const inputId = React.useId()

  const open = openProp ?? openState
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) {
      setTyped("")
      setAcknowledged(false)
    }
  }
  const busy = loading ?? pending
  const blocked =
    (confirmText !== undefined && typed !== confirmText) ||
    (Boolean(acknowledgeLabel) && !acknowledged)

  const setOpen = (next: boolean) => {
    if (busy && !next) return
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }

  const handleConfirm = async () => {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // The caller reports the error; keep the dialog open so they can retry.
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (event.defaultPrevented) return
          const target = resolveTarget(returnFocusTo)
          if (!target?.isConnected) return
          event.preventDefault()
          target.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        {confirmText !== undefined && (
          <Field>
            <FieldLabel htmlFor={inputId}>
              {confirmTextLabel ?? (
                <span className="font-normal text-foreground-secondary">
                  Type{" "}
                  <strong className="font-bold text-foreground">
                    {confirmText}
                  </strong>{" "}
                  to confirm
                </span>
              )}
            </FieldLabel>
            <Input
              id={inputId}
              value={typed}
              autoComplete="off"
              onChange={(event) => setTyped(event.target.value)}
            />
          </Field>
        )}
        {acknowledgeLabel && (
          <label
            data-slot="confirm-dialog-acknowledge"
            className="flex cursor-pointer items-center gap-2.5 text-sm"
          >
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            {acknowledgeLabel}
          </label>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive-solid" : "default"}
            loading={busy}
            disabled={blocked}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog, type ConfirmDialogProps }
