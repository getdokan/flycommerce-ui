"use client"

import * as React from "react"
import { cn } from "cn"
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
import type {
  RowDrag,
  SortableRowsProps,
} from "@/components/data-table/sortable-rows"

type SortableRowsModule = {
  default: React.ComponentType<SortableRowsProps>
}

let loadedSortableRows: React.ComponentType<SortableRowsProps> | undefined
let sortableRowsImport: Promise<SortableRowsModule> | undefined

function loadSortableRows() {
  sortableRowsImport ??= import("@/components/data-table/sortable-rows")
    .catch((error): SortableRowsModule => {
      console.warn(
        "DataTable: row reordering failed to load; rows render without drag handles.",
        error
      )
      return { default: StaticRows }
    })
    .then((module) => {
      loadedSortableRows = module.default
      return module
    })
  return sortableRowsImport
}

const LazySortableRows = React.lazy(loadSortableRows)

const ReorderUnavailableContext = React.createContext(false)

function StaticRows({ ids, renderRow }: SortableRowsProps) {
  return (
    <ReorderUnavailableContext.Provider value>
      {ids.map((_, index) => renderRow(index))}
    </ReorderUnavailableContext.Provider>
  )
}

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
  /** Makes rows focusable; a click or Enter calls it, except on links, buttons and inputs inside the row. */
  onRowClick?: (row: TData) => void
  /** Row URL: cmd/ctrl-click and middle-click open it in a new tab; without `onRowClick`, a click or Enter goes to it. */
  getRowHref?: (row: TData) => string
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
  getRowHref,
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
  const [SortableRows] = React.useState(
    () => loadedSortableRows ?? LazySortableRows
  )

  React.useEffect(() => {
    if (reorderable) void loadSortableRows()
  }, [reorderable])

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

  const rowLabel = (id: string) => {
    const index = rows.findIndex((row) => row.id === id)
    if (index < 0) return ""
    return getRowLabel?.(rows[index].original) ?? `Row ${index + 1}`
  }
  const moveRow = (from: number, to: number) => {
    const next = [...data]
    next.splice(to, 0, ...next.splice(from, 1))
    onReorder?.(next, { from, to })
  }
  const rowActions = (row: TData): React.ComponentProps<"tr"> => {
    if (!onRowClick && !getRowHref) return {}
    const href = getRowHref?.(row)
    const openInNewTab = () => {
      if (href !== undefined) window.open(href, "_blank", "noopener")
    }
    const activate = (event: React.MouseEvent | React.KeyboardEvent) => {
      if (href !== undefined && (event.metaKey || event.ctrlKey)) openInNewTab()
      else if (onRowClick) onRowClick(row)
      else if (href !== undefined) window.location.assign(href)
    }
    return {
      tabIndex: 0,
      onClick: (event) => {
        if (!fromInteractive(event)) activate(event)
      },
      onAuxClick: (event) => {
        if (event.button === 1 && !fromInteractive(event)) openInNewTab()
      },
      onKeyDown: (event) => {
        if (event.key === "Enter" && event.target === event.currentTarget)
          activate(event)
      },
    }
  }
  const renderRow = (row: Row<TData>, drag?: RowDrag) => (
    <DataTableRow
      key={row.id}
      drag={drag}
      selected={row.getIsSelected()}
      className={cn(
        (onRowClick || getRowHref) &&
          "cursor-pointer focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        getRowClassName?.(row.original)
      )}
      {...rowActions(row.original)}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        const meta = cell.column.columnDef.meta
        const isTreeCell =
          Boolean(getSubRows) && cellIndex === (enableRowSelection ? 1 : 0)
        return (
          <TableCell
            key={cell.id}
            className={cn(alignClass(meta?.align), meta?.cellClassName)}
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
                        !row.getIsExpanded() && "-rotate-90 rtl:rotate-90"
                      )}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" className="w-6 shrink-0" />
                )}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        )
      })}
    </DataTableRow>
  )

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
          ) : state ? null : reorderable ? (
            <React.Suspense fallback={rows.map((row) => renderRow(row))}>
              <SortableRows
                ids={rows.map((row) => row.id)}
                disabled={!reorderEnabled}
                labels={labels}
                getLabel={rowLabel}
                onMove={moveRow}
                renderRow={(index, drag) => renderRow(rows[index], drag)}
              />
            </React.Suspense>
          ) : (
            rows.map((row) => renderRow(row))
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

const RowDragContext = React.createContext<RowDrag["handle"] | null>(null)

function DataTableRow({
  drag,
  selected,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"tr">, "id"> & {
  drag?: RowDrag
  selected: boolean
}) {
  return (
    <RowDragContext.Provider value={drag?.handle ?? null}>
      <TableRow
        ref={drag?.ref}
        data-state={selected ? "selected" : undefined}
        data-dragging={drag?.dragging || undefined}
        style={drag?.style}
        className={cn(
          "data-dragging:relative data-dragging:z-10 data-dragging:bg-card data-dragging:shadow-2",
          className
        )}
        {...props}
      >
        {children}
      </TableRow>
    </RowDragContext.Provider>
  )
}

function DragHandle({ label }: { label: string }) {
  const drag = React.useContext(RowDragContext)
  const unavailable = React.useContext(ReorderUnavailableContext)
  if (!drag)
    return unavailable ? null : (
      <span
        aria-hidden="true"
        className="inline-flex size-7 items-center justify-center text-muted-foreground"
      >
        <GripVerticalIcon className="size-4" />
      </span>
    )
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

const INTERACTIVE =
  "a, button, input, select, textarea, label, [role=button], [role=checkbox], [role=switch], [role=link], [role=menuitem], [data-slot=checkbox]"

function fromInteractive(event: React.SyntheticEvent<HTMLElement>) {
  const target = event.target as Element
  if (!event.currentTarget.contains(target)) return true
  const interactive = target.closest(INTERACTIVE)
  return interactive !== null && event.currentTarget.contains(interactive)
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
