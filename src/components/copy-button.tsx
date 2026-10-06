"use client"

import * as React from "react"
import { cn } from "cn"
import { FiCheck as CheckIcon, FiCopy as CopyIcon } from "react-icons/fi"

import { Button } from "@/components/ui/button"

type CopyButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  value: string
  onCopy?: (value: string) => void
  /** Accessible label; also the visible text unless `iconOnly`. */
  label?: string
  copiedLabel?: string
  iconOnly?: boolean
  /** How long the "copied" state lasts, in ms. */
  timeout?: number
}

function CopyButton({
  value,
  onCopy,
  label = "Copy",
  copiedLabel = "Copied",
  iconOnly = false,
  timeout = 1800,
  variant = "outline",
  size,
  children,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    onCopy?.(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), timeout)
  }

  const Icon = copied ? CheckIcon : CopyIcon
  const text = copied ? copiedLabel : label

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (iconOnly ? "icon-sm" : "sm")}
      aria-label={iconOnly ? text : undefined}
      data-copied={copied || undefined}
      onClick={copy}
      className={cn("relative", className)}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={copied ? "text-success" : undefined}
      />
      {!iconOnly && (children ?? text)}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  )
}

export { CopyButton, type CopyButtonProps }
