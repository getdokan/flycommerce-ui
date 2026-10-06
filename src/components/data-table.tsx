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
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import {
  FiArrowDown as ArrowDownIcon,
  FiArrowUp as ArrowUpIcon,
  FiChevronDown as ChevronDownIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiInbox as InboxIcon,
  FiMoreHorizontal as MoreHorizontalIcon,
  FiAlertTriangle as TriangleAlertIcon,
} from "react-icons/fi"
import {
  LuChevronsUpDown as ChevronsUpDownIcon,
  LuGripVertical as GripVerticalIcon,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "start" | "center" | "end"
    headerClassName?: string
    cellClassName?: string
  }
}

type OffsetPagination = {
  mode?: "offset"
  /** 1-based. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  /** Numbered pages between Previous and Next; hidden while the pagination is under 28rem wide. */
  showPageNumbers?: boolean
  /** Pages either side of the current one; the first and last always show. Default 1. */
  siblingCount?: number
  /** Renders page controls as links: a plain click calls `onPageChange`, a modified click opens the URL. */
  getPageHref?: (page: number) => string
}

type CursorPagination = {
  mode: "cursor"
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

type DataTablePaginationProps = OffsetPagination | CursorPagination

type DataTableLabels = {
  /** Name of the pagination landmark (`<nav aria-label>`). */
  pagination?: string
  previous?: string
  next?: string
  rowsPerPage?: string
  page?: (page: number) => string
  morePages?: string
  selectAll?: string
  selectRow?: string
  clearSelection?: string
  expandRow?: string
  collapseRow?: string
  reorder?: string
  dragHandle?: (index: number) => string
  pickedUp?: (label: string, position: number, total: number) => string
  movedTo?: (label: string, position: number, total: number) => string
  droppedAt?: (label: string, position: number, total: number) => string
  reorderCancelled?: (label: string, position: number) => string
  selected?: (count: number) => React.ReactNode
  showing?: (from: number, to: number, total: number) => React.ReactNode
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  errorTitle?: React.ReactNode
  /** Announced while `loading` or `refreshing`, and names the refresh progress bar; the table is also marked `aria-busy`. */
  loading?: string
}

const DEFAULT_LABELS: Required<DataTableLabels> = {
  pagination: "Pagination",
  previous: "Previous",
  next: "Next",
  rowsPerPage: "Rows per page",
  page: (page) => `Page ${page}`,
  morePages: "More pages",
  selectAll: "Select all rows",
  selectRow: "Select row",
  clearSelection: "Clear",
  expandRow: "Expand row",
  collapseRow: "Collapse row",
  reorder: "Reorder",
  dragHandle: (index) => `Drag to reorder row ${index + 1}`,
  pickedUp: (label, position, total) =>
    `Picked up ${label}, position ${position} of ${total}.`,
  movedTo: (label, position, total) =>
    `${label} moved to position ${position} of ${total}.`,
  droppedAt: (label, position, total) =>
    `${label} dropped at position ${position} of ${total}.`,
  reorderCancelled: (label, position) =>
    `Reordering cancelled. ${label} returned to position ${position}.`,
  selected: (count) => `${count} selected`,
  showing: (from, to, total) => `Showing ${from} to ${to} of ${total}`,
  emptyTitle: "Nothing here yet",
  emptyDescription: "Items you add will show up here.",
  errorTitle: "Couldn't load this list",
  loading: "Loading…",
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  /** Card title on the left of the toolbar, e.g. "Brand List". Below `sm` the toolbar moves under it, full width. */
  title?: React.ReactNode
  /** Header strip above the table: search, filter tabs, actions. */
  toolbar?: React.ReactNode
  /** Row under the toolbar, typically `<ActiveFilters />` chips; collapses when empty. */
  subToolbar?: React.ReactNode
  /** Nested rows (e.g. a category tree): the first data column gets an expand toggle and indentation. */
  getSubRows?: (row: TData, index: number) => TData[] | undefined
  /** `true` expands every level on first render. */
  defaultExpanded?: ExpandedState
  loading?: boolean
  /** Refetching after the first load: keeps the rows and toolbar, dims the rows and shows a progress bar. */
  refreshing?: boolean
  skeletonRows?: number
  /** Shown instead of rows, e.g. an error message with a retry button. */
  error?: React.ReactNode
  /** Replaces the default empty state. */
  empty?: React.ReactNode
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Shown above the table while rows are selected. */
  bulkActions?: (selected: TData[], clear: () => void) => React.ReactNode
  /** Enables header sorting. Client-side unless `manualSorting` is set. */
  sortable?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  manualSorting?: boolean
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string | undefined
  pagination?: DataTablePaginationProps
  /** Figma puts pagination under the card; "inside" keeps it in the card footer. */
  paginationPlacement?: "outside" | "inside"
  /** Adds a drag-handle column; called with the reordered `data` (mouse or keyboard: Space, arrows, Space). */
  onReorder?: (rows: TData[], move: { from: number; to: number }) => void
  /** Row name for screen-reader reorder announcements, e.g. the product name. */
  getRowLabel?: (row: TData) => string
  labels?: DataTableLabels
  className?: string
}

function DataTable<TData>({
  columns,
  data,
  getRowId,
  title,
  toolbar,
  subToolbar,
  getSubRows,
  defaultExpanded = {},
  loading = false,
  refreshing = false,
  skeletonRows = 5,
  error,
  empty,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  bulkActions,
  sortable = false,
  sorting: sortingProp,
  onSortingChange,
  manualSorting = false,
  onRowClick,
  getRowClassName,
  pagination,
  paginationPlacement = "outside",
  onReorder,
  getRowLabel,
  labels: labelsProp,
  className,
}: DataTableProps<TData>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [rowSelectionState, setRowSelectionState] =
    React.useState<RowSelectionState>({})
  const [sortingState, setSortingState] = React.useState<SortingState>([])
  const [expanded, setExpanded] = React.useState<ExpandedState>(defaultExpanded)

  const rowSelection = rowSelectionProp ?? rowSelectionState
  const sorting = sortingProp ?? sortingState

  const reorderable = Boolean(onReorder) && !getSubRows
  const reorderEnabled = reorderable && sorting.length === 0

  const allColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    const dragColumn: ColumnDef<TData, unknown>[] = reorderable
      ? [
          {
            id: "__drag",
            enableSorting: false,
            meta: { headerClassName: "w-8 px-0", cellClassName: "w-8 px-0" },
            header: () => <span className="sr-only">{labels.reorder}</span>,
            cell: ({ row }) => (
              <DragHandle label={labels.dragHandle(row.index)} />
            ),
          },
        ]
      : []
    if (!enableRowSelection) return [...dragColumn, ...columns]
    return [
      {
        id: "__select",
        enableSorting: false,
        meta: { headerClassName: "w-10 pe-0", cellClassName: "w-10 pe-0" },
        header: ({ table }) => (
          <Checkbox
            aria-label={labels.selectAll}
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(value === true)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={labels.selectRow}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onClick={(event) => event.stopPropagation()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
          />
        ),
      },
      ...dragColumn,
      ...columns,
    ]
    // Labels are read by value; including the object would rebuild columns every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    enableRowSelection,
    reorderable,
    labels.selectAll,
    labels.selectRow,
    labels.reorder,
  ])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { rowSelection, sorting, expanded },
    getSubRows,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getSubRows ? getExpandedRowModel() : undefined,
    enableRowSelection,
    onRowSelectionChange: onRowSelectionChange ?? setRowSelectionState,
    enableSorting: sortable,
    manualSorting,
    onSortingChange: onSortingChange ?? setSortingState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const clearSelection = () => table.resetRowSelection()
  const showProgress = refreshing && !loading
  const busy = loading && !error

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const rowIds = rows.map((row) => row.id)
  const rowLabel = (id: string | number) => {
    const row = rows.find((r) => r.id === String(id))
    return row
      ? (getRowLabel?.(row.original) ?? `Row ${rowIds.indexOf(row.id) + 1}`)
      : ""
  }
  const position = (id: string | number) => rowIds.indexOf(String(id)) + 1
  const announcements = {
    onDragStart: ({ active }: { active: { id: string | number } }) =>
      labels.pickedUp(rowLabel(active.id), position(active.id), rowIds.length),
    onDragOver: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? labels.movedTo(rowLabel(active.id), position(over.id), rowIds.length)
        : undefined,
    onDragEnd: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? labels.droppedAt(
            rowLabel(active.id),
            position(over.id),
            rowIds.length
          )
        : undefined,
    onDragCancel: ({ active }: { active: { id: string | number } }) =>
      labels.reorderCancelled(rowLabel(active.id), position(active.id)),
  }
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!onReorder || !over || active.id === over.id) return
    const from = rowIds.indexOf(String(active.id))
    const to = rowIds.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onReorder(arrayMove([...data], from, to), { from, to })
  }

  const state = error ? (
    <Empty>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive-subtle text-destructive"
        >
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{labels.errorTitle}</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : !loading && rows.length === 0 ? (
    (empty ?? (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
          <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ))
  ) : null
  // Cursor pages keep "Previous" so an emptied later page isn't a dead end.
  const hidePagination =
    Boolean(error) ||
    (!loading &&
      rows.length === 0 &&
      (pagination?.mode === "cursor"
        ? !pagination.hasPrevious
        : pagination?.total === 0))

  const card = (
    <div
      data-slot="data-table"
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl bg-card text-card-foreground shadow-card",
        className
      )}
    >
      {selectedRows.length > 0 && bulkActions ? (
        <div
          data-slot="data-table-bulk-bar"
          className="flex flex-wrap items-center gap-3 border-b border-border-subtle bg-primary-subtle-2 px-5 py-3"
        >
          <span className="text-sm font-[560]">
            {labels.selected(selectedRows.length)}
          </span>
          <Button variant="link" size="sm" onClick={clearSelection}>
            {labels.clearSelection}
          </Button>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {bulkActions(selectedRows, clearSelection)}
          </div>
        </div>
      ) : (
        (toolbar || title) && (
          <div
            data-slot="data-table-toolbar"
            className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-4"
          >
            {title ? (
              <>
                <h2 className="me-auto type-card-title text-foreground">
                  {title}
                </h2>
                {toolbar && (
                  <div className="flex basis-full flex-wrap items-center gap-3 sm:basis-auto">
                    {toolbar}
                  </div>
                )}
              </>
            ) : (
              toolbar
            )}
          </div>
        )
      )}
      {subToolbar && (
        <div
          data-slot="data-table-sub-toolbar"
          className="border-b border-border-subtle px-5 py-3 empty:hidden"
        >
          {subToolbar}
        </div>
      )}

      {showProgress && (
        <div className="relative">
          <div
            data-slot="data-table-progress"
            role="progressbar"
            aria-label={labels.loading}
            className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary-subtle"
          >
            <div className="absolute inset-y-0 start-0 w-2/5 animate-progress-indeterminate bg-primary motion-reduce:w-full motion-reduce:animate-pulse" />
          </div>
        </div>
      )}
      <Table aria-busy={busy || showProgress || undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const content = header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={ariaSort(header.column)}
                    className={cn(
                      alignClass(meta?.align),
                      meta?.headerClassName
                    )}
                  >
                    {header.column.getCanSort() && content ? (
                      <SortButton column={header.column} align={meta?.align}>
                        {content}
                      </SortButton>
                    ) : (
                      content
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          className={cn("transition-opacity", showProgress && "opacity-50")}
        >
          {busy ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : state ? null : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              // Announcer divs are invalid inside <tbody>; dnd-kit only renders them after mount.
              accessibility={{
                announcements,
                container:
                  typeof document === "undefined" ? undefined : document.body,
              }}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rowIds}
                strategy={verticalListSortingStrategy}
                disabled={!reorderEnabled}
              >
                {rows.map((row) => (
                  <DataTableRow
                    key={row.id}
                    id={row.id}
                    sortable={reorderable}
                    selected={row.getIsSelected()}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      getRowClassName?.(row.original)
                    )}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const meta = cell.column.columnDef.meta
                      const isTreeCell =
                        Boolean(getSubRows) &&
                        cellIndex === (enableRowSelection ? 1 : 0)
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            alignClass(meta?.align),
                            meta?.cellClassName
                          )}
                        >
                          {isTreeCell ? (
                            <div
                              className="flex items-center gap-1.5"
                              style={{ paddingInlineStart: row.depth * 24 }}
                            >
                              {row.getCanExpand() ? (
                                <button
                                  type="button"
                                  aria-expanded={row.getIsExpanded()}
                                  aria-label={
                                    row.getIsExpanded()
                                      ? labels.collapseRow
                                      : labels.expandRow
                                  }
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    row.toggleExpanded()
                                  }}
                                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-page hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                  <ChevronDownIcon
                                    aria-hidden="true"
                                    className={cn(
                                      "size-4 transition-transform",
                                      !row.getIsExpanded() &&
                                        "-rotate-90 rtl:rotate-90"
                                    )}
                                  />
                                </button>
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="w-6 shrink-0"
                                />
                              )}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      )
                    })}
                  </DataTableRow>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </TableBody>
      </Table>
      <div role="status" className="sr-only">
        {busy || showProgress ? labels.loading : null}
      </div>
      {/* Outside the table so it spans the card, not the scrollable column width. */}
      {state && (
        <div
          data-slot="data-table-state"
          role="status"
          className={cn(
            "px-5 py-3.5 transition-opacity",
            showProgress && "opacity-50"
          )}
        >
          {state}
        </div>
      )}

      {pagination && !hidePagination && paginationPlacement === "inside" && (
        <DataTablePagination {...pagination} labels={labels} />
      )}
    </div>
  )

  if (!pagination || hidePagination || paginationPlacement === "inside")
    return card

  return (
    <div
      data-slot="data-table-root"
      className="flex w-full min-w-0 flex-col gap-4"
    >
      {card}
      <DataTablePagination
        {...pagination}
        labels={labels}
        className="border-0 px-0 py-0"
      />
    </div>
  )
}

