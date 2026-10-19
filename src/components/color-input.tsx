"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

type ColorInputLabels = {
  picker?: string
  error?: string
  clear?: string
}

type ColorInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value: string | null
  /** Receives lower-case `#rrggbb` for 3 or 6 hex digits, `null` when empty, and anything else as typed after a `#`. */
  onValueChange: (value: string | null) => void
  /** An empty field is valid, and a clear button shows while there is a value. */
  allowClear?: boolean
  /** What the swatch and the picker show while the field is empty, e.g. an inherited colour. */
  fallback?: string
  invalid?: boolean
  labels?: ColorInputLabels
  containerClassName?: string
}

const DEFAULT_LABELS: Required<ColorInputLabels> = {
  picker: "Pick a colour",
  error: "Use 3 or 6 hex digits, like #1F2A44.",
  clear: "Clear",
}

const HEX_DIGITS = /^(?:[0-9a-f]{3}){1,2}$/i

function digitsOf(value: string | null | undefined) {
  return (value ?? "").replace(/[^0-9a-f]/gi, "").slice(0, 6)
}

function toHex(digits: string) {
  if (!HEX_DIGITS.test(digits)) return null
  const full = digits.length === 3 ? digits.replace(/./g, "$&$&") : digits
  return `#${full.toLowerCase()}`
}

function toValue(digits: string) {
  if (!digits) return null
  return toHex(digits) ?? `#${digits.toLowerCase()}`
}

/** Hex colour field: a swatch over the native picker and a `#` field taking 3 or 6 digits. */
function ColorInput({
  value,
  onValueChange,
  allowClear = false,
  fallback,
  invalid = false,
  disabled,
  labels: labelsProp,
  placeholder = "000000",
  className,
  containerClassName,
  "aria-describedby": describedBy,
  ...props
}: ColorInputProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const errorId = React.useId()
  const [digits, setDigits] = React.useState(() => digitsOf(value))
  const [syncedValue, setSyncedValue] = React.useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    if (toValue(digits) !== toValue(digitsOf(value))) setDigits(digitsOf(value))
  }

  const hex = toHex(digits)
  const fallbackHex = toHex(digitsOf(fallback))
  const valid = digits ? hex !== null : allowClear
  const swatch = digits ? hex : fallbackHex

  const commit = (next: string) => {
    if (next === digits) return
    setDigits(next)
    onValueChange(toValue(next))
  }

  return (
    <div
      data-slot="color-input"
      data-invalid={invalid || !valid || undefined}
      data-disabled={disabled || undefined}
      className={cn("flex w-full min-w-0 flex-col gap-2", containerClassName)}
    >
      <div className="flex items-center gap-2">
        <span
          data-slot="color-input-swatch"
          style={swatch ? { backgroundColor: swatch } : undefined}
          className="relative size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-border transition-transform active:scale-97 has-[input:disabled]:opacity-50 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring"
        >
          <input
            type="color"
            aria-label={labels.picker}
            value={hex ?? fallbackHex ?? "#000000"}
            disabled={disabled}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={(event) => commit(digitsOf(event.target.value))}
          />
        </span>
        <InputGroup dir="ltr" className="flex-1">
          <InputGroupAddon>
            <InputGroupText>#</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            value={digits}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            aria-invalid={invalid || !valid || undefined}
            aria-describedby={
              [describedBy, !valid && errorId].filter(Boolean).join(" ") ||
              undefined
            }
            className={cn("font-mono uppercase", className)}
            onChange={(event) => commit(digitsOf(event.target.value))}
            {...props}
          />
        </InputGroup>
        {allowClear && digits && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={(event) => {
              const row = event.currentTarget.parentElement
              commit("")
              row
                ?.querySelector<HTMLInputElement>(
                  '[data-slot="input-group-control"]'
                )
                ?.focus()
            }}
          >
            {labels.clear}
          </Button>
        )}
      </div>
      {!valid && <FieldError id={errorId}>{labels.error}</FieldError>}
    </div>
  )
}

export { ColorInput, type ColorInputLabels, type ColorInputProps }
