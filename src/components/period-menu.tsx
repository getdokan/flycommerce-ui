"use client"

import * as React from "react"
import {
  format as formatDate,
  isSameDay,
  isSameYear,
  subMonths,
} from "date-fns"
import {
  FiCalendar as CalendarIcon,
  FiChevronDown as ChevronDownIcon,
} from "react-icons/fi"
import type { DateRange, Locale } from "react-day-picker"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

/** The value of "All time". */
const ALL_TIME = "all"
/** The value while a custom range is in force. */
const CUSTOM_RANGE = "custom"

type PeriodPreset = { value: string; label: string }

type PeriodRange = { from: Date; to: Date }

type PeriodMenuLabels = {
  /** The menu item that opens the calendar. */
  custom?: string
  apply?: string
  cancel?: string
  /** Under the calendar before a first day is picked. */
  pickStart?: string
  /** The trigger's accessible name: the filter, then the period. */
  name?: (label: string, period: string) => string
}

const DEFAULT_LABELS: Required<PeriodMenuLabels> = {
  custom: "Custom range",
  apply: "Apply",
  cancel: "Cancel",
  pickStart: "Pick the first day",
  name: (label, period) => `${label}: ${period}`,
}

type PeriodMenuProps = {
  /** The filter's name, e.g. "Date"; heads the menu and the trigger's accessible name. */
  label: string
  /** A preset's value, `"all"`, or `"custom"` while `range` is in force. */
  value: string
  /** A preset or "All time" was picked. */
  onValueChange: (value: string) => void
  presets: PeriodPreset[]
  /** Adds "All time" after the presets; leave it out for a list that always has a period. */
  allLabel?: string
  /** The custom range shown while `value` is `"custom"`. */
  range?: PeriodRange
  /** Adds "Custom range"; called on Apply with the picked days. Set `value` to `"custom"` in it. */
  onRangeChange?: (range: PeriodRange) => void
  /** The last day that can be picked, e.g. today for a list of past orders. */
  maxDate?: Date
  minDate?: Date
  /** Formats the custom range and translates the calendar. */
  locale?: Locale
  /** "Sep 1 – Sep 30"; the year shows when the range isn't in this year. */
  formatRange?: (range: PeriodRange) => string
  align?: "start" | "center" | "end"
  disabled?: boolean
  labels?: PeriodMenuLabels
  className?: string
}

function defaultFormatRange(range: PeriodRange, locale?: Locale) {
  const now = new Date()
  const withYear =
    !isSameYear(range.from, now) || !isSameYear(range.to, now) ? "PP" : "MMM d"
  const from = formatDate(range.from, withYear, { locale })
  if (isSameDay(range.from, range.to)) return from
  return `${from} – ${formatDate(range.to, withYear, { locale })}`
}

/**
 * A toolbar date filter: one button that reads the period, opening its presets, "All time" and "Custom range",
 * which picks the days on a calendar.
 */
function PeriodMenu({
  label,
  value,
  onValueChange,
  presets,
  allLabel,
  range,
  onRangeChange,
  maxDate,
  minDate,
  locale,
  formatRange,
  align = "end",
  disabled,
  labels: labelsProp,
  className,
}: PeriodMenuProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const isMobile = useIsMobile()
  const trigger = React.useRef<HTMLButtonElement>(null)
  const [picking, setPicking] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange | undefined>(range)
  // Fixed when the calendar opens, so it doesn't jump while days are picked.
  const [month, setMonth] = React.useState<Date>(() => new Date())
  // Set while the menu hands over to the calendar: the menu keeps focus off the trigger and opens the calendar as it closes.
  const handingOver = React.useRef(false)

  const format =
    formatRange ?? ((r: PeriodRange) => defaultFormatRange(r, locale))
  const span = range ? format(range) : undefined
  const current =
    value === CUSTOM_RANGE
      ? (span ?? labels.custom)
      : value === ALL_TIME && allLabel
        ? allLabel
        : (presets.find((preset) => preset.value === value)?.label ?? label)

  const openCalendar = () => {
    handingOver.current = true
    setDraft(range)
    const last = maxDate ?? new Date()
    setMonth(range?.from ?? (isMobile ? last : subMonths(last, 1)))
    // The calendar opens once the menu has closed (below); opened now, it reads the menu's click as one outside it.
  }

  const apply = () => {
    if (!draft?.from) return
    onRangeChange?.({ from: draft.from, to: draft.to ?? draft.from })
    setPicking(false)
  }

  const outOfBounds = [
    ...(maxDate ? [{ after: maxDate }] : []),
    ...(minDate ? [{ before: minDate }] : []),
  ]

  return (
    <Popover open={picking} onOpenChange={setPicking}>
      <DropdownMenu>
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <Button
              ref={trigger}
              variant="outline"
              disabled={disabled}
              aria-label={labels.name(label, current)}
              data-slot="period-menu"
              className={className}
            >
              <CalendarIcon data-icon="inline-start" />
              {current}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent
          align={align}
          className="w-56"
          onCloseAutoFocus={(event) => {
            if (!handingOver.current) return
            handingOver.current = false
            event.preventDefault()
            setPicking(true)
          }}
        >
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {presets.map((preset) => (
              <DropdownMenuRadioItem key={preset.value} value={preset.value}>
                {preset.label}
              </DropdownMenuRadioItem>
            ))}
            {allLabel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value={ALL_TIME}>
                  {allLabel}
                </DropdownMenuRadioItem>
              </>
            )}
          </DropdownMenuRadioGroup>
          {onRangeChange && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={openCalendar}
                data-active={value === CUSTOM_RANGE || undefined}
                className="data-active:font-semibold"
              >
                {labels.custom}…
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PopoverContent
        align={align}
        collisionPadding={16}
        aria-label={labels.custom}
        className="flex max-h-(--radix-popover-content-available-height) w-auto max-w-[calc(100vw-2rem)] flex-col overflow-y-auto p-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          trigger.current?.focus()
        }}
      >
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={isMobile ? 1 : 2}
          disabled={outOfBounds.length ? outOfBounds : undefined}
          startMonth={minDate}
          endMonth={maxDate}
          locale={locale}
          autoFocus
        />
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle px-3 py-2.5">
          <span
            className="me-auto text-[12.5px] text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {draft?.from
              ? format({ from: draft.from, to: draft.to ?? draft.from })
              : labels.pickStart}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPicking(false)}>
            {labels.cancel}
          </Button>
          <Button size="sm" disabled={!draft?.from} onClick={apply}>
            {labels.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export {
  PeriodMenu,
  ALL_TIME as PERIOD_ALL_TIME,
  CUSTOM_RANGE as PERIOD_CUSTOM_RANGE,
  type PeriodMenuProps,
  type PeriodPreset,
  type PeriodRange,
  type PeriodMenuLabels,
}
