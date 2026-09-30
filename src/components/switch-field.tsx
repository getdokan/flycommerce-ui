"use client"

import * as React from "react"
import { cn } from "cn"

import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

type SwitchFieldProps = Omit<
  React.ComponentProps<typeof Switch>,
  "title" | "children"
> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Shows a spinner and blocks toggling while a save is in flight. */
  loading?: boolean
  containerClassName?: string
}

/** Prototype ToggleRow: title and description on the left, a switch on the right. */
function SwitchField({
  title,
  description,
  loading = false,
  disabled,
  id,
  containerClassName,
  ...props
}: SwitchFieldProps) {
  const generatedId = React.useId()
  const switchId = id ?? generatedId
  const descriptionId = `${switchId}-description`

  return (
    <div
      data-slot="switch-field"
      className={cn(
        "flex items-start gap-3.5 border-b border-border-subtle py-[15px] last:border-b-0",
        containerClassName
      )}
    >
      <div className="min-w-0 flex-1">
        <label
          htmlFor={switchId}
          className="text-[13.5px] font-[560] text-foreground"
        >
          {title}
        </label>
        {description && (
          <p
            id={descriptionId}
            className="mt-[3px] text-[12.5px] text-muted-foreground"
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {loading && <Spinner className="size-3.5 text-muted-foreground" />}
        <Switch
          id={switchId}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          aria-describedby={description ? descriptionId : undefined}
          {...props}
        />
      </div>
    </div>
  )
}

export { SwitchField, type SwitchFieldProps }
