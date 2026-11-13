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
  /** The tag's name without braces, e.g. "order_number". */
  tag: string
  /** What the tag stands for, shown on hover and focus. */
  description?: React.ReactNode
  /** What the tag turns into for a sample order, e.g. "#1043". */
  sample?: React.ReactNode
}

type MergeTagGroup = {
  label: React.ReactNode
  tags: readonly MergeTag[]
}

type MergeTagLabels = {
  /** The chip's accessible name; gets the tag as written, e.g. "{{order_number}}". */
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

const tokenOf = (tag: string) => `{{${tag}}}`

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
  /** Called with the tag and its token on click, Enter or Space; insert the token at the editor's cursor. */
  onInsert: InsertHandler
  disabled?: boolean
  labels?: MergeTagLabels
}

/** The merge tags an email or message can use, as chips that insert at the editor's cursor. */
function MergeTagList({
  tags = [],
  groups,
  onInsert,
  disabled,
  labels,
  className,
  ...props
}: MergeTagListProps) {
  const groupId = React.useId()
  const grouped = groups != null && groups.length > 0

  const chips = (list: readonly MergeTag[]) =>
    list.map((tag) => (
      <MergeTagChip
        key={tag.tag}
        tag={tag}
        onInsert={onInsert}
        disabled={disabled}
        labels={labels}
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
  /** Gets the tag and its token as shown, e.g. "{{order_number}}", to insert at the cursor. */
  onInsert?: InsertHandler
  labels?: MergeTagLabels
}

/** One merge tag as a chip: shows `{{tag}}`, explains it on hover or focus, and inserts it on click. A disabled chip still explains itself. */
function MergeTagChip({
  tag,
  onInsert,
  labels: labelsProp,
  disabled,
  className,
  onClick,
  onPointerDown,
  ...props
}: MergeTagChipProps) {
  const insertLabel = labelsProp?.insert ?? DEFAULT_LABELS.insert
  const exampleLabel = labelsProp?.example ?? DEFAULT_LABELS.example
  const token = tokenOf(tag.tag)
  const hasDescription = shown(tag.description)
  const hasSample = shown(tag.sample)
  const chipRef = React.useRef<HTMLButtonElement>(null)

  const chip = (
    <Button
      {...props}
      ref={chipRef}
      type="button"
      variant="outline"
      size="xs"
      data-slot="merge-tag-chip"
      dir="ltr"
      translate="no"
      title={hasDescription || hasSample ? undefined : token}
      aria-label={insertLabel(token)}
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
        else if (!event.defaultPrevented) onInsert?.(tag, token)
      }}
    >
      <span className="truncate">{token}</span>
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
