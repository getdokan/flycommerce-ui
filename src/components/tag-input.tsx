"use client"

import * as React from "react"
import { cn } from "cn"
import { XIcon } from "lucide-react"

type TagInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Keys that commit the typed text as a tag, besides Enter. */
  separators?: string[]
  /** Return false to reject a tag, e.g. an invalid email. */
  validate?: (tag: string) => boolean
  allowDuplicates?: boolean
  maxTags?: number
  invalid?: boolean
  containerClassName?: string
  removeLabel?: (tag: string) => string
}

function TagInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  separators = [","],
  validate,
  allowDuplicates = false,
  maxTags,
  invalid,
  disabled,
  placeholder,
  className,
  containerClassName,
  removeLabel = (tag) => `Remove ${tag}`,
  onKeyDown,
  onBlur,
  onPaste,
  ...props
}: TagInputProps) {
  const [valueState, setValueState] = React.useState(defaultValue)
  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const tags = valueProp ?? valueState

  const setTags = (next: string[]) => {
    if (valueProp === undefined) setValueState(next)
    onValueChange?.(next)
  }

  const commit = (raw: string) => {
    const incoming = raw
      .split(new RegExp(`[${separators.map(escape).join("")}\\n]`))
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (incoming.length === 0) return
    const next = [...tags]
    for (const tag of incoming) {
      if (maxTags !== undefined && next.length >= maxTags) break
      if (!allowDuplicates && next.includes(tag)) continue
      if (validate && !validate(tag)) continue
      next.push(tag)
    }
    setTags(next)
    setDraft("")
  }

  const remove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
    inputRef.current?.focus()
  }

  const atLimit = maxTags !== undefined && tags.length >= maxTags

  return (
    <div
      data-slot="tag-input"
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-control border border-input bg-background px-2 py-1.5 text-sm transition-colors hover:border-placeholder has-[input:focus-visible]:border-primary aria-disabled:pointer-events-none aria-disabled:bg-page aria-invalid:border-destructive",
        containerClassName
      )}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex h-6 items-center gap-1 rounded-sm bg-page ps-2 pe-0.5 text-[12.5px] font-[560] text-foreground"
        >
          {tag}
          <button
            type="button"
            aria-label={removeLabel(tag)}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation()
              remove(index)
            }}
            className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-border hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3"
          >
            <XIcon aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        disabled={disabled || atLimit}
        placeholder={tags.length === 0 ? placeholder : undefined}
        className={cn(
          "min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-placeholder disabled:cursor-not-allowed",
          className
        )}
        onChange={(event) => {
          const next = event.target.value
          if (separators.some((sep) => next.endsWith(sep))) commit(next)
          else setDraft(next)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && draft.trim()) {
            event.preventDefault()
            commit(draft)
          } else if (event.key === "Backspace" && !draft && tags.length > 0) {
            remove(tags.length - 1)
          }
          onKeyDown?.(event)
        }}
        onBlur={(event) => {
          if (draft.trim()) commit(draft)
          onBlur?.(event)
        }}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text")
          if (/[\n,]/.test(text)) {
            event.preventDefault()
            commit(draft + text)
          }
          onPaste?.(event)
        }}
        {...props}
      />
    </div>
  )
}

function escape(char: string) {
  return char.replace(/[\\^$.*+?()[\]{}|-]/g, "\\$&")
}

export { TagInput, type TagInputProps }
