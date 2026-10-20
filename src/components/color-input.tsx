"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

type ColorInputLabels = {
  picker?: string
  clear?: string
}

type ColorInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value: string | null
  /** Receives lower-case `#rrggbb` for 3 or 6 hex digits and `null` when empty. Anything else, alpha (4 or 8 digits), `rgb()` and colour names included, isn't read: it comes through lower-cased after a `#`. */
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
  clear: "Clear",
}

const HEX_DIGITS = /^(?:[0-9a-f]{3}){1,2}$/i

function textOf(value: string | null | undefined) {
  return (value ?? "").trim().replace(/^#/, "")
}

function toHex(text: string) {
  if (!HEX_DIGITS.test(text)) return null
  const full = text.length === 3 ? text.replace(/./g, "$&$&") : text
  return `#${full.toLowerCase()}`
}

function toValue(text: string) {
  if (!text) return null
  return toHex(text) ?? `#${text.toLowerCase()}`
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
  ...props
}: ColorInputProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [text, setText] = React.useState(() => textOf(value))
  const [syncedValue, setSyncedValue] = React.useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    if (toValue(text) !== toValue(textOf(value))) setText(textOf(value))
  }

  const hex = toHex(text)
  const fallbackHex = toHex(textOf(fallback))
  const malformed = text ? hex === null : !allowClear
  const swatch = text ? hex : fallbackHex

  const commit = (next: string) => {
    if (next === text) return
    setText(next)
    onValueChange(toValue(next))
  }

  return (
    <div
      data-slot="color-input"
      data-invalid={invalid || malformed || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "flex w-full min-w-0 items-center gap-2",
        containerClassName
      )}
    >
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
          onChange={(event) => commit(textOf(event.target.value))}
        />
      </span>
      <InputGroup dir="ltr" className="flex-1">
        <InputGroupAddon>
          <InputGroupText>#</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-invalid={invalid || malformed || undefined}
          className={cn("font-mono uppercase", className)}
          onChange={(event) => commit(textOf(event.target.value))}
          {...props}
        />
      </InputGroup>
      {allowClear && text && (
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
  )
}

export { ColorInput, type ColorInputLabels, type ColorInputProps }
