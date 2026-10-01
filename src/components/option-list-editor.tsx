"use client"

import * as React from "react"
import { cn } from "cn"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  FiCheck as CheckIcon,
  FiEdit3 as PencilLineIcon,
  FiTrash2 as Trash2Icon,
  FiX as XIcon,
} from "react-icons/fi"
import { LuGripVertical as GripVerticalIcon } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type OptionListEditorLabels = {
  add?: string
  edit?: (value: string) => string
  remove?: (value: string) => string
  save?: string
  cancel?: string
  reorder?: (value: string) => string
  duplicate?: string
  pickedUp?: (value: string, position: number, total: number) => string
  movedTo?: (value: string, position: number, total: number) => string
  droppedAt?: (value: string, position: number, total: number) => string
  cancelled?: (value: string) => string
}

type OptionListEditorProps = {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  /** Return a message to reject a value, e.g. "Use a hex colour". */
  validate?: (value: string) => string | undefined
  maxItems?: number
  id?: string
  invalid?: boolean
  disabled?: boolean
  className?: string
  labels?: OptionListEditorLabels
}

const DEFAULT_LABELS: Required<OptionListEditorLabels> = {
  add: "Press Enter to add",
  edit: (value) => `Edit ${value}`,
  remove: (value) => `Remove ${value}`,
  save: "Save",
  cancel: "Cancel",
  reorder: (value) => `Reorder ${value}`,
  duplicate: "That value is already in the list",
  pickedUp: (value, position, total) =>
    `Picked up ${value}, position ${position} of ${total}.`,
  movedTo: (value, position, total) =>
    `${value} moved to position ${position} of ${total}.`,
  droppedAt: (value, position, total) =>
    `${value} dropped at position ${position} of ${total}.`,
  cancelled: (value) => `Reorder cancelled, ${value} returned.`,
}

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** Figma "Attributes Values Input": type + Enter to add, drag to order, edit or remove each value. */
function OptionListEditor({
  value,
  onValueChange,
  placeholder,
  validate,
  maxItems,
  id,
  invalid,
  disabled,
  className,
  labels: labelsProp,
}: OptionListEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [focusItem, setFocusItem] = React.useState<string>()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const errorId = React.useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const check = (next: string, except?: string) => {
    if (value.some((v) => v !== except && same(v, next)))
      return labels.duplicate
    return validate?.(next.trim())
  }

  const add = () => {
    const next = draft.trim()
    if (!next) return
    const problem = check(next)
    if (problem) {
      setError(problem)
      return
    }
    onValueChange([...value, next])
    setDraft("")
    setError(undefined)
  }

  const position = (item: string | number) => value.indexOf(String(item)) + 1
  const full = maxItems !== undefined && value.length >= maxItems

  return (
    <div
      data-slot="option-list-editor"
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <Input
        ref={inputRef}
        id={id}
        value={draft}
        disabled={disabled || full}
        placeholder={placeholder ?? labels.add}
        aria-invalid={invalid || Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          setDraft(event.target.value)
          setError(undefined)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault()
            add()
          }
        }}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          accessibility={{
            announcements: {
              onDragStart: ({ active }) =>
                labels.pickedUp(
                  String(active.id),
                  position(active.id),
                  value.length
                ),
              onDragOver: ({ active, over }) =>
                over
                  ? labels.movedTo(
                      String(active.id),
                      position(over.id),
                      value.length
                    )
                  : undefined,
              onDragEnd: ({ active, over }) =>
                over
                  ? labels.droppedAt(
                      String(active.id),
                      position(over.id),
                      value.length
                    )
                  : undefined,
              onDragCancel: ({ active }) => labels.cancelled(String(active.id)),
            },
            container:
              typeof document === "undefined" ? undefined : document.body,
          }}
          onDragEnd={({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return
            onValueChange(
              arrayMove(value, position(active.id) - 1, position(over.id) - 1)
            )
          }}
        >
          <SortableContext
            items={value}
            strategy={verticalListSortingStrategy}
            disabled={disabled}
          >
            <ul className="flex flex-col overflow-hidden rounded-lg border border-border">
              {value.map((item, index) => (
                <OptionRow
                  key={item}
                  item={item}
                  disabled={disabled}
                  labels={labels}
                  focusEdit={focusItem === item}
                  onFocused={() => setFocusItem(undefined)}
                  validate={(next) => check(next, item)}
                  onSave={(next) => {
                    // The row remounts under its new key; hand focus to it.
                    setFocusItem(next.trim())
                    onValueChange(
                      value.map((v, i) => (i === index ? next.trim() : v))
                    )
                  }}
                  onRemove={() => {
                    onValueChange(value.filter((_, i) => i !== index))
                    inputRef.current?.focus()
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function OptionRow({
  item,
  disabled,
  labels,
  focusEdit,
  onFocused,
  validate,
  onSave,
  onRemove,
}: {
  item: string
  disabled?: boolean
  focusEdit?: boolean
  onFocused: () => void
  labels: Required<OptionListEditorLabels>
  validate: (next: string) => string | undefined
  onSave: (next: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [text, setText] = React.useState(item)
  const [error, setError] = React.useState<string>()
  const editRef = React.useRef<HTMLButtonElement>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item, disabled: disabled || editing })

  React.useEffect(() => {
    if (!focusEdit) return
    editRef.current?.focus()
    onFocused()
  }, [focusEdit, onFocused])

  const wasEditing = React.useRef(false)
  React.useEffect(() => {
    if (wasEditing.current && !editing) editRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const stopEditing = () => {
    setEditing(false)
    setError(undefined)
  }

  const inputRef = React.useRef<HTMLInputElement>(null)
  // Dialogs catch Escape on document in capture phase; window capture runs first.
  React.useEffect(() => {
    if (!editing) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.target !== inputRef.current) return
      event.stopPropagation()
      event.preventDefault()
      setText(item)
      stopEditing()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [editing, item])

  const save = () => {
    const next = text.trim()
    if (!next || next === item) return stopEditing()
    const problem = validate(next)
    if (problem) return setError(problem)
    onSave(next)
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/option relative flex min-h-11 items-center gap-2 border-b border-border-subtle bg-background px-2 last:border-b-0",
        isDragging && "z-10 shadow-2"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={labels.reorder(item)}
        disabled={disabled || editing}
        className="inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground hover:bg-page hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </button>
      {editing ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1 py-1.5">
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              autoFocus
              value={text}
              aria-label={labels.edit(item)}
              aria-invalid={Boolean(error) || undefined}
              className="h-8"
              onChange={(event) => {
                setText(event.target.value)
                setError(undefined)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  save()
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={labels.save}
              onClick={save}
            >
              <CheckIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={labels.cancel}
              onClick={() => {
                setText(item)
                stopEditing()
              }}
            >
              <XIcon />
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-sm text-foreground-secondary">
            {item}
          </span>
          <Button
            ref={editRef}
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={labels.edit(item)}
            onClick={() => {
              setText(item)
              setEditing(true)
            }}
          >
            <PencilLineIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={labels.remove(item)}
            className="hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2Icon />
          </Button>
        </>
      )}
    </li>
  )
}

export {
  OptionListEditor,
  type OptionListEditorLabels,
  type OptionListEditorProps,
}