const RowDragContext = React.createContext<{
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
  bindHandle: (node: HTMLElement | null) => void
  disabled: boolean
} | null>(null)

function DataTableRow({
  id,
  sortable,
  selected,
  className,
  children,
  onClick,
}: {
  id: string
  sortable: boolean
  selected: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !sortable })

  return (
    <RowDragContext.Provider
      value={
        sortable
          ? {
              attributes: attributes as unknown as Record<string, unknown>,
              listeners,
              bindHandle: setActivatorNodeRef,
              disabled: attributes["aria-disabled"] === true,
            }
          : null
      }
    >
      <TableRow
        ref={sortable ? setNodeRef : undefined}
        data-state={selected ? "selected" : undefined}
        data-dragging={isDragging || undefined}
        style={
          sortable
            ? { transform: CSS.Translate.toString(transform), transition }
            : undefined
        }
        className={cn(
          "data-dragging:relative data-dragging:z-10 data-dragging:bg-card data-dragging:shadow-2",
          className
        )}
        onClick={onClick}
      >
        {children}
      </TableRow>
    </RowDragContext.Provider>
  )
}

function DragHandle({ label }: { label: string }) {
  const drag = React.useContext(RowDragContext)
  if (!drag) return null
  const { bindHandle, attributes, listeners, disabled } = drag
  return (
    <button
      type="button"
      ref={bindHandle}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      className="inline-flex size-7 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground hover:bg-page hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon aria-hidden="true" className="size-4" />
    </button>
  )
}

