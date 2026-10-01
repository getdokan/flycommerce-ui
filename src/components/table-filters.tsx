"use client"

import * as React from "react"
import { cn } from "cn"
import { format as formatDate } from "date-fns"
import {
  FiSliders as SlidersHorizontalIcon,
  FiX as XIcon,
} from "react-icons/fi"

import { DateRangePicker, type DateRange } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

type FilterOption = { value: string; label: React.ReactNode }

type FilterField =
  | { key: string; label: string; type: "select"; options: FilterOption[] }
  | { key: string; label: string; type: "multi"; options: FilterOption[] }
  | {
      key: string
      label: string
      type: "range"
      /** Shown inside both inputs, e.g. "$". */
      prefix?: string
      min?: number
      max?: number
    }
  | { key: string; label: string; type: "date-range" }
  | { key: string; label: string; type: "boolean"; description?: string }

type NumberRange = { min?: number; max?: number }

/** Keyed by field key. select → string, multi → string[], range → NumberRange, date-range → DateRange, boolean → true. */
type FilterValues = Record<string, unknown>

type FilterLabels = {
  trigger?: string
  title?: string
  description?: string
  apply?: string
  reset?: string
  clearAll?: string
  min?: string
  max?: string
  any?: string
  remove?: (label: string) => string
}

const ANY = "__any__"

const DEFAULT_LABELS: Required<FilterLabels> = {
  trigger: "Filters",
  title: "Filters",
  description: "Narrow the list. Nothing changes until you apply.",
  apply: "Apply filters",
  reset: "Reset",
  clearAll: "Clear all",
  min: "Min",
  max: "Max",
  any: "Any",
  remove: (label) => `Remove ${label} filter`,
}

function isApplied(value: unknown) {
  if (value === undefined || value === null || value === "" || value === false)
    return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "object") {
    const v = value as NumberRange & DateRange
    return v.min !== undefined || v.max !== undefined || Boolean(v.from)
  }
  return true
}

function countApplied(fields: FilterField[], values: FilterValues) {
  return fields.filter((field) => isApplied(values[field.key])).length
}

type TableFiltersProps = {
  fields: FilterField[]
  value: FilterValues
  onValueChange: (value: FilterValues) => void
  labels?: FilterLabels
  /** Trigger style; "icon" matches the Figma toolbar button. */
  triggerVariant?: "icon" | "button"
  className?: string
}

