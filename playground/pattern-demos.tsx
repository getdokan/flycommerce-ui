import * as React from "react"
import {
  DownloadIcon,
  EllipsisIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Button,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  ICON_GROUPS,
  Label,
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
  SaveBar,
  SearchInput,
  StatusBadge,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  type ColumnDef,
  type IconName,
} from "@/index"

type Product = {
  id: string
  name: string
  vendor: string
  price: number
  stock: number
  status: "Published" | "Draft" | "Pending"
}

const VENDORS = [
  "GreenVita",
  "Gaïa",
  "Como Kitchen",
  "The Hip Fish",
  "Disfrutar",
]
const NAMES = [
  "MacBook Air Retina 12-inch",
  "MVMTH Classical Leather Watch",
  "NYX Beauty Palette 12",
  "Baxter Care Hair Kit",
  "Samsung VR Headset",
  "Aveeno Body Shower 450ml",
  "Ciate Palemore Lipstick",
  "B&O Play Mini Speaker",
]
const STATUSES: Product["status"][] = [
  "Published",
  "Draft",
  "Published",
  "Pending",
]

const PRODUCTS: Product[] = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` #${Math.floor(i / NAMES.length) + 1}` : ""}`,
  vendor: VENDORS[i % VENDORS.length],
  price: Math.round((5 + ((i * 37) % 120) + (i % 7) * 0.33) * 100) / 100,
  stock: (i * 13) % 5 === 0 ? 0 : 5 + ((i * 17) % 60),
  status: STATUSES[i % STATUSES.length],
}))

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const productColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => <span className="font-[560]">{row.original.name}</span>,
  },
  { accessorKey: "vendor", header: "Vendor" },
  {
    accessorKey: "price",
    header: "Price",
    meta: { align: "end" },
    cell: ({ row }) => money.format(row.original.price),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) =>
      row.original.stock > 0 ? (
        <StatusBadge status="In stock">
          {row.original.stock} in stock
        </StatusBadge>
      ) : (
        <StatusBadge status="Out of stock" />
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { align: "end" },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${row.original.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DataTableDemo() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [confirmIds, setConfirmIds] = React.useState<string[] | null>(null)

  const filtered = PRODUCTS.filter(
    (p) =>
      (status === "all" || p.status.toLowerCase() === status) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          <Switch checked={loading} onCheckedChange={setLoading} /> Loading
        </label>
        <label className="flex items-center gap-2">
          <Switch checked={failed} onCheckedChange={setFailed} /> Error
        </label>
        <span>Search for “zzz” to see the empty state.</span>
      </div>
      <DataTable
        columns={productColumns}
        data={pageRows}
        getRowId={(row) => row.id}
        loading={loading}
        error={
          failed ? (
            <span className="flex flex-col items-center gap-3">
              The server didn&apos;t respond.
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFailed(false)}
              >
                Try again
              </Button>
            </span>
          ) : undefined
        }
        sortable
        enableRowSelection
        onRowClick={(row) => toast(`Open ${row.name}`)}
        toolbar={
          <>
            <SearchInput
              containerClassName="w-full sm:w-64"
              placeholder="Search products"
              onSearch={(value) => {
                setQuery(value)
                setPage(1)
              }}
            />
            <Tabs
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="ms-auto flex gap-2">
              <Button variant="outline" size="sm">
                <DownloadIcon /> Import
              </Button>
              <Button variant="outline" size="sm">
                <UploadIcon /> Export
              </Button>
            </div>
          </>
        }
        bulkActions={(selected) => (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmIds(selected.map((p) => p.id))}
          >
            <Trash2Icon /> Delete
          </Button>
        )}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(1)
          },
        }}
      />
      <ConfirmDialog
        open={confirmIds !== null}
        onOpenChange={(open) => !open && setConfirmIds(null)}
        title={`Delete ${confirmIds?.length ?? 0} ${confirmIds?.length === 1 ? "product" : "products"}?`}
        description="They are removed from your catalog and can't be restored."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 900))
          toast.success(
            `${confirmIds?.length} ${confirmIds?.length === 1 ? "product" : "products"} deleted`
          )
        }}
      />
    </div>
  )
}

export function PageHeaderDemo() {
  return (
    <div className="w-full rounded-lg bg-page p-5">
      <PageHeader className="mb-0">
        <PageHeaderBack href="#page-header">Products</PageHeaderBack>
        <PageHeaderContent>
          <PageHeaderTitle>Add product</PageHeaderTitle>
          <PageHeaderDescription>
            Name, price and stock. You can publish it now or save a draft.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Save as draft</Button>
          <Button>
            <PlusIcon /> Create product
          </Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  )
}

export function SaveBarDemo() {
  const [dirty, setDirty] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      <Switch id="dirty" checked={dirty} onCheckedChange={setDirty} />
      <Label htmlFor="dirty">Simulate unsaved changes</Label>
      <SaveBar
        open={dirty}
        loading={saving}
        onDiscard={() => setDirty(false)}
        onSave={async () => {
          setSaving(true)
          await new Promise((resolve) => setTimeout(resolve, 900))
          setSaving(false)
          setDirty(false)
          toast.success("Settings saved")
        }}
      />
    </div>
  )
}

export function ConfirmDialogDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmDialog
        trigger={<Button variant="outline">Publish store</Button>}
        title="Publish your store?"
        description="Customers will be able to find and buy your products."
        confirmLabel="Publish"
        onConfirm={() => {
          toast.success("Store published")
        }}
      />
      <ConfirmDialog
        trigger={
          <Button variant="destructive">
            <Trash2Icon /> Delete product
          </Button>
        }
        title="Delete this product?"
        description="It is removed from your catalog. This waits a second to show the loading state."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          toast.success("Product deleted")
        }}
      />
      <ConfirmDialog
        trigger={<Button variant="destructive">Delete store</Button>}
        title="Delete Trendy Store?"
        description="All products, orders and customers are deleted permanently."
        confirmLabel="Delete store"
        destructive
        confirmText="Trendy Store"
        onConfirm={() => {
          toast.success("Store deleted")
        }}
      />
    </div>
  )
}

export function SearchInputDemo() {
  const [last, setLast] = React.useState("")
  return (
    <div className="flex w-full flex-col gap-2 sm:w-80">
      <SearchInput placeholder="Search orders" onSearch={setLast} />
      <span className="text-xs text-muted-foreground">
        onSearch (after typing pauses): {last ? `“${last}”` : "—"}
      </span>
    </div>
  )
}

export function StatusBadgeDemo() {
  const statuses = [
    "Published",
    "Delivered",
    "Paid",
    "Pending",
    "On hold",
    "Processing",
    "Shipped",
    "Draft",
    "Unfulfilled",
    "Cancelled",
    "Refunded",
    "Out of stock",
    "Coming soon",
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  )
}

export function IconsDemo() {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          containerClassName="w-full sm:w-72"
          placeholder="Search icons"
          debounceMs={0}
          onSearch={setQuery}
        />
        <span className="text-xs text-muted-foreground">
          Click an icon to copy its usage. Use{" "}
          <code className="rounded bg-muted px-1">{`<Icon name="orders" />`}</code>
          , never a lucide component directly.
        </span>
      </div>
      {Object.entries(ICON_GROUPS).map(([group, icons]) => {
        const names = Object.keys(icons).filter((name) =>
          name.toLowerCase().includes(q)
        ) as IconName[]
        if (names.length === 0) return null
        return (
          <div key={group} className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase">
              {group}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
              {names.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={`<Icon name="${name}" />`}
                  onClick={() => {
                    void navigator.clipboard?.writeText(
                      `<Icon name="${name}" />`
                    )
                    toast(`Copied <Icon name="${name}" />`)
                  }}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle px-2 py-3 text-foreground-secondary transition-colors hover:border-primary/40 hover:bg-primary-subtle-2 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Icon name={name} size={20} />
                  <span className="w-full truncate text-center text-[11.5px]">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
