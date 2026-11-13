"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
  /** Locks the switch and says why in a tooltip on hover and keyboard focus, e.g. "Shoppers need this email, so it's always sent." Plain text: a tooltip can't hold a link or button. `disabled={false}` unlocks it, so it can follow a condition. */
  disabledReason?: React.ReactNode
}

function isReason(reason: React.ReactNode): boolean {
  if (Array.isArray(reason)) return reason.some(isReason)
  return typeof reason === "string"
    ? reason.trim() !== ""
    : React.isValidElement(reason)
}

function Switch({
  className,
  size = "default",
  disabledReason,
  disabled,
  onClick,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  "aria-describedby": describedBy,
  ...props
}: SwitchProps) {
  const reasonId = React.useId()
  const anchor = React.useRef<HTMLSpanElement>(null)
  const leaving = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const locked = disabled !== false && isReason(disabledReason)
  const reasonOpen = locked && !dismissed && (hovered || focused || pressed)

  React.useLayoutEffect(() => {
    if (!locked) return
    const root = anchor.current?.parentElement
    setFocused(!!root && root === document.activeElement)
    setHovered(!!root?.matches(":hover"))
    setPressed(false)
    setDismissed(false)
  }, [locked])

  React.useEffect(() => () => clearTimeout(leaving.current), [])

  const enter = () => {
    clearTimeout(leaving.current)
    setHovered(true)
    setDismissed(false)
  }
  const leave = () => {
    clearTimeout(leaving.current)
    leaving.current = setTimeout(() => setHovered(false), 100)
  }

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[22px] data-[size=default]:w-[38px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-placeholder data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      onFocus={(event) => {
        onFocus?.(event)
        if (!locked) return
        setFocused(true)
        setDismissed(false)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        if (locked) setFocused(false)
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (locked) enter()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        if (locked) leave()
      }}
      {...props}
      {...(locked
        ? {
            name: undefined,
            required: false,
            "data-disabled": "",
            "aria-disabled": true,
            "aria-describedby": [describedBy, reasonId]
              .filter(Boolean)
              .join(" "),
            onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
              onClick?.(event)
              event.preventDefault()
              setPressed(true)
              setDismissed(false)
            },
          }
        : { disabled, onClick, "aria-describedby": describedBy })}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background shadow-1 ring-0 transition-transform group-data-[size=default]/switch:ms-px group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] rtl:group-data-[size=default]/switch:data-checked:-translate-x-4 rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 rtl:group-data-[size=default]/switch:data-unchecked:-translate-x-0 rtl:group-data-[size=sm]/switch:data-unchecked:-translate-x-0"
      />
      {locked && (
        <>
          <span id={reasonId} hidden>
            {disabledReason}
          </span>
          <Tooltip
            open={reasonOpen}
            onOpenChange={(open) => {
              if (open) return
              setDismissed(true)
              setPressed(false)
            }}
          >
            <TooltipTrigger asChild>
              <span
                ref={anchor}
                data-slot="switch-reason"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
              />
            </TooltipTrigger>
            <TooltipContent
              className="max-w-60"
              onPointerEnter={enter}
              onPointerLeave={leave}
              onPointerDownOutside={(event) => {
                const root = anchor.current?.parentElement
                const target = event.target as Element
                const label = target.closest?.("label")
                if (root?.contains(target) || (root && label?.control === root))
                  event.preventDefault()
              }}
            >
              {disabledReason}
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
