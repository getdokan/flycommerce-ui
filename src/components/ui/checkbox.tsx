"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { FiCheck as CheckIcon, FiMinus as MinusIcon } from "react-icons/fi"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox relative flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-input bg-background transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxIndicator />
    </CheckboxPrimitive.Root>
  )
}

/** The checkbox's 14px check, or dash while indeterminate; draws `Checkbox`'s mark inside a custom checkbox. */
function CheckboxIndicator({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Indicator>) {
  return (
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className={cn(
        "group/checkbox-indicator grid place-content-center text-current transition-none [&>svg]:size-3.5",
        className
      )}
      {...props}
    >
      <CheckIcon className="group-data-[state=indeterminate]/checkbox-indicator:hidden" />
      <MinusIcon className="hidden group-data-[state=indeterminate]/checkbox-indicator:block" />
    </CheckboxPrimitive.Indicator>
  )
}

export { Checkbox, CheckboxIndicator }
