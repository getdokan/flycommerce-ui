"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiCheck as CheckIcon,
  FiChevronDown as ChevronDownIcon,
  FiSearch as SearchIcon,
} from "react-icons/fi"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type RichSelectOption = {
  value: string
  label: string
  description?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  /** Extra text matched by search, e.g. synonyms. */
  keywords?: string
}

type RichSelectLabels = {
  search?: string
  create?: string
  noResults?: string
  selected?: (count: number) => string
}

type RichSelectBaseProps = {
  options: RichSelectOption[]
  placeholder?: string
  /** Adds a search box above the list. */
  searchable?: boolean
  /** Adds "Add New" beside the search box; receives the typed text. */
  onCreate?: (query: string) => void
  /** Rendered under the list inside the menu, e.g. per-field settings. */
  footer?: React.ReactNode
  id?: string
  invalid?: boolean
  disabled?: boolean
  className?: string
  labels?: RichSelectLabels
}

type RichSelectProps = RichSelectBaseProps &
  (
    | {
        multiple?: false
        value: string | null
        onValueChange: (value: string | null) => void
      }
    | {
        multiple: true
        value: string[]
        onValueChange: (value: string[]) => void
      }
  )

const DEFAULT_LABELS: Required<RichSelectLabels> = {
  search: "Search",
  create: "Add New",
  noResults: "No results",
  selected: (count) => `${count} selected`,
}

/** Figma "Attributes Type Input" / "Select Attributes": options with an icon and a second line. */
function RichSelect(props: RichSelectProps) {
  const {
    options,
    placeholder = "Select",
    searchable = false,
    onCreate,
    footer,
    id,
    invalid,
    disabled,
    className,
    labels: labelsProp,
  } = props
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const withSearch = searchable || Boolean(onCreate)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedValues = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : []
  const isSelected = (v: string) => selectedValues.includes(v)

  const q = query.trim().toLowerCase()
  const rows = q
    ? options.filter((option) =>
        `${option.label} ${option.keywords ?? ""}`.toLowerCase().includes(q)
      )
    : options

  React.useEffect(() => {
    listRef.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  const toggle = (option: RichSelectOption) => {
    if (option.disabled) return
    if (props.multiple) {
      props.onValueChange(
        isSelected(option.value)
          ? props.value.filter((v) => v !== option.value)
          : [...props.value, option.value]
      )
    } else {
      props.onValueChange(option.value)
      setOpen(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, rows.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter" || (event.key === " " && !withSearch)) {
      event.preventDefault()
      if (rows[active]) toggle(rows[active])
    }
  }

  const selectedOptions = options.filter((option) => isSelected(option.value))
  const single = !props.multiple ? selectedOptions[0] : undefined

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setQuery("")
          const index = options.findIndex((option) => isSelected(option.value))
          setActive(Math.max(index, 0))
        }
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          data-placeholder={selectedOptions.length === 0 || undefined}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-control border border-input bg-background ps-3 pe-2.5 text-start text-sm transition-colors outline-none hover:border-placeholder focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:border-primary aria-invalid:border-destructive data-placeholder:text-placeholder [&_svg:not([class*='size-'])]:size-4",
            className
          )}
        >
          {single?.icon && (
            <span className="flex shrink-0 text-muted-foreground">
              {single.icon}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">
            {selectedOptions.length === 0
              ? placeholder
              : props.multiple
                ? selectedOptions.length <= 2
                  ? selectedOptions.map((option) => option.label).join(", ")
                  : labels.selected(selectedOptions.length)
                : single?.label}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] min-w-64 gap-0 p-0"
        onOpenAutoFocus={(event) => {
          if (!withSearch) {
            event.preventDefault()
            listRef.current?.focus()
          }
        }}
      >
        {withSearch && (
          <div className="flex items-center gap-2 p-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-activedescendant={
                  rows[active] ? `${listId}-${rows[active].value}` : undefined
                }
                aria-label={labels.search}
                placeholder={labels.search}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
                className="h-9 w-full rounded-control bg-page ps-8 pe-3 text-sm outline-none placeholder:text-placeholder focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {onCreate && (
              <Button
                type="button"
                size="sm"
                className="h-9"
                onClick={() => {
                  onCreate(query.trim())
                  setOpen(false)
                }}
              >
                {labels.create}
              </Button>
            )}
          </div>
        )}
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-multiselectable={props.multiple || undefined}
          aria-activedescendant={
            !withSearch && rows[active]
              ? `${listId}-${rows[active].value}`
              : undefined
          }
          tabIndex={withSearch ? -1 : 0}
          onKeyDown={withSearch ? undefined : onKeyDown}
          className={cn(
            "max-h-80 min-h-0 overflow-y-auto p-1.5 outline-none",
            withSearch && "border-t border-border-subtle"
          )}
        >
          {rows.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {labels.noResults}
            </div>
          )}
          {rows.map((option, index) => {
            const selected = isSelected(option.value)
            return (
              <div
                key={option.value}
                id={`${listId}-${option.value}`}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled || undefined}
                data-active={index === active || undefined}
                onMouseEnter={() => setActive(index)}
                onClick={() => toggle(option)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-active:bg-page"
              >
                {option.icon && (
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
                      option.description &&
                        "size-9 rounded-lg border border-border bg-background"
                    )}
                  >
                    {option.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate",
                      option.description
                        ? "font-semibold text-foreground"
                        : "text-foreground-secondary"
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
                {props.multiple ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                      selected
                        ? "border-success bg-success text-primary-foreground"
                        : "border-placeholder"
                    )}
                  >
                    {selected && (
                      <CheckIcon className="size-3" strokeWidth={3} />
                    )}
                  </span>
                ) : (
                  selected && (
                    <CheckIcon className="size-4 shrink-0 text-success" />
                  )
                )}
              </div>
            )
          })}
        </div>
        {footer && (
          <div className="border-t border-border-subtle p-2">{footer}</div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export {
  RichSelect,
  type RichSelectLabels,
  type RichSelectOption,
  type RichSelectProps,
}
