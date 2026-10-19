"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioGroupPrimitive,
} from "radix-ui"
import { FiCheck as CheckIcon, FiMinus as MinusIcon } from "react-icons/fi"

type OptionCardVariant = "cards" | "rows"

const OptionCardVariantContext = React.createContext<OptionCardVariant>("cards")

const groupVariants: Record<OptionCardVariant, string> = {
  cards: "grid gap-3 sm:grid-cols-2",
  rows: "flex flex-col divide-y divide-border",
}

const optionVariants: Record<OptionCardVariant, string> = {
  cards:
    "flex w-full items-start gap-[11px] rounded-lg border border-border bg-background px-[15px] py-[13px] text-start transition-colors outline-none hover:border-primary/40 hover:bg-primary-subtle-2 focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary-subtle-2 data-[state=checked]:shadow-[inset_0_0_0_1px_var(--primary)]",
  rows: "flex w-full items-start gap-3 px-5 py-4 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset enabled:hover:bg-muted/30 disabled:cursor-not-allowed sm:px-6",
}

type OptionCardProps = {
  title: React.ReactNode
  /** Shown after the title, e.g. a `Badge` marking the saved option as "Active". */
  badge?: React.ReactNode
  description?: React.ReactNode
  /** Rows only: shown under the row, outside the control, so it can hold fields for that option. */
  details?: React.ReactNode
}

function OptionCardText({
  variant,
  title,
  badge,
  description,
  children,
}: Omit<OptionCardProps, "details"> & {
  variant: OptionCardVariant
  children?: React.ReactNode
}) {
  if (variant === "rows") {
    return (
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge}
        </span>
        {description && (
          <span className="mt-1 block max-w-[72ch] text-sm text-foreground-secondary">
            {description}
          </span>
        )}
        {children}
      </span>
    )
  }
  return (
    <span className="min-w-0">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px]">
        <span className="font-[570] text-foreground">{title}</span>
        {badge && <span className="flex h-lh items-center">{badge}</span>}
      </span>
      {description && (
        <span className="mt-0.5 block text-[12px] text-muted-foreground">
          {description}
        </span>
      )}
      {children}
    </span>
  )
}

function OptionCardRow({
  slot,
  details,
  children,
}: {
  slot: string
  details?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      data-slot={`${slot}-row`}
      className="transition-colors has-[>:disabled]:opacity-60 has-[>[data-state=checked]]:bg-primary/3"
    >
      {children}
      {details && (
        <div
          data-slot={`${slot}-details`}
          className="ps-12 pe-5 pb-4 sm:ps-[3.25rem] sm:pe-6"
        >
          {details}
        </div>
      )}
    </div>
  )
}

/** One choice among a few options, as cards or, with `variant="rows"`, as full-width divided rows. */
function RadioCardGroup({
  className,
  variant = "cards",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  /** `rows`: full-width rows divided by hairlines, for a flush card. */
  variant?: OptionCardVariant
}) {
  return (
    <OptionCardVariantContext.Provider value={variant}>
      <RadioGroupPrimitive.Root
        data-slot="radio-card-group"
        data-variant={variant}
        className={cn(groupVariants[variant], className)}
        {...props}
      />
    </OptionCardVariantContext.Provider>
  )
}

/** Prototype option card: an 18px radio, a title with an optional badge, and an optional description. */
function RadioCard({
  className,
  title,
  badge,
  description,
  details,
  children,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "title"> &
  OptionCardProps) {
  const variant = React.useContext(OptionCardVariantContext)
  const option = (
    <RadioGroupPrimitive.Item
      data-slot="radio-card"
      data-variant={variant}
      className={cn("group/radio-card", optionVariants[variant], className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative size-[18px] shrink-0 rounded-full border-[1.6px] border-placeholder group-data-[state=checked]/radio-card:border-primary",
          variant === "rows" ? "mt-0.5 bg-background dark:bg-input/30" : "mt-px"
        )}
      >
        <span className="absolute inset-[3.5px] hidden rounded-full bg-primary group-data-[state=checked]/radio-card:block" />
      </span>
      <OptionCardText
        variant={variant}
        title={title}
        badge={badge}
        description={description}
      >
        {children}
      </OptionCardText>
    </RadioGroupPrimitive.Item>
  )

  if (variant !== "rows") return option
  return (
    <OptionCardRow slot="radio-card" details={details}>
      {option}
    </OptionCardRow>
  )
}

/** Several choices among a few options, as cards or as divided rows with `variant="rows"`; label it with `aria-label`. */
function CheckboxCardGroup({
  className,
  variant = "cards",
  ...props
}: React.ComponentProps<"div"> & {
  /** `rows`: full-width rows divided by hairlines, for a flush card. */
  variant?: OptionCardVariant
}) {
  return (
    <OptionCardVariantContext.Provider value={variant}>
      <div
        role="group"
        data-slot="checkbox-card-group"
        data-variant={variant}
        className={cn(groupVariants[variant], className)}
        {...props}
      />
    </OptionCardVariantContext.Provider>
  )
}

/** A checkbox option shaped like `RadioCard`: a 16px checkbox, a title with an optional badge, and an optional description. */
function CheckboxCard({
  className,
  title,
  badge,
  description,
  details,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "title"> &
  OptionCardProps) {
  const variant = React.useContext(OptionCardVariantContext)
  const option = (
    <CheckboxPrimitive.Root
      data-slot="checkbox-card"
      data-variant={variant}
      className={cn("group/checkbox-card", optionVariants[variant], className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-input bg-background text-primary-foreground transition-colors group-data-[state=checked]/checkbox-card:border-primary group-data-[state=checked]/checkbox-card:bg-primary group-data-[state=indeterminate]/checkbox-card:border-primary group-data-[state=indeterminate]/checkbox-card:bg-primary dark:bg-input/30 [&>svg]:size-3.5"
      >
        <CheckIcon className="hidden group-data-[state=checked]/checkbox-card:block" />
        <MinusIcon className="hidden group-data-[state=indeterminate]/checkbox-card:block" />
      </span>
      <OptionCardText
        variant={variant}
        title={title}
        badge={badge}
        description={description}
      >
        {children}
      </OptionCardText>
    </CheckboxPrimitive.Root>
  )

  if (variant !== "rows") return option
  return (
    <OptionCardRow slot="checkbox-card" details={details}>
      {option}
    </OptionCardRow>
  )
}

export {
  RadioCardGroup,
  RadioCard,
  CheckboxCardGroup,
  CheckboxCard,
  type OptionCardVariant,
}
