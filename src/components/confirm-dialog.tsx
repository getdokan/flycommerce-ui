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
  /** The dialog closes when this resolves and stays open when it throws. */
  onConfirm: () => void | Promise<void>
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
  onConfirm,
}: ConfirmDialogProps) {
  const [openState, setOpenState] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const inputId = React.useId()

  const open = openProp ?? openState
  const busy = loading ?? pending
  const blocked = confirmText !== undefined && typed !== confirmText

  const setOpen = (next: boolean) => {
    if (busy && !next) return
    if (!next) setTyped("")
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
      <AlertDialogContent>
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
                <>
                  Type <strong className="font-semibold">{confirmText}</strong>{" "}
                  to confirm
                </>
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
