"use client"

import * as React from "react"
import { cn } from "cn"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  InboxIcon,
  TriangleAlertIcon,
} from "lucide-react"

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
  previous?: string
  next?: string
  rowsPerPage?: string
  selectAll?: string
  selectRow?: string
  clearSelection?: string
  selected?: (count: number) => React.ReactNode
  showing?: (from: number, to: number, total: number) => React.ReactNode
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  errorTitle?: React.ReactNode
}

const DEFAULT_LABELS: Required<DataTableLabels> = {
  previous: "Previous",
  next: "Next",
  rowsPerPage: "Rows per page",
  selectAll: "Select all rows",
  selectRow: "Select row",
  clearSelection: "Clear",
  selected: (count) => `${count} selected`,
  showing: (from, to, total) => `Showing ${from} to ${to} of ${total}`,
  emptyTitle: "Nothing here yet",
  emptyDescription: "Items you add will show up here.",
  errorTitle: "Couldn't load this list",
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  /** Header strip above the table: search, filter tabs, actions. */
  toolbar?: React.ReactNode
  loading?: boolean
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
  labels?: DataTableLabels
  className?: string
}

function DataTable<TData>({
  columns,
  data,
  getRowId,
  toolbar,
  loading = false,
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
  labels: labelsProp,
  className,
}: DataTableProps<TData>) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [rowSelectionState, setRowSelectionState] =
    React.useState<RowSelectionState>({})
  const [sortingState, setSortingState] = React.useState<SortingState>([])

  const rowSelection = rowSelectionProp ?? rowSelectionState
  const sorting = sortingProp ?? sortingState

  const allColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns
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
      ...columns,
    ]
  }, [columns, enableRowSelection, labels.selectAll, labels.selectRow])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions by design
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { rowSelection, sorting },
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

  return (
    <div
      data-slot="data-table"
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-1",
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
        toolbar && (
          <div
            data-slot="data-table-toolbar"
            className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-4"
          >
            {toolbar}
          </div>
        )
      )}

      <Table>
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
        <TableBody>
          {error ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="whitespace-normal">
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
              </TableCell>
            </TableRow>
          ) : loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="whitespace-normal">
                {empty ?? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <InboxIcon />
                      </EmptyMedia>
                      <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
                      <EmptyDescription>
                        {labels.emptyDescription}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  onRowClick && "cursor-pointer",
                  getRowClassName?.(row.original)
                )}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        alignClass(meta?.align),
                        meta?.cellClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && <DataTablePagination {...pagination} labels={labels} />}
    </div>
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
        aria-label="Pagination"
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

  const { page, pageSize, total, onPageChange, onPageSizeChange } = props
  const pageSizeOptions = props.pageSizeOptions ?? [10, 15, 25, 50, 100]
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      data-slot="data-table-pagination"
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle px-5 py-3",
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
      <div className="ms-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" /> {labels.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {labels.next} <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  )
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