/** Filter icon button that opens a right-side sheet; changes apply together on "Apply". */
function TableFilters({
  fields,
  value,
  onValueChange,
  labels: labelsProp,
  triggerVariant = "icon",
  className,
}: TableFiltersProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<FilterValues>(value)
  const applied = countApplied(fields, value)

  const setField = (key: string, next: unknown) =>
    setDraft((current) => ({ ...current, [key]: next }))

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value)
        setOpen(next)
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={triggerVariant === "icon" ? "icon-sm" : "sm"}
          aria-label={triggerVariant === "icon" ? labels.trigger : undefined}
          className={cn("relative", className)}
        >
          <SlidersHorizontalIcon />
          {triggerVariant === "button" && labels.trigger}
          {applied > 0 && (
            <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
              {applied}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]"
      >
        <SheetHeader>
          <SheetTitle>{labels.title}</SheetTitle>
          <SheetDescription>{labels.description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {fields.map((field) => (
            <FilterSection
              key={field.key}
              field={field}
              value={draft[field.key]}
              labels={labels}
              onChange={(next) => setField(field.key, next)}
            />
          ))}
        </div>
        <SheetFooter>
          <Button variant="ghost" onClick={() => setDraft({})}>
            {labels.reset}
          </Button>
          <Button
            onClick={() => {
              onValueChange(
                Object.fromEntries(
                  Object.entries(draft).filter(([, v]) => isApplied(v))
                )
              )
              setOpen(false)
            }}
          >
            {labels.apply}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterSection({
  field,
  value,
  labels,
  onChange,
}: {
  field: FilterField
  value: unknown
  labels: Required<FilterLabels>
  onChange: (value: unknown) => void
}) {
  const id = React.useId()

  return (
    <fieldset className="border-b border-border-subtle px-5 py-4 last:border-b-0">
      <legend className="float-start mb-3 w-full text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase">
        {field.label}
      </legend>

      {field.type === "select" && (
        <RadioGroup
          value={(value as string | undefined) ?? ANY}
          onValueChange={(next) => onChange(next === ANY ? undefined : next)}
          className="clear-both gap-2.5"
        >
          <label className="flex items-center gap-2.5 text-sm">
            <RadioGroupItem value={ANY} /> {labels.any}
          </label>
          {field.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 text-sm"
            >
              <RadioGroupItem value={option.value} /> {option.label}
            </label>
          ))}
        </RadioGroup>
      )}

      {field.type === "multi" && (
        <div className="clear-both flex flex-col gap-2.5">
          {field.options.map((option) => {
            const selected = (value as string[] | undefined) ?? []
            const checked = selected.includes(option.value)
            return (
              <label
                key={option.value}
                className="flex items-center gap-2.5 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) =>
                    onChange(
                      next
                        ? [...selected, option.value]
                        : selected.filter((v) => v !== option.value)
                    )
                  }
                />
                {option.label}
              </label>
            )
          })}
        </div>
      )}

      {field.type === "range" && (
        <div className="clear-both grid grid-cols-2 gap-3">
          {(["min", "max"] as const).map((bound) => {
            const range = (value as NumberRange | undefined) ?? {}
            return (
              <div key={bound} className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`${id}-${bound}`}
                  className="text-[12.5px] font-[560]"
                >
                  {labels[bound]}
                </Label>
                <div className="relative">
                  {field.prefix && (
                    <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {field.prefix}
                    </span>
                  )}
                  <Input
                    id={`${id}-${bound}`}
                    type="number"
                    inputMode="decimal"
                    min={field.min}
                    max={field.max}
                    value={range[bound] ?? ""}
                    className={cn(field.prefix && "ps-7")}
                    onChange={(event) => {
                      const raw = event.target.value
                      onChange({
                        ...range,
                        [bound]: raw === "" ? undefined : Number(raw),
                      })
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {field.type === "date-range" && (
        <div className="clear-both">
          <DateRangePicker
            className="w-full"
            align="end"
            value={value as DateRange | undefined}
            onValueChange={onChange}
          />
        </div>
      )}

      {field.type === "boolean" && (
        <label className="clear-both flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{field.description}</span>
          <Switch
            checked={value === true}
            onCheckedChange={(next) => onChange(next || undefined)}
          />
        </label>
      )}
    </fieldset>
  )
}

function describe(field: FilterField, value: unknown): React.ReactNode {
  switch (field.type) {
    case "select":
      return (
        field.options.find((o) => o.value === value)?.label ?? String(value)
      )
    case "multi": {
      const labels = (value as string[]).map(
        (v) => field.options.find((o) => o.value === v)?.label ?? v
      )
      return labels.length > 2
        ? `${labels.length} selected`
        : labels.map((l, i) => (
            <React.Fragment key={i}>
              {i > 0 && ", "}
              {l}
            </React.Fragment>
          ))
    }
    case "range": {
      const { min, max } = value as NumberRange
      const p = field.prefix ?? ""
      if (min !== undefined && max !== undefined)
        return `${p}${min} – ${p}${max}`
      return min !== undefined ? `≥ ${p}${min}` : `≤ ${p}${max}`
    }
    case "date-range": {
      const { from, to } = value as DateRange
      if (!from) return ""
      return to
        ? `${formatDate(from, "MMM d")} – ${formatDate(to, "MMM d")}`
        : formatDate(from, "MMM d")
    }
    case "boolean":
      return field.description ?? "On"
  }
}

type ActiveFiltersProps = {
  fields: FilterField[]
  value: FilterValues
  onValueChange: (value: FilterValues) => void
  labels?: FilterLabels
  className?: string
}

/** Applied filters as removable chips, so it's clear why rows are hidden. Renders nothing when none apply. */
function ActiveFilters({
  fields,
  value,
  onValueChange,
  labels: labelsProp,
  className,
}: ActiveFiltersProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const applied = fields.filter((field) => isApplied(value[field.key]))
  if (applied.length === 0) return null

  return (
    <div
      data-slot="active-filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {applied.map((field) => (
        <span
          key={field.key}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/35 bg-primary-subtle-2 ps-3 pe-1 text-[12.5px]"
        >
          <span className="text-muted-foreground">{field.label}</span>
          <b className="font-semibold text-primary-strong">
            {describe(field, value[field.key])}
          </b>
          <button
            type="button"
            aria-label={labels.remove(field.label)}
            onClick={() => {
              const next = { ...value }
              delete next[field.key]
              onValueChange(next)
            }}
            className="inline-flex size-6 items-center justify-center rounded-md text-primary-ink hover:bg-primary-subtle focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3.5"
          >
            <XIcon aria-hidden="true" />
          </button>
        </span>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onValueChange({})}>
        {labels.clearAll}
      </Button>
    </div>
  )
}

export {
  TableFilters,
  ActiveFilters,
  type ActiveFiltersProps,
  type FilterField,
  type FilterLabels,
  type FilterOption,
  type FilterValues,
  type NumberRange,
  type TableFiltersProps,
}
