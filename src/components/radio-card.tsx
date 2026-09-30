"use client"

import * as React from "react"
import { cn } from "cn"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

function RadioCardGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-card-group"
      className={cn("grid gap-3 sm:grid-cols-2", className)}
      {...props}
    />
  )
}

/** Prototype option card: an 18px radio, a title and an optional description. */
function RadioCard({
  className,
  title,
  description,
  children,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-card"
      className={cn(
        "group/radio-card flex w-full items-start gap-[11px] rounded-lg border border-border bg-background px-[15px] py-[13px] text-start transition-colors outline-none hover:border-primary/40 hover:bg-primary-subtle-2 focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary-subtle-2 data-[state=checked]:shadow-[inset_0_0_0_1px_var(--primary)]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="relative mt-px size-[18px] shrink-0 rounded-full border-[1.6px] border-placeholder group-data-[state=checked]/radio-card:border-primary"
      >
        <span className="absolute inset-[3.5px] hidden rounded-full bg-primary group-data-[state=checked]/radio-card:block" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-[570] text-foreground">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-[12px] text-muted-foreground">
            {description}
          </span>
        )}
        {children}
      </span>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioCardGroup, RadioCard }
