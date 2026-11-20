"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type MergeTag = {
  /** The tag's name without braces, e.g. "order_number", shown and inserted as `{{order_number}}`. A tag that already has braces, e.g. "{{order_number}}" or "{{#products}}…{{/products}}", is used as written. */
  tag: string
  /** What the chip shows and is named by, as written, when it isn't the tag: e.g. "{{#products}}…{{/products}}" for a block. An empty string counts as unset. */
  label?: string
  /** What the chip inserts, as written, when it isn't the tag: e.g. "{{#products}}\n{{/products}}" for a block. A function gets the list's `locale` and returns the text, for a block whose words depend on the language being edited. An empty string counts as unset. */
  insert?: string | ((locale: string) => string)
  /** What the tag stands for, shown on hover and focus. A chip with a description or sample renders a tooltip, which throws without a `TooltipProvider` above it. */
  description?: React.ReactNode
  /** What the tag turns into for a sample order, e.g. "#1043". */
  sample?: React.ReactNode
}

type MergeTagGroup = {
  label: React.ReactNode
  tags: readonly MergeTag[]
}

type MergeTagLabels = {
  /** The chip's accessible name; gets the tag as the chip shows it, e.g. "{{order_number}}". */
  insert?: (token: string) => string
  /** The tooltip's sample line. */
  example?: (sample: React.ReactNode) => React.ReactNode
  /** The list's accessible name, unless `aria-label` or `aria-labelledby` is set. */
  list?: string
}

const DEFAULT_LABELS: Required<MergeTagLabels> = {
  insert: (token) => `Insert ${token}`,
  example: (sample) => <>Example: {sample}</>,
  list: "Merge tags",
}

const tokenOf = (tag: string) => (tag.includes("{{") ? tag : `{{${tag}}}`)

const DEFAULT_LOCALE = "en"

const insertOf = (tag: MergeTag, locale: string) => {
  const insert =
    typeof tag.insert === "function" ? tag.insert(locale) : tag.insert
  return insert || tokenOf(tag.tag)
}

function shown(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false
  if (typeof node === "string") return node.trim() !== ""
  return true
}

type InsertHandler = (tag: MergeTag, token: string) => void

type MergeTagListProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The tags this template can use. Ignored when `groups` has any. */
  tags?: readonly MergeTag[]
  /** Tags under labelled headings, e.g. Order, Customer, Store. */
  groups?: readonly MergeTagGroup[]
  /** Called with the tag and its token (the tag's `insert`, or the tag in braces) on click, Enter or Space; insert the token at the editor's cursor. */
  onInsert: InsertHandler
  disabled?: boolean
  labels?: MergeTagLabels
  /** The language being edited, passed to an `insert` function. Defaults to "en". */
  locale?: string
}

/** The merge tags an email or message can use, as chips that insert at the editor's cursor. */
function MergeTagList({
  tags = [],
  groups,
  onInsert,
  disabled,
  labels,
  locale,
  className,
  ...props
}: MergeTagListProps) {
  const groupId = React.useId()
  const grouped = groups != null && groups.length > 0

  const chips = (list: readonly MergeTag[]) =>
    list.map((tag, index) => (
      <MergeTagChip
        key={`${index}:${tag.tag}`}
        tag={tag}
        onInsert={onInsert}
        disabled={disabled}
        labels={labels}
        locale={locale}
      />
    ))

  return (
    <div
      role="group"
      aria-label={
        props["aria-labelledby"]
          ? undefined
          : (labels?.list ?? DEFAULT_LABELS.list)
      }
      data-slot="merge-tag-list"
      className={cn(
        grouped ? "flex flex-col gap-3" : "flex flex-wrap gap-2",
        className
      )}
      {...props}
    >
      {grouped
        ? groups.map((group, index) => (
            <div
              key={typeof group.label === "string" ? group.label : index}
              role="group"
              aria-labelledby={`${groupId}-${index}`}
              data-slot="merge-tag-group"
              className="flex flex-col gap-1.5"
            >
              <span
                id={`${groupId}-${index}`}
                className="text-xs font-medium text-muted-foreground"
              >
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">{chips(group.tags)}</div>
            </div>
          ))
        : chips(tags)}
    </div>
  )
}

type MergeTagChipProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "variant" | "size" | "asChild" | "loading"
> & {
  tag: MergeTag
  /** Gets the tag and its token, e.g. "{{order_number}}" or the tag's `insert`, to insert at the cursor. */
  onInsert?: InsertHandler
  labels?: MergeTagLabels
  /** The language being edited, passed to the tag's `insert` function. Defaults to "en". */
  locale?: string
}

/** One merge tag as a chip: shows `{{tag}}`, explains it on hover or focus, and inserts it on click. A disabled chip still explains itself. A tag with a description or sample needs a `TooltipProvider` above it. */
function MergeTagChip({
  tag,
  onInsert,
  labels: labelsProp,
  locale = DEFAULT_LOCALE,
  disabled,
  className,
  onClick,
  onPointerDown,
  ref,
  ...props
}: MergeTagChipProps) {
  const insertLabel = labelsProp?.insert ?? DEFAULT_LABELS.insert
  const exampleLabel = labelsProp?.example ?? DEFAULT_LABELS.example
  const label = tag.label || tokenOf(tag.tag)
  const hasDescription = shown(tag.description)
  const hasSample = shown(tag.sample)
  const chipRef = React.useRef<HTMLButtonElement>(null)
  const setChipRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      chipRef.current = node
      if (typeof ref === "function") {
        const cleanup = ref(node)
        if (typeof cleanup !== "function") return
        return () => {
          chipRef.current = null
          cleanup()
        }
      }
      if (ref) ref.current = node
    },
    [ref]
  )

  const chip = (
    <Button
      {...props}
      ref={setChipRef}
      type="button"
      variant="outline"
      size="xs"
      data-slot="merge-tag-chip"
      dir="ltr"
      translate="no"
      title={hasDescription || hasSample ? undefined : label}
      aria-label={insertLabel(label)}
      aria-disabled={disabled || undefined}
      className={cn(
        "max-w-full font-mono aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:border-border aria-disabled:hover:shadow-none",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (disabled) event.preventDefault()
      }}
      onClick={(event) => {
        onClick?.(event)
        if (disabled) event.preventDefault()
        else if (!event.defaultPrevented) onInsert?.(tag, insertOf(tag, locale))
      }}
    >
      <span className="truncate">{label}</span>
    </Button>
  )

  if (!hasDescription && !hasSample) return chip

  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent
        className="flex-col items-start gap-0.5"
        onPointerDownOutside={(event) => {
          if (disabled && chipRef.current?.contains(event.target as Node))
            event.preventDefault()
        }}
      >
        {hasDescription && <span>{tag.description}</span>}
        {hasSample && (
          <span data-slot="merge-tag-sample">{exampleLabel(tag.sample)}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export {
  MergeTagChip,
  MergeTagList,
  type MergeTag,
  type MergeTagChipProps,
  type MergeTagGroup,
  type MergeTagLabels,
  type MergeTagListProps,
}
