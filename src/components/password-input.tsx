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
  autoComplete,
  savedSuffix,
  savedPlaceholder = (suffix) => `••••••••${suffix}`,
  savedLabel = (suffix) => `Saved, ends in ${suffix}. Leave blank to keep it.`,
  placeholder,
  "aria-describedby": describedBy,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const [typed, setTyped] = React.useState(
    () => String(props.defaultValue ?? "").length
  )
  const savedId = React.useId()
  const length = props.value !== undefined ? String(props.value).length : typed

  return (
    <InputGroup data-slot="password-input" className={containerClassName}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={
          autoComplete ?? (savedSuffix ? "new-password" : "current-password")
        }
        data-1p-ignore={savedSuffix ? true : undefined}
        data-lpignore={savedSuffix ? "true" : undefined}
        placeholder={savedSuffix ? savedPlaceholder(savedSuffix) : placeholder}
        aria-describedby={
          savedSuffix
            ? [describedBy, savedId].filter(Boolean).join(" ")
            : describedBy
        }
        onChange={(event) => {
          setTyped(event.target.value.length)
          onChange?.(event)
        }}
        {...props}
      />
      {savedSuffix && (
        <span id={savedId} data-slot="password-input-saved" className="sr-only">
          {savedLabel(savedSuffix)}
        </span>
      )}
      {(!savedSuffix || length > 0) && (
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
      )}
    </InputGroup>
  )
}

export { PasswordInput, type PasswordInputProps }
