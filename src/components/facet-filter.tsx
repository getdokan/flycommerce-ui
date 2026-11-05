"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiCheck as CheckIcon,
  FiChevronDown as ChevronDownIcon,
} from "react-icons/fi"

import { SearchInput } from "@/components/search-input"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  /** Read in the trigger's name when nothing is picked: "Payment: all". Single mode reads `allLabel` instead. */
  all?: string
  /** The trigger's text for more than one pick. */
  summary?: (label: string, count: number) => string
  /** The trigger's accessible name: the filter, then what is picked. */
  name?: (label: string, picked: string) => string
  /** The search field's name and placeholder, with `searchable`. */
  search?: string
  /** Shown when the search matches no option, with `searchable`. */
  noResults?: string
  /** The search field's clear button, with `searchable`. */
  clearSearch?: string
}

const DEFAULT_LABELS: Required<FacetFilterLabels> = {
  clear: "Clear",
  all: "all",
  summary: (label, count) => `${label}, ${count}`,
  name: (label, picked) => `${label}: ${picked}`,
  search: "Search",
  noResults: "No matches",
  clearSearch: "Clear search",
}

// Case and accents don't count, so "cafe" finds "Café Noir".
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
  /**
   * Adds a search field that filters the options by label, for a long list such as vendors.
   * The menu becomes a listbox the field drives, so focus stays in the field while arrows move through the options.
   */
  searchable?: boolean
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
  /** The first row, which empties the pick, e.g. "All types"; the trigger reads it while nothing is picked. */
  allLabel: string
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
    searchable = false,
    disabled,
    labels: labelsProp,
    className,
  } = props
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const allLabel = props.mode === "single" ? props.allLabel : undefined
  const known = new Set(options.map((option) => option.value))
  const value =
    props.mode !== "single"
      ? props.value
      : props.value === null
        ? []
        : [props.value]
  // Radix needs a string for the "all" row's radio value; an id can't clash with an option's value.
  const none = React.useId()
  const picked = options.filter((option) => value.includes(option.value))
  // Picks with no option (e.g. from the address, while the options load) are kept and counted, not dropped.
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

  const trigger = (
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
  )

  if (searchable) {
    return (
      <FacetSearch
        trigger={trigger}
        heading={heading ?? label}
        options={options}
        value={value}
        all={
          props.mode === "single"
            ? { label: props.allLabel, count: props.allCount }
            : undefined
        }
        onPick={(option) => {
          if (props.mode === "single") {
            if (option !== props.value) props.onValueChange(option)
          } else if (option !== null) {
            props.onValueChange(toggled(option, !value.includes(option)))
          }
        }}
        onClear={
          props.mode !== "single" && kept.length < value.length
            ? () => props.onValueChange(kept)
            : undefined
        }
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        align={align}
        labels={labels}
        format={format}
      />
    )
  }

  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-auto max-w-80 min-w-56">
        <DropdownMenuLabel>{heading ?? label}</DropdownMenuLabel>
        {props.mode === "single" ? (
          <DropdownMenuRadioGroup
            value={value[0] ?? none}
            onValueChange={(next) => {
              const nextValue = next === none ? null : (next as T)
              // Picking the row that is already picked changes nothing, so the app doesn't reset its page.
              if (nextValue !== props.value) props.onValueChange(nextValue)
            }}
          >
            <DropdownMenuRadioItem value={none}>
              <FacetRow
                label={props.allLabel}
                count={props.allCount}
                showCount={props.allCount !== undefined}
                format={format}
              />
            </DropdownMenuRadioItem>
            {options.length > 0 && <DropdownMenuSeparator />}
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

type FacetSearchRow<T extends string> = {
  value: T | null
  label: string
  count?: number
  media?: React.ReactNode
  disabled?: boolean
}

/** The searchable menu: a search field driving a listbox, so the options stay valid ARIA and focus never leaves the field. */
function FacetSearch<T extends string>({
  trigger,
  heading,
  options,
  value,
  all,
  onPick,
  onClear,
  open: openProp,
  defaultOpen,
  onOpenChange,
  align,
  labels,
  format,
}: {
  trigger: React.ReactElement
  heading: string
  options: FacetOption<T>[]
  value: T[]
  /** Single mode's "all" row, which picks `null`; multiple mode has none. */
  all?: { label: string; count?: number }
  /** Single mode: pick it and close. Multiple mode: tick or untick it and stay open. */
  onPick: (value: T | null) => void
  /** Multiple mode's Clear, when it would change something. */
  onClear?: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align: "start" | "center" | "end"
  labels: Required<FacetFilterLabels>
  format: Intl.NumberFormat
}) {
  const [openState, setOpenState] = React.useState(defaultOpen ?? false)
  const open = openProp ?? openState
  const [query, setQuery] = React.useState("")
  // The menu can grow (counts arriving) but never shrinks while the list filters.
  const [minWidth, setMinWidth] = React.useState<number>()
  const [content, setContent] = React.useState<HTMLDivElement | null>(null)
  const listId = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  const folded = React.useMemo(
    () => options.map((option) => fold(option.label)),
    [options]
  )
  const needle = fold(query.trim())
  const matches = needle
    ? options.filter((_, index) => folded[index]!.includes(needle))
    : options
  const allRow: FacetSearchRow<T>[] = all
    ? [{ value: null, label: all.label, count: all.count }]
    : []
  const rows: FacetSearchRow<T>[] = [...allRow, ...matches]
  const picked = (row: FacetSearchRow<T>) =>
    row.value === null ? value.length === 0 : value.includes(row.value)
  // Ids follow the option, not its row, so a new highlight after filtering is announced.
  const position = new Map(
    options.map((option, index) => [option.value, index])
  )
  const rowId = (row: FacetSearchRow<T>) =>
    row.value === null
      ? `${listId}-all`
      : `${listId}-option-${position.get(row.value)}`
  // The highlighted option, by value so it stays put when the options change; `undefined` means the first that can be picked.
  const startAt = () =>
    [...allRow, ...options].find((row) => !row.disabled && picked(row))?.value
  const [active, setActive] = React.useState<T | null | undefined>(() =>
    open ? startAt() : undefined
  )

  // Every way of opening starts over: the trigger, a controlled `open` or `defaultOpen`.
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setMinWidth(undefined)
      setActive(startAt())
    }
  }

  // The first row from `from` that can be picked, going `by`; -1 when there is none.
  const usable = (from: number, by: 1 | -1) => {
    for (let i = from; i >= 0 && i < rows.length; i += by) {
      if (!rows[i]!.disabled) return i
    }
    return -1
  }
  const found =
    active === undefined ? -1 : rows.findIndex((row) => row.value === active)
  // A highlight the search or the app took away starts over; a search starts on its first match and never on the "all" row,
  // so Enter after a typo changes nothing.
  const activeIndex =
    found >= 0 && !rows[found]!.disabled
      ? found
      : usable(needle ? allRow.length : 0, 1)
  const current = rows[activeIndex]

  // offsetWidth ignores the opening zoom, so the width is the real one; counts arriving can still widen it.
  React.useEffect(() => {
    if (!content) return
    const grow = () => {
      const width = content.offsetWidth
      if (width) setMinWidth((current) => Math.max(current ?? 0, width))
    }
    const observer = new ResizeObserver(grow)
    observer.observe(content)
    return () => observer.disconnect()
  }, [content])

  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }

  const highlight = (index: number) => {
    if (index >= 0) setActive(rows[index]!.value)
  }
  const move = (by: 1 | -1) =>
    highlight(
      activeIndex < 0
        ? usable(by > 0 ? 0 : rows.length - 1, by)
        : usable(activeIndex + by, by)
    )

  React.useEffect(() => {
    listRef.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, needle, open])

  const choose = (row: FacetSearchRow<T>) => {
    if (row.disabled) return
    onPick(row.value)
    if (all) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        // ArrowDown opens it, as it opens the other filter menus.
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        data-slot="facet-filter-content"
        aria-labelledby={`${listId}-heading`}
        className="max-h-(--radix-popover-content-available-height) w-auto max-w-80 min-w-56 gap-0 p-1"
        ref={setContent}
        style={minWidth ? { minWidth } : undefined}
        onEscapeKeyDown={(event) => {
          // Esc empties the search first (SearchInput does that), then closes the menu.
          if (query.trim()) event.preventDefault()
        }}
      >
        <div
          id={`${listId}-heading`}
          className="px-1.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {heading}
        </div>
        <SearchInput
          ref={searchRef}
          role="combobox"
          aria-expanded
          aria-controls={rows.length > 0 ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={current ? rowId(current) : undefined}
          aria-label={labels.search}
          placeholder={labels.search}
          clearLabel={labels.clearSearch}
          // The options set the menu's width, not the field's default 20 characters, so the clear button can't widen it.
          size={1}
          containerClassName="mb-1 shrink-0"
          value={query}
          onValueChange={(next) => {
            // SearchInput also calls this on Enter with the same text; that keeps the highlight.
            if (next === query) return
            setQuery(next)
            setActive(undefined)
          }}
          // Its clear button goes away once it has cleared, so focus comes back here.
          onClear={() => searchRef.current?.focus()}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              move(event.key === "ArrowDown" ? 1 : -1)
            } else if (event.key === "Home" && event.ctrlKey) {
              event.preventDefault()
              highlight(usable(0, 1))
            } else if (event.key === "End" && event.ctrlKey) {
              event.preventDefault()
              highlight(usable(rows.length - 1, -1))
            } else if (event.key === "Enter") {
              event.preventDefault()
              if (current) choose(current)
            }
          }}
        />
        {rows.length > 0 && (
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-heading`}
            aria-multiselectable={all ? undefined : true}
            className="min-h-0 overflow-y-auto"
          >
            {rows.map((row, index) => (
              <React.Fragment
                key={row.value === null ? "all" : `option-${row.value}`}
              >
                <div
                  id={rowId(row)}
                  role="option"
                  aria-selected={picked(row)}
                  aria-disabled={row.disabled || undefined}
                  data-active={index === activeIndex || undefined}
                  data-slot="facet-filter-option"
                  // Focus stays in the search field.
                  onMouseDown={(event) => event.preventDefault()}
                  onPointerMove={() => {
                    if (!row.disabled && index !== activeIndex) highlight(index)
                  }}
                  onClick={() => choose(row)}
                  className="relative flex cursor-default items-center gap-1.5 rounded-lg py-2 ps-2.5 pe-8 text-sm select-none aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-accent data-active:text-accent-foreground"
                >
                  <FacetRow
                    label={row.label}
                    media={row.media}
                    count={row.count}
                    showCount={row.value !== null || row.count !== undefined}
                    format={format}
                  />
                  {picked(row) && (
                    <span className="pointer-events-none absolute end-2 flex items-center justify-center">
                      <CheckIcon className="size-4 stroke-primary-ink" />
                    </span>
                  )}
                </div>
                {row.value === null && matches.length > 0 && (
                  <div
                    aria-hidden="true"
                    className="-mx-1 my-1 h-px bg-border"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div
          aria-live="polite"
          className={cn(
            matches.length === 0 &&
              options.length > 0 &&
              "px-2.5 py-2 text-sm text-muted-foreground"
          )}
        >
          {matches.length === 0 && options.length > 0 && labels.noResults}
        </div>
        {onClear && (
          <>
            <div aria-hidden="true" className="-mx-1 my-1 h-px bg-border" />
            <button
              type="button"
              // Focus stays in the search field, as Clear goes away once it has cleared.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onClear()
                searchRef.current?.focus()
              }}
              className="flex w-full cursor-default items-center rounded-lg px-2.5 py-2 text-start text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              {labels.clear}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
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
