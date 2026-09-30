"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

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
}

function PasswordInput({
  containerClassName,
  showLabel = "Show password",
  hideLabel = "Hide password",
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroup data-slot="password-input" className={containerClassName}>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        {...props}
      />
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
