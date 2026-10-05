"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type RowDrag = {
  ref: (node: HTMLElement | null) => void
  style: React.CSSProperties
  dragging: boolean
  handle: {
    attributes: Record<string, unknown>
    listeners: Record<string, unknown> | undefined
    bindHandle: (node: HTMLElement | null) => void
    disabled: boolean
  }
}

type SortableRowsProps = {
  ids: string[]
  disabled: boolean
  labels: {
    pickedUp: (label: string, position: number, total: number) => string
    movedTo: (label: string, position: number, total: number) => string
    droppedAt: (label: string, position: number, total: number) => string
    reorderCancelled: (label: string, position: number) => string
  }
  getLabel: (id: string) => string
  onMove: (from: number, to: number) => void
  renderRow: (index: number, drag: RowDrag) => React.ReactNode
}

function SortableRows({
  ids,
  disabled,
  labels,
  getLabel,
  onMove,
  renderRow,
}: SortableRowsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const label = (id: string | number) => getLabel(String(id))
  const position = (id: string | number) => ids.indexOf(String(id)) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      labels.pickedUp(label(active.id), position(active.id), ids.length),
    onDragOver: ({ active, over }) =>
      over
        ? labels.movedTo(label(active.id), position(over.id), ids.length)
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? labels.droppedAt(label(active.id), position(over.id), ids.length)
        : undefined,
    onDragCancel: ({ active }) =>
      labels.reorderCancelled(label(active.id), position(active.id)),
  }
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onMove(from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      // Announcer divs are invalid inside <tbody>; dnd-kit only renders them after mount.
      accessibility={{
        announcements,
        container: typeof document === "undefined" ? undefined : document.body,
      }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        {ids.map((id, index) => (
          <SortableRow key={id} id={id} index={index} renderRow={renderRow} />
        ))}
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  id,
  index,
  renderRow,
}: {
  id: string
  index: number
  renderRow: SortableRowsProps["renderRow"]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return renderRow(index, {
    ref: setNodeRef,
    style: { transform: CSS.Translate.toString(transform), transition },
    dragging: isDragging,
    handle: {
      attributes: attributes as unknown as Record<string, unknown>,
      listeners,
      bindHandle: setActivatorNodeRef,
      disabled: attributes["aria-disabled"] === true,
    },
  })
}

export { SortableRows as default, type RowDrag }