function alignClass(align?: "start" | "center" | "end") {
  if (align === "end") return "text-end"
  if (align === "center") return "text-center"
  return undefined
}

function ariaSort<TData>(column: Column<TData, unknown>) {
  if (!column.getCanSort()) return undefined
  const sorted = column.getIsSorted()
  return sorted === "asc"
    ? "ascending"
    : sorted === "desc"
      ? "descending"
      : "none"
}

function SortButton<TData>({
  column,
  align,
  children,
}: {
  column: Column<TData, unknown>
  align?: "start" | "center" | "end"
  children: React.ReactNode
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ChevronsUpDownIcon
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded-sm px-1 uppercase hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
        align === "end" && "flex-row-reverse"
      )}
    >
      {children}
      <Icon
        aria-hidden="true"
        className={cn("size-3", !sorted && "opacity-50")}
      />
    </button>
  )
}

function DataTablePagination(
  props: DataTablePaginationProps & {
    labels?: DataTableLabels
    className?: string
  }
) {
  const labels = { ...DEFAULT_LABELS, ...props.labels }

  if (props.mode === "cursor") {
    return (
      <nav
        data-slot="data-table-pagination"
        aria-label={labels.pagination}
        className={cn(
          "flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3",
          props.className
        )}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!props.hasPrevious}
          onClick={props.onPrevious}
        >
          <ChevronLeftIcon className="rtl:rotate-180" /> {labels.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!props.hasNext}
          onClick={props.onNext}
        >
          {labels.next} <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </nav>
    )
  }

  const {
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    showPageNumbers = false,
    siblingCount = 1,
    getPageHref,
  } = props
  const pageSizeOptions = props.pageSizeOptions ?? [10, 15, 25, 50, 100]
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const linkTo = (target: number, disabled = false) => ({
    disabled,
    href: disabled ? undefined : getPageHref?.(target),
    onNavigate: target === page ? undefined : () => onPageChange(target),
  })

  return (
    <nav
      data-slot="data-table-pagination"
      aria-label={labels.pagination}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle px-5 py-3",
        showPageNumbers && "@container/pagination",
        props.className
      )}
    >
      <span className="text-[12.5px] text-muted-foreground tabular-nums">
        {labels.showing(from, to, total)}
      </span>
      {onPageSizeChange && (
        <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          {labels.rowsPerPage}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[76px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
      <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
        <PageControl
          variant="outline"
          size="sm"
          {...linkTo(page - 1, page <= 1)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" /> {labels.previous}
        </PageControl>
        {showPageNumbers && (
          <div className="hidden items-center gap-1 @md/pagination:flex">
            {pageItems(page, pageCount, siblingCount).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontalIcon aria-hidden="true" className="size-4" />
                  <span className="sr-only">{labels.morePages}</span>
                </span>
              ) : (
                <PageControl
                  key={item}
                  variant={item === page ? "secondary" : "ghost"}
                  size="sm"
                  className="min-w-8 px-2 tabular-nums"
                  aria-label={labels.page(item)}
                  aria-current={item === page ? "page" : undefined}
                  {...linkTo(item)}
                >
                  {item}
                </PageControl>
              )
            )}
          </div>
        )}
        <PageControl
          variant="outline"
          size="sm"
          {...linkTo(page + 1, page >= pageCount)}
        >
          {labels.next} <ChevronRightIcon className="rtl:rotate-180" />
        </PageControl>
      </div>
    </nav>
  )
}

