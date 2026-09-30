"use client"

import * as React from "react"
import { cn } from "cn"
import { SearchIcon, XIcon } from "lucide-react"

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
  /** Fires after typing pauses, and immediately on Enter or clear. */
  onSearch?: (value: string) => void
  debounceMs?: number
  clearLabel?: string
  containerClassName?: string
}

function SearchInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSearch,
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
    else
      timer.current = setTimeout(() => onSearchRef.current?.(next), debounceMs)
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
          if (event.key === "Escape" && value) update("", true)
          onKeyDown?.(event)
        }}
        {...props}
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={clearLabel}
            onClick={() => update("", true)}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { SearchInput, type SearchInputProps }
