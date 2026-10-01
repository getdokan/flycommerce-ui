"use client"

import * as React from "react"
import { cn } from "cn"
import {
  FiCheck as CheckIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiSearch as SearchIcon,
} from "react-icons/fi"
import { LuChevronsUpDown as ChevronsUpDownIcon } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type TreeSelectOption = {
  value: string
  label: string
  /** Shown as a small badge, e.g. the number of products. */
  count?: number
  children?: TreeSelectOption[]
  disabled?: boolean
}

type TreeSelectLabels = {
  search?: string
  back?: string
  open?: (label: string) => string
  cancel?: string
  confirm?: string
  noResults?: string
}

type TreeSelectProps = {
  options: TreeSelectOption[]
  value: string | null
  onValueChange: (value: string | null, path: TreeSelectOption[]) => void
  placeholder?: string
  /** Shown instead of the list when `options` is empty, e.g. an "Add Category" call to action. */
  empty?: React.ReactNode
  /** Apply on click instead of waiting for Confirm. */
  confirm?: boolean
  id?: string
  invalid?: boolean
  disabled?: boolean
  className?: string
  labels?: TreeSelectLabels
}

const DEFAULT_LABELS: Required<TreeSelectLabels> = {
  search: "Search",
  back: "Back",
  open: (label) => `Show items in ${label}`,
  cancel: "Cancel",
  confirm: "Confirm",
  noResults: "No results",
}

type Entry = { option: TreeSelectOption; path: TreeSelectOption[] }

function flatten(
  options: TreeSelectOption[],
  parents: TreeSelectOption[] = []
): Entry[] {
  return options.flatMap((option) => [
    { option, path: [...parents, option] },
    ...flatten(option.children ?? [], [...parents, option]),
  ])
}

/** Figma "Product Category": pick one node from a tree by drilling into levels, or search all of them. */
function TreeSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  empty,
  confirm = true,
  id,
  invalid,
  disabled,
  className,
  labels: labelsProp,
}: TreeSelectProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const all = React.useMemo(() => flatten(options), [options])
  const pathOf = React.useCallback(
    (v: string | null) =>
      all.find((entry) => entry.option.value === v)?.path ?? [],
    [all]
  )

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<string | null>(value)
  const [trail, setTrail] = React.useState<TreeSelectOption[]>([])
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = React.useId()

  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    listRef.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  const level = trail.at(-1)
  const q = query.trim().toLowerCase()
  const rows: Entry[] = q
    ? all.filter((entry) => entry.option.label.toLowerCase().includes(q))
    : (level?.children ?? options).map((option) => ({
        option,
        path: [...trail, option],
      }))

  const openAt = (next: boolean) => {
    if (next) {
      const path = pathOf(value)
      setDraft(value)
      // Open on the level that holds the current value.
      setTrail(path.slice(0, -1))
      setQuery("")
      setActive(0)
    }
    setOpen(next)
  }

  const commit = (v: string | null) => {
    onValueChange(v, pathOf(v))
    setOpen(false)
  }

  const choose = (entry: Entry) => {
    if (entry.option.disabled) return
    if (confirm) setDraft(entry.option.value)
    else commit(entry.option.value)
  }

  const drill = (entry: Entry) => {
    if (!entry.option.children?.length) return
    setTrail(entry.path)
    setQuery("")
    setActive(0)
  }

  const back = () => {
    setTrail((current) => current.slice(0, -1))
    setActive(0)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const entry = rows[active]
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, rows.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === "ArrowRight" && entry && !q) {
      if (entry.option.children?.length) {
        event.preventDefault()
        drill(entry)
      }
    } else if (event.key === "ArrowLeft" && trail.length > 0 && !query) {
      event.preventDefault()
      back()
    } else if (event.key === "Enter" && entry) {
      event.preventDefault()
      if (confirm && draft === entry.option.value) commit(draft)
      else choose(entry)
    }
  }

  const selectedPath = pathOf(value)

  return (
    <Popover open={open} onOpenChange={openAt}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          data-placeholder={selectedPath.length === 0 || undefined}
          className={cn(
            "flex h-10 w-full items-center gap-1.5 rounded-control border border-input bg-background ps-3 pe-2.5 text-start text-sm transition-colors outline-none hover:border-placeholder focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:border-primary aria-invalid:border-destructive data-placeholder:text-placeholder",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
            {selectedPath.length === 0
              ? placeholder
              : selectedPath.map((node, index) => (
                  <React.Fragment key={node.value}>
                    {index > 0 && (
                      <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        index < selectedPath.length - 1 &&
                          "text-muted-foreground"
                      )}
                    >
                      {node.label}
                    </span>
                  </React.Fragment>
                ))}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] min-w-72 gap-0 p-0"
        onOpenAutoFocus={(event) => {
          if (options.length === 0) event.preventDefault()
        }}
      >
        {options.length === 0 ? (
          <div className="p-4">{empty ?? labels.noResults}</div>
        ) : (
          <>
            <div className="flex flex-col gap-2 p-2">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  role="combobox"
                  aria-expanded
                  aria-controls={listId}
                  aria-activedescendant={
                    rows[active]
                      ? `${listId}-${rows[active].option.value}`
                      : undefined
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
              {level && !q && (
                <div className="flex items-center gap-3 rounded-lg bg-page p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={labels.back}
                    onClick={back}
                  >
                    <ChevronLeftIcon className="rtl:rotate-180" />
                  </Button>
                  <div className="min-w-0">
                    {trail.length > 1 && (
                      <div className="truncate text-xs text-muted-foreground">
                        {trail
                          .slice(0, -1)
                          .map((node) => node.label)
                          .join(" › ")}
                      </div>
                    )}
                    <div className="truncate text-sm font-semibold">
                      {level.label}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={level?.label ?? placeholder}
              className="max-h-72 min-h-0 overflow-y-auto border-t border-border-subtle p-1.5"
            >
              {rows.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {labels.noResults}
                </div>
              )}
              {rows.map((entry, index) => {
                const { option } = entry
                const selected = (confirm ? draft : value) === option.value
                const hasChildren = Boolean(option.children?.length)
                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-1"
                    onMouseEnter={() => setActive(index)}
                  >
                    <div
                      id={`${listId}-${option.value}`}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={option.disabled || undefined}
                      data-active={index === active || undefined}
                      onClick={() => choose(entry)}
                      className={cn(
                        "flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-active:bg-page",
                        selected && "bg-primary-subtle! text-primary-strong"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{option.label}</span>
                        {q && entry.path.length > 1 && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {entry.path
                              .slice(0, -1)
                              .map((node) => node.label)
                              .join(" › ")}
                          </span>
                        )}
                      </span>
                      {option.count !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[11px] leading-[18px] font-semibold tabular-nums",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {option.count}
                        </span>
                      )}
                      {selected && !hasChildren && (
                        <CheckIcon className="size-4 shrink-0 text-success" />
                      )}
                    </div>
                    {hasChildren && !q && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        tabIndex={-1}
                        aria-label={labels.open(option.label)}
                        onClick={() => drill(entry)}
                        className={cn(selected && "text-primary-ink")}
                      >
                        <ChevronRightIcon className="rtl:rotate-180" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            {confirm && (
              <div className="flex justify-end gap-2 border-t border-border-subtle p-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  {labels.cancel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={draft === value}
                  onClick={() => commit(draft)}
                >
                  {labels.confirm}
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export {
  TreeSelect,
  type TreeSelectLabels,
  type TreeSelectOption,
  type TreeSelectProps,
}
