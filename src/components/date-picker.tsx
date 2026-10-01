"use client"

import * as React from "react"
import { cn } from "cn"
import {
  endOfMonth,
  endOfYear,
  format as formatDate,
  isSameDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns"
import { FiCalendar as CalendarIcon } from "react-icons/fi"
import type { DateRange } from "react-day-picker"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: Date
  onValueChange: (value: Date | undefined) => void
  placeholder?: string
  /** date-fns format string for the trigger. */
  displayFormat?: string
  /** Adds a time input; the returned Date carries the chosen time. */
  withTime?: boolean
  timeLabel?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
  /** Disable days, e.g. `{ before: new Date() }`. */
  disabledDays?: React.ComponentProps<typeof Calendar>["disabled"]
}

function DatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  displayFormat,
  withTime = false,
  timeLabel = "Time",
  disabled,
  invalid,
  id,
  className,
  disabledDays,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const pattern =
    displayFormat ?? (withTime ? "MMM d, yyyy, h:mm a" : "MMM d, yyyy")
  const time = value ? formatDate(value, "HH:mm") : "09:00"

  const pickDay = (day: Date | undefined) => {
    if (!day) return onValueChange(undefined)
    const [hours, minutes] = time.split(":").map(Number)
    const next = new Date(day)
    if (withTime) next.setHours(hours, minutes, 0, 0)
    onValueChange(next)
    if (!withTime) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          data-empty={!value || undefined}
          className={cn(
            "w-full min-w-0 justify-start font-normal data-empty:text-placeholder",
            className
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          <span className="truncate">
            {value ? formatDate(value, pattern) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={pickDay}
          defaultMonth={value}
          disabled={disabledDays}
          autoFocus
        />
        {withTime && (
          <label className="flex items-center gap-3 border-t border-border-subtle px-3 py-2.5 text-[12.5px] font-[560]">
            {timeLabel}
            <Input
              type="time"
              value={time}
              disabled={!value}
              className="h-8 w-auto"
              onChange={(event) => {
                if (!value || !event.target.value) return
                const [hours, minutes] = event.target.value
                  .split(":")
                  .map(Number)
                const next = new Date(value)
                next.setHours(hours, minutes, 0, 0)
                onValueChange(next)
              }}
            />
          </label>
        )}
      </PopoverContent>
    </Popover>
  )
}

type DateRangePreset = {
  label: string
  range: () => DateRange
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
  {
    label: "Yesterday",
    range: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }),
  },
  {
    label: "Last 7 days",
    range: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 30 days",
    range: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "This month",
    range: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: "Last month",
    range: () => {
      const last = subMonths(new Date(), 1)
      return { from: startOfMonth(last), to: endOfMonth(last) }
    },
  },
  {
    label: "This year",
    range: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
  {
    label: "Last year",
    range: () => {
      const last = subMonths(startOfYear(new Date()), 1)
      return { from: startOfYear(last), to: endOfYear(last) }
    },
  },
]

type DateRangePickerProps = {
  value?: DateRange
  onValueChange: (value: DateRange | undefined) => void
  /** Pass `[]` to hide the preset list. */
  presets?: DateRangePreset[]
  placeholder?: string
  displayFormat?: string
  disabled?: boolean
  id?: string
  className?: string
  align?: "start" | "center" | "end"
}

function DateRangePicker({
  value,
  onValueChange,
  presets = DEFAULT_PRESETS,
  placeholder = "Pick a date range",
  displayFormat = "MMM d, yyyy",
  disabled,
  id,
  className,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const label = value?.from
    ? value.to && !isSameDay(value.from, value.to)
      ? `${formatDate(value.from, displayFormat)} – ${formatDate(value.to, displayFormat)}`
      : formatDate(value.from, displayFormat)
    : placeholder

  const activePreset = presets.find((preset) => {
    const range = preset.range()
    return (
      value?.from &&
      value.to &&
      range.from &&
      range.to &&
      isSameDay(range.from, value.from) &&
      isSameDay(range.to, value.to)
    )
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!value?.from || undefined}
          className={cn(
            "min-w-0 justify-start font-normal data-empty:text-placeholder",
            className
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          <span className="truncate">
            {activePreset && value?.from ? activePreset.label : label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex max-h-(--radix-popover-content-available-height) w-auto max-w-[calc(100vw-2rem)] flex-col overflow-y-auto p-0 sm:flex-row"
        align={align}
        collisionPadding={16}
      >
        {presets.length > 0 && (
          <div
            role="listbox"
            aria-label="Presets"
            className="flex gap-1 overflow-x-auto border-b border-border-subtle p-1.5 sm:w-40 sm:flex-col sm:border-e sm:border-b-0"
          >
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                role="option"
                aria-selected={preset === activePreset}
                onClick={() => {
                  onValueChange(preset.range())
                  setOpen(false)
                }}
                className="shrink-0 rounded-lg px-2.5 py-2 text-start text-[13.5px] font-[560] whitespace-nowrap hover:bg-page focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none aria-selected:bg-primary-subtle aria-selected:text-primary-strong"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
        <Calendar
          mode="range"
          selected={value}
          onSelect={onValueChange}
          defaultMonth={
            value?.from ?? (isMobile ? new Date() : subMonths(new Date(), 1))
          }
          numberOfMonths={isMobile ? 1 : 2}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export {
  DatePicker,
  DateRangePicker,
  DEFAULT_PRESETS as DATE_RANGE_PRESETS,
  type DatePickerProps,
  type DateRangePickerProps,
  type DateRangePreset,
}
export type { DateRange } from "react-day-picker"
