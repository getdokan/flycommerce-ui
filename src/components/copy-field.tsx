"use client"

import * as React from "react"
import { cn } from "cn"

import { CopyButton } from "@/components/copy-button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

type CopyFieldProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "onCopy" | "readOnly" | "type"
> & {
  value: string
  label?: React.ReactNode
  /** Monospace text, for URLs, keys, codes and DNS records. */
  mono?: boolean
  /** The copy button's name: "Copy {label}" when `label` is text, otherwise "Copy". */
  copyLabel?: string
  copiedLabel?: string
  onCopy?: (value: string) => void
  containerClassName?: string
}

/** A read-only value with an icon copy button, for URLs, DNS records, keys and codes. */
function CopyField({
  value,
  label,
  mono = false,
  copyLabel = typeof label === "string" ? `Copy ${label}` : "Copy",
  copiedLabel = "Copied",
  onCopy,
  id,
  disabled,
  className,
  containerClassName,
  ...props
}: CopyFieldProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  const group = (
    <InputGroup
      data-slot="copy-field"
      data-mono={mono || undefined}
      className={label ? undefined : containerClassName}
    >
      <InputGroupInput
        id={inputId}
        type="text"
        readOnly
        dir="auto"
        value={value}
        disabled={disabled}
        className={cn("text-ellipsis", mono && "font-mono", className)}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <CopyButton
          value={value}
          iconOnly
          size="icon-xs"
          variant="ghost"
          label={copyLabel}
          copiedLabel={copiedLabel}
          disabled={disabled}
          onCopy={onCopy}
        />
      </InputGroupAddon>
    </InputGroup>
  )

  if (!label) return group

  return (
    <Field className={containerClassName}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      {group}
    </Field>
  )
}

export { CopyField, type CopyFieldProps }
