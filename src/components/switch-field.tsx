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
  /** `row`: the settings toggle row for a flush card, padded, with 14px type and the whole row as the click target. */
  variant?: "default" | "row"
  /** A plain "Enabled" or "Disabled" before the switch, hidden from screen readers; `{ on, off }` sets the words. On by default in the `row` variant. */
  stateLabel?: boolean | { on: string; off: string }
  /** Shown after the title, e.g. a `Badge`. */
  badge?: React.ReactNode
  /** Shown under the row while the switch is on, e.g. the setting's own fields. */
  children?: React.ReactNode
}

const STATE_LABEL = { on: "Enabled", off: "Disabled" }

/** Prototype ToggleRow: title, description and a switch; `variant="row"` for settings cards. */
function SwitchField({
  title,
  description,
  loading = false,
  disabled,
  id,
  containerClassName,
  variant = "default",
  stateLabel = variant === "row",
  badge,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: SwitchFieldProps) {
  const generatedId = React.useId()
  const switchId = id ?? generatedId
  const descriptionId = `${switchId}-description`
  const titleId = `${switchId}-title`
  const [uncontrolledOn, setUncontrolledOn] = React.useState(
    defaultChecked ?? false
  )
  const on = checked ?? uncontrolledOn
  const words = stateLabel === true ? STATE_LABEL : stateLabel || undefined
  const row = variant === "row"

  const control = (
    <>
      {loading && <Spinner className="size-3.5 text-muted-foreground" />}
      {words && (
        <span
          aria-hidden="true"
          data-slot="switch-field-state"
          className="text-sm text-foreground-secondary"
        >
          {on ? words.on : words.off}
        </span>
      )}
      <Switch
        id={switchId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          setUncontrolledOn(value)
          onCheckedChange?.(value)
        }}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-labelledby={row ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      />
    </>
  )
  const content = on && children && (
    <div data-slot="switch-field-content" className="mt-4">
      {children}
    </div>
  )

  if (row) {
    return (
      <div
        data-slot="switch-field"
        data-variant="row"
        className={cn(
          "border-b border-border px-5 py-4 last:border-b-0 sm:px-6",
          containerClassName
        )}
      >
        <label
          htmlFor={switchId}
          className="flex cursor-pointer items-start justify-between gap-4 has-disabled:cursor-not-allowed"
        >
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span
                id={titleId}
                className="text-sm font-medium text-foreground"
              >
                {title}
              </span>
              {badge}
            </span>
            {description && (
              <span
                id={descriptionId}
                className="mt-0.5 block max-w-[64ch] text-sm text-muted-foreground"
              >
                {description}
              </span>
            )}
          </span>
          <span className="flex h-5 shrink-0 items-center gap-2.5">
            {control}
          </span>
        </label>
        {content}
      </div>
    )
  }

  const label = (
    <label
      htmlFor={switchId}
      className="text-[13.5px] font-[560] text-foreground"
    >
      {title}
    </label>
  )

  return (
    <div
      data-slot="switch-field"
      data-variant="default"
      className={cn(
        "flex items-start gap-3.5 border-b border-border-subtle py-[15px] last:border-b-0",
        containerClassName
      )}
    >
      <div className="min-w-0 flex-1">
        {badge ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {label}
            {badge}
          </div>
        ) : (
          label
        )}
        {description && (
          <p
            id={descriptionId}
            className="mt-[3px] text-[12.5px] text-muted-foreground"
          >
            {description}
          </p>
        )}
        {content}
      </div>
      <div className="flex items-center gap-2">{control}</div>
    </div>
  )
}

export { SwitchField, type SwitchFieldProps }
