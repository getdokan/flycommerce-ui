"use client"

import * as React from "react"
import { FiChevronDown as ChevronDownIcon } from "react-icons/fi"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FacetOption<T extends string = string> = {
  value: T
  label: string
  /** How many rows match; shows "—" until it is known. */
  count?: number
  /** Before the label, e.g. an `Avatar` for a vendor. */
  media?: React.ReactNode
  disabled?: boolean
}

type FacetFilterLabels = {
  /** The item at the foot that empties the pick. */
  clear?: string
  /** Read in the trigger's name when nothing is picked: "Payment: all". */
  all?: string
  /** The trigger's text for more than one pick. */
  summary?: (label: string, count: number) => string
  /** The trigger's accessible name: the filter, then what is picked. */
  name?: (label: string, picked: string) => string
}

const DEFAULT_LABELS: Required<FacetFilterLabels> = {
  clear: "Clear",
  all: "all",
  summary: (label, count) => `${label}, ${count}`,
  name: (label, picked) => `${label}: ${picked}`,
}

type FacetFilterProps<T extends string> = {
  label: string
  /** An icon element before the label, e.g. `<Icon name="cash" />`. */
  icon?: React.ReactNode
  options: FacetOption<T>[]
  /** The picked values; ticks apply at once. */
  value: T[]
  onValueChange: (value: T[]) => void
  /** The menu opened or closed; fetch the counts while it is open. */
  onOpenChange?: (open: boolean) => void
  open?: boolean
  defaultOpen?: boolean
  align?: "start" | "center" | "end"
  /** Formats the counts; the browser's locale by default. */
  locale?: string
  disabled?: boolean
  labels?: FacetFilterLabels
  className?: string
}

/** A toolbar filter: tick any options, each with its count, applied at once, with Clear at the foot. */
function FacetFilter<T extends string>({
  label,
  icon,
  options,
  value,
  onValueChange,
  onOpenChange,
  open,
  defaultOpen,
  align = "end",
  locale,
  disabled,
  labels: labelsProp,
  className,
}: FacetFilterProps<T>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const picked = options.filter((option) => value.includes(option.value))
  const summary =
    picked.length === 0
      ? label
      : picked.length === 1
        ? picked[0]!.label
        : labels.summary(label, picked.length)
  const announced = picked.length
    ? picked.map((option) => option.label).join(", ")
    : labels.all
  const format = React.useMemo(() => new Intl.NumberFormat(locale), [locale])

  // The pick keeps the options' order, whichever order they were ticked in.
  const toggle = (option: T, checked: boolean) =>
    onValueChange(
      options
        .filter((item) =>
          item.value === option ? checked : value.includes(item.value)
        )
        .map((item) => item.value)
    )

  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-label={labels.name(label, announced)}
          data-slot="facet-filter"
          data-picked={picked.length || undefined}
          className={className}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(
                icon as React.ReactElement<{ "data-icon"?: string }>,
                { "data-icon": "inline-start" }
              )
            : icon}
          {summary}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            disabled={option.disabled}
            // The menu stays open, so several options can be ticked in one go.
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => toggle(option.value, checked)}
          >
            <span className="flex w-full min-w-0 items-center gap-2">
              {option.media && (
                <span className="flex shrink-0">{option.media}</span>
              )}
              <span className="truncate">{option.label}</span>
              <span
                className="ms-auto text-[12.5px] text-muted-foreground tabular-nums"
                aria-hidden={option.count === undefined ? true : undefined}
              >
                {option.count === undefined ? "—" : format.format(option.count)}
              </span>
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        {picked.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onValueChange([])}>
              {labels.clear}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  FacetFilter,
  type FacetFilterProps,
  type FacetOption,
  type FacetFilterLabels,
}
