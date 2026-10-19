"use client"

import * as React from "react"
import { FiEye as EyeIcon, FiEyeOff as EyeOffIcon } from "react-icons/fi"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  containerClassName?: string
  showLabel?: string
  hideLabel?: string
  /** The last characters of a secret that is already saved: the empty field shows them after a mask, and screen readers hear that leaving it blank keeps the secret. */
  savedSuffix?: string
  /** The placeholder while a secret is saved; replaces `placeholder`. */
  savedPlaceholder?: (suffix: string) => string
  /** The screen-reader hint while a secret is saved. */
  savedLabel?: (suffix: string) => React.ReactNode
}

/** Password or secret field with show/hide; `savedSuffix` marks a secret that is already saved. */
function PasswordInput({
  containerClassName,
  showLabel = "Show password",
  hideLabel = "Hide password",
  autoComplete = "current-password",
  savedSuffix,
  savedPlaceholder = (suffix) => `••••••••${suffix}`,
  savedLabel = (suffix) => `Saved, ends in ${suffix}. Leave blank to keep it.`,
  placeholder,
  "aria-describedby": describedBy,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const savedId = React.useId()

  return (
    <InputGroup data-slot="password-input" className={containerClassName}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={savedSuffix ? savedPlaceholder(savedSuffix) : placeholder}
        aria-describedby={
          savedSuffix
            ? [describedBy, savedId].filter(Boolean).join(" ")
            : describedBy
        }
        {...props}
      />
      {savedSuffix && (
        <span id={savedId} data-slot="password-input-saved" className="sr-only">
          {savedLabel(savedSuffix)}
        </span>
      )}
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput, type PasswordInputProps }
