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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  /** Read in the trigger's name when nothing is picked and there is no `allLabel`: "Payment: all". */
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

type FacetFilterBaseProps<T extends string> = {
  label: string
  /** An icon element before the label, e.g. `<Icon name="cash" />`. */
  icon?: React.ReactNode
  options: FacetOption<T>[]
  /** Heads the menu instead of `label`, e.g. "Uploaded" in a "Date" filter. */
  heading?: string
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

type FacetFilterMultipleProps<T extends string> = FacetFilterBaseProps<T> & {
  /** Any number of options, as checkbox items; the default. */
  mode?: "multiple"
  /** The picked values; ticks apply at once. */
  value: T[]
  onValueChange: (value: T[]) => void
  allLabel?: never
  allCount?: never
}

type FacetFilterSingleProps<T extends string> = FacetFilterBaseProps<T> & {
  /** One option at most, as radio items; a pick applies at once and closes the menu. */
  mode: "single"
  /** The picked value, or `null` for none. */
  value: T | null
  /** Called with `null` when the "all" row is picked. */
  onValueChange: (value: T | null) => void
  /** Adds a first row that empties the pick, e.g. "All types"; the trigger reads it while nothing is picked. */
  allLabel?: string
  /** The "all" row's count; it shows no count without one. */
  allCount?: number
}

type FacetFilterProps<T extends string> =
  FacetFilterMultipleProps<T> | FacetFilterSingleProps<T>

function FacetRow({
  label,
  media,
  count,
  showCount = true,
  format,
}: {
  label: string
  media?: React.ReactNode
  count?: number
  showCount?: boolean
  format: Intl.NumberFormat
}) {
  return (
    <span className="flex w-full min-w-0 items-center gap-2">
      {media && <span className="flex shrink-0">{media}</span>}
      <span className="truncate">{label}</span>
      {showCount && (
        <span
          className="ms-auto text-[12.5px] text-muted-foreground tabular-nums"
          aria-hidden={count === undefined ? true : undefined}
        >
          {count === undefined ? "—" : format.format(count)}
        </span>
      )}
    </span>
  )
}

/** A toolbar filter: tick any options, each with its count, applied at once, with Clear at the foot; `mode="single"` picks one from radio items. */
function FacetFilter<T extends string>(props: FacetFilterProps<T>) {
  const {
    label,
    icon,
    options,
    heading,
    onOpenChange,
    open,
    defaultOpen,
    align = "end",
    locale,
    disabled,
    labels: labelsProp,
    className,
  } = props
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const allLabel = props.mode === "single" ? props.allLabel : undefined
  const value =
    props.mode !== "single"
      ? props.value
      : props.value === null
        ? []
        : [props.value]
  // Radix needs a string for the "all" row's radio value; an id can't clash with an option's value.
  const none = React.useId()
  const picked = options.filter((option) => value.includes(option.value))
  const known = new Set(options.map((option) => option.value))
  // Picked values with no option (e.g. from the address, while the options load) are kept and counted, not dropped.
  const unknown = value.filter((item) => !known.has(item))
  const total = picked.length + unknown.length
  const summary =
    total === 0
      ? (allLabel ?? label)
      : total === 1 && picked.length === 1
        ? picked[0]!.label
        : labels.summary(label, total)
  const pickedLabels = picked.map((option) => option.label).join(", ")
  // The accessible name holds the visible text: "Payment: all", "Type: All types", "Payment: Paid", or "Payment, 2: Paid, Unpaid".
  const name =
    total === 0
      ? labels.name(label, allLabel ?? labels.all)
      : picked.length === 0
        ? summary
        : total === 1
          ? labels.name(label, pickedLabels)
          : labels.name(summary, pickedLabels)
  // Clear leaves picked options that can't be unticked here (disabled), and is offered only when it would change something.
  const kept = value.filter((item) =>
    options.some((option) => option.value === item && option.disabled)
  )
  const format = React.useMemo(() => new Intl.NumberFormat(locale), [locale])

  // The pick keeps the options' order, whichever order they were ticked in, then the values with no option.
  const toggled = (option: T, checked: boolean) => [
    ...options
      .filter((item) =>
        item.value === option ? checked : value.includes(item.value)
      )
      .map((item) => item.value),
    ...unknown,
  ]

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
          aria-label={name}
          data-slot="facet-filter"
          data-picked={total || undefined}
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
      <DropdownMenuContent align={align} className="w-auto max-w-80 min-w-56">
        <DropdownMenuLabel>{heading ?? label}</DropdownMenuLabel>
        {props.mode === "single" ? (
          <DropdownMenuRadioGroup
            value={props.value ?? none}
            onValueChange={(next) => {
              const nextValue = next === none ? null : (next as T)
              // Picking the row that is already picked changes nothing, so the app doesn't reset its page.
              if (nextValue !== props.value) props.onValueChange(nextValue)
            }}
          >
            {allLabel !== undefined && (
              <>
                <DropdownMenuRadioItem value={none}>
                  <FacetRow
                    label={allLabel}
                    count={props.allCount}
                    showCount={props.allCount !== undefined}
                    format={format}
                  />
                </DropdownMenuRadioItem>
                {options.length > 0 && <DropdownMenuSeparator />}
              </>
            )}
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <FacetRow
                  label={option.label}
                  media={option.media}
                  count={option.count}
                  format={format}
                />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        ) : (
          <>
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={value.includes(option.value)}
                disabled={option.disabled}
                // The menu stays open, so several options can be ticked in one go.
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) =>
                  props.onValueChange(toggled(option.value, checked))
                }
              >
                <FacetRow
                  label={option.label}
                  media={option.media}
                  count={option.count}
                  format={format}
                />
              </DropdownMenuCheckboxItem>
            ))}
            {kept.length < value.length && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => props.onValueChange(kept)}>
                  {labels.clear}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  FacetFilter,
  type FacetFilterProps,
  type FacetFilterMultipleProps,
  type FacetFilterSingleProps,
  type FacetOption,
  type FacetFilterLabels,
}
