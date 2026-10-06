"use client"

import * as React from "react"
import { cn } from "cn"
import { FiSearch as SearchIcon, FiX as XIcon } from "react-icons/fi"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** `"debounce"` searches after typing pauses; `"enter"` only on Enter, for lists that refetch or navigate on each search. */
  searchOn?: "debounce" | "enter"
  /** Fires on Enter, with `""` on clear or Esc, and after typing pauses unless `searchOn="enter"`. */
  onSearch?: (value: string) => void
  /** Fires when the clear button or Esc empties the field, after `onSearch("")`. */
  onClear?: () => void
  debounceMs?: number
  clearLabel?: string
  containerClassName?: string
}

function SearchInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  searchOn = "debounce",
  onSearch,
  onClear,
  debounceMs = 300,
  clearLabel = "Clear search",
  placeholder = "Search",
  className,
  containerClassName,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const [valueState, setValueState] = React.useState(defaultValue)
  const value = valueProp ?? valueState
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const onSearchRef = React.useRef(onSearch)

  React.useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const update = (next: string, immediate = false) => {
    if (valueProp === undefined) setValueState(next)
    onValueChange?.(next)
    clearTimeout(timer.current)
    if (immediate) onSearchRef.current?.(next)
    else if (searchOn === "debounce")
      timer.current = setTimeout(() => onSearchRef.current?.(next), debounceMs)
  }

  const clear = () => {
    update("", true)
    onClear?.()
  }

  return (
    <InputGroup data-slot="search-input" className={containerClassName}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        placeholder={placeholder}
        className={cn("[&::-webkit-search-cancel-button]:hidden", className)}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") update(value, true)
          if (event.key === "Escape" && value) clear()
          onKeyDown?.(event)
        }}
        {...props}
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={clearLabel}
            onClick={clear}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { SearchInput, type SearchInputProps }