function PageControl({
  href,
  onNavigate,
  disabled,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "asChild"> & {
  href?: string
  onNavigate?: () => void
}) {
  if (href === undefined || disabled)
    return (
      <Button disabled={disabled} onClick={onNavigate} {...props}>
        {children}
      </Button>
    )
  return (
    <Button asChild {...props}>
      <a
        href={href}
        onClick={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return
          event.preventDefault()
          onNavigate?.()
        }}
      >
        {children}
      </a>
    </Button>
  )
}

function pageItems(page: number, pageCount: number, siblingCount: number) {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index)
  const slots = siblingCount * 2 + 5
  if (pageCount <= slots) return range(1, pageCount)
  const start = Math.max(page - siblingCount, 1)
  const end = Math.min(page + siblingCount, pageCount)
  if (start <= 3)
    return [...range(1, slots - 2), "ellipsis" as const, pageCount]
  if (end >= pageCount - 2)
    return [1, "ellipsis" as const, ...range(pageCount - slots + 3, pageCount)]
  return [
    1,
    "ellipsis" as const,
    ...range(start, end),
    "ellipsis" as const,
    pageCount,
  ]
}

export {
  DataTable,
  DataTablePagination,
  type DataTableProps,
  type DataTablePaginationProps,
  type DataTableLabels,
}
export type {
  ColumnDef,
  Row,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table"
