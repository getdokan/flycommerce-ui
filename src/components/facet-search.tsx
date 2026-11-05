"use client"

import * as React from "react"
import { cn } from "cn"
import { FiCheck as CheckIcon } from "react-icons/fi"

import type { FacetFilterLabels, FacetOption } from "@/components/facet-filter"
import { SearchInput } from "@/components/search-input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fold } from "@/lib/fold"
import { useListboxNav } from "@/lib/use-listbox-nav"

function FacetRow({
  label,
  media,
  count,
  showCount = true,
  depth,
  format,
}: {
  label: string
  media?: React.ReactNode
  count?: number
  showCount?: boolean
  depth?: number
  format: Intl.NumberFormat
}) {
  const level =
    depth !== undefined && Number.isFinite(depth)
      ? Math.max(0, Math.floor(depth))
      : 0
  return (
    <span
      data-slot="facet-filter-row"
      className="flex w-full min-w-0 items-center gap-2"
      // The indent pads the whole row; the count's ms-auto keeps it at the end edge.
      style={
        level
          ? { paddingInlineStart: `calc(var(--spacing) * ${level * 3})` }
          : undefined
      }
    >
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

type FacetSearchProps<T extends string> = {
  trigger: React.ReactElement
  heading: string
  options: FacetOption<T>[]
  value: T[]
  /** Single mode's "all" row, which picks `null`; multiple mode has none. */
  all?: { label: string; count?: number }
  /** Single mode: pick it. Multiple mode: tick or untick it. */
  onPick: (value: T | null) => void
  closeOnPick: boolean
  /** Multiple mode's Clear, when it would change something. */
  onClear?: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align: "start" | "center" | "end"
  labels: Required<FacetFilterLabels>
  format: Intl.NumberFormat
}

/** The searchable menu: a search field driving a listbox, so the options stay valid ARIA and focus never leaves the field. */
function FacetSearch<T extends string>({
  trigger,
  open: openProp,
  defaultOpen,
  onOpenChange,
  align,
  onPick,
  closeOnPick,
  ...panel
}: FacetSearchProps<T>) {
  const [openState, setOpenState] = React.useState(defaultOpen ?? false)
  const open = openProp ?? openState
  const headingId = React.useId()
  const searchRef = React.useRef<HTMLInputElement>(null)

  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
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
        aria-labelledby={headingId}
        className="max-h-(--radix-popover-content-available-height) w-72 gap-0 p-1"
        onEscapeKeyDown={(event) => {
          // Esc empties the search first (SearchInput does that), then closes the menu.
          if (searchRef.current?.value.trim()) event.preventDefault()
        }}
      >
        {/* Mounts with each opening, so every way of opening starts over. */}
        <FacetSearchPanel
          {...panel}
          headingId={headingId}
          searchRef={searchRef}
          multiple={!closeOnPick}
          onChoose={(value) => {
            onPick(value)
            if (closeOnPick) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

type FacetSearchRow<T extends string> = {
  /** The row's identity, which any option value can hold. */
  key: string
  /** The element's id, which follows the option, so a new highlight after filtering is announced. */
  id: string
  value: T | null
  label: string
  count?: number
  media?: React.ReactNode
  depth?: number
  disabled?: boolean
}

function FacetSearchPanel<T extends string>({
  heading,
  headingId,
  options,
  value,
  all,
  onChoose,
  multiple,
  onClear,
  searchRef,
  labels,
  format,
}: Pick<
  FacetSearchProps<T>,
  "heading" | "options" | "value" | "all" | "onClear" | "labels" | "format"
> & {
  headingId: string
  onChoose: (value: T | null) => void
  multiple: boolean
  searchRef: React.RefObject<HTMLInputElement | null>
}) {
  const [query, setQuery] = React.useState("")
  const listId = React.useId()

  const folded = React.useMemo(
    () => options.map((option) => fold(option.label)),
    [options]
  )
  const allRow: FacetSearchRow<T>[] = all
    ? [
        {
          key: "all",
          id: `${listId}-all`,
          value: null,
          label: all.label,
          count: all.count,
        },
      ]
    : []
  const optionRows: FacetSearchRow<T>[] = options.map((option, index) => ({
    ...option,
    key: `option-${option.value}`,
    id: `${listId}-option-${index}`,
  }))
  const needle = fold(query.trim())
  const matches = needle
    ? optionRows.filter((_, index) => folded[index]!.includes(needle))
    : optionRows
  const rows = [...allRow, ...matches]
  const noMatch = matches.length === 0 && options.length > 0

  const picked = (row: FacetSearchRow<T>) =>
    row.value === null ? value.length === 0 : value.includes(row.value)
  const pickedKey = () =>
    [...allRow, ...optionRows].find((row) => !row.disabled && picked(row))?.key

  const choose = (row: FacetSearchRow<T>) => {
    if (!row.disabled) onChoose(row.value)
  }

  const { activeIndex, current, setList, highlight, setActiveKey, onKeyDown } =
    useListboxNav({
      rows,
      getKey: (row) => row.key,
      onChoose: choose,
      initialKey: pickedKey(),
      // A search starts on its first match and never on the "all" row, so Enter after a typo changes nothing.
      firstIndex: needle ? allRow.length : 0,
    })

  return (
    <>
      <div
        id={headingId}
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
        aria-activedescendant={current?.id}
        aria-label={labels.search}
        placeholder={labels.search}
        clearLabel={labels.clearSearch}
        containerClassName="mb-1 shrink-0"
        value={query}
        onValueChange={(next) => {
          // SearchInput also calls this on Enter with the same text; that keeps the highlight.
          if (next === query) return
          setQuery(next)
          setActiveKey(next.trim() ? undefined : pickedKey())
        }}
        // Its clear button goes away once it has cleared, so focus comes back here.
        onClear={() => searchRef.current?.focus()}
        onKeyDown={onKeyDown}
      />
      {rows.length > 0 && (
        <div
          ref={setList}
          id={listId}
          role="listbox"
          aria-labelledby={headingId}
          aria-multiselectable={multiple || undefined}
          // A height of its own from the first render, so the pick can be scrolled to before the popover is placed.
          className="max-h-80 min-h-0 overflow-y-auto"
        >
          {rows.map((row, index) => (
            <React.Fragment key={row.key}>
              <div
                id={row.id}
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
                  depth={row.depth}
                  format={format}
                />
                {picked(row) && (
                  <span className="pointer-events-none absolute end-2 flex items-center justify-center">
                    <CheckIcon className="size-4 stroke-primary-ink" />
                  </span>
                )}
              </div>
              {row.value === null && matches.length > 0 && (
                <div aria-hidden="true" className="-mx-1 my-1 h-px bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div
        aria-live="polite"
        className={cn(noMatch && "px-2.5 py-2 text-sm text-muted-foreground")}
      >
        {noMatch && labels.noResults}
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
    </>
  )
}

export { FacetRow, FacetSearch }
