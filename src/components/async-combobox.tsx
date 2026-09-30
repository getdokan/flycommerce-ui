"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Spinner } from "@/components/ui/spinner"

type AsyncComboboxProps<T> = {
  value: T | null
  onValueChange: (value: T | null) => void
  /** Called with the typed query after typing pauses; resolve with matches. */
  loadOptions: (query: string) => Promise<T[]>
  getOptionLabel: (option: T) => string
  getOptionValue: (option: T) => string
  /** Shown before the user types, e.g. recent or popular items. */
  defaultOptions?: T[]
  debounceMs?: number
  /** Queries shorter than this don't hit `loadOptions`. */
  minQueryLength?: number
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
  renderOption?: (option: T) => React.ReactNode
  loadingLabel?: React.ReactNode
  emptyLabel?: React.ReactNode
  errorLabel?: React.ReactNode
}

function AsyncCombobox<T>({
  value,
  onValueChange,
  loadOptions,
  getOptionLabel,
  getOptionValue,
  defaultOptions = [],
  debounceMs = 300,
  minQueryLength = 0,
  placeholder = "Search",
  disabled,
  invalid,
  id,
  className,
  renderOption,
  loadingLabel = "Searching…",
  emptyLabel = "No results",
  errorLabel = "Couldn't load results",
}: AsyncComboboxProps<T>) {
  const [items, setItems] = React.useState<T[]>(defaultOptions)
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">(
    "idle"
  )
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const requestId = React.useRef(0)
  const loadRef = React.useRef(loadOptions)

  React.useEffect(() => {
    loadRef.current = loadOptions
  }, [loadOptions])

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const search = (query: string) => {
    clearTimeout(timer.current)
    if (value && query === getOptionLabel(value)) return
    if (query.trim().length < minQueryLength) {
      setItems(defaultOptions)
      setStatus("idle")
      return
    }
    setStatus("loading")
    timer.current = setTimeout(async () => {
      const current = ++requestId.current
      try {
        const results = await loadRef.current(query.trim())
        // A slower, older request must not overwrite newer results.
        if (current !== requestId.current) return
        setItems(results)
        setStatus("idle")
      } catch {
        if (current === requestId.current) setStatus("error")
      }
    }, debounceMs)
  }

  // Keep the selected option in the list so Base UI can render its label.
  const listItems =
    value &&
    !items.some((item) => getOptionValue(item) === getOptionValue(value))
      ? [value, ...items]
      : items

  return (
    <Combobox
      items={listItems}
      value={value}
      onValueChange={(next) => onValueChange((next as T | null) ?? null)}
      onInputValueChange={search}
      filter={null}
      itemToStringLabel={(item) => getOptionLabel(item as T)}
      itemToStringValue={(item) => getOptionValue(item as T)}
      isItemEqualToValue={(a, b) =>
        getOptionValue(a as T) === getOptionValue(b as T)
      }
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={className}
        showClear
      />
      <ComboboxContent>
        {status === "loading" ? (
          <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
            <Spinner /> {loadingLabel}
          </div>
        ) : status === "error" ? (
          <div className="px-3 py-2.5 text-sm text-destructive">
            {errorLabel}
          </div>
        ) : (
          <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        )}
        <ComboboxList className={status === "idle" ? undefined : "hidden"}>
          {(item: T) => (
            <ComboboxItem key={getOptionValue(item)} value={item}>
              {renderOption ? renderOption(item) : getOptionLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { AsyncCombobox, type AsyncComboboxProps }
