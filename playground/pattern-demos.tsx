import * as React from "react"
import {
  FiDownload as DownloadIcon,
  FiPlus as PlusIcon,
  FiTrash2 as Trash2Icon,
  FiUpload as UploadIcon,
} from "react-icons/fi"
import { LuEllipsis as EllipsisIcon } from "react-icons/lu"
import { toast } from "sonner"

import {
  Button,
  CardBrandIcon,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  ICON_GROUPS,
  ActiveFilters,
  Label,
  MediaCell,
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
  TabsContent,
  TabsList,
  TabsTrigger,
  TableFilters,
  type ColumnDef,
  type FilterField,
  type FilterValues,
  type NumberRange,
  type IconName,
  type StatusTone,
} from "@/index"

type Product = {
  id: string
  name: string
  vendor: string
  image?: string
  price: number
  stock: number
  status: "Published" | "Draft" | "Pending"
  featured: boolean
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

const PRODUCTS: Product[] = Array.from({ length: 120 }, (_, i) => ({
  id: String(i + 1),
  name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` #${Math.floor(i / NAMES.length) + 1}` : ""}`,
  vendor: VENDORS[i % VENDORS.length],
  // Every seventh product has no photo, to show the fallback.
  image: i % 7 === 6 ? undefined : `https://picsum.photos/seed/fc-${i}/80/80`,
  price: Math.round((5 + ((i * 37) % 120) + (i % 7) * 0.33) * 100) / 100,
  stock: (i * 13) % 5 === 0 ? 0 : 5 + ((i * 17) % 60),
  status: STATUSES[i % STATUSES.length],
  featured: i % 3 === 0,
}))

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const productColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <MediaCell
        src={row.original.image}
        title={row.original.name}
        description={`by ${row.original.vendor}`}
        className="max-w-72"
      />
    ),
  },
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

const productFilters: FilterField[] = [
  {
    key: "stock",
    label: "Stock",
    type: "select",
    options: [
      { value: "in", label: "In stock" },
      { value: "out", label: "Out of stock" },
    ],
  },
  {
    key: "vendor",
    label: "Vendor",
    type: "multi",
    options: VENDORS.map((v) => ({ value: v, label: v })),
  },
  { key: "price", label: "Price", type: "range", prefix: "$", min: 0 },
  { key: "created", label: "Created", type: "date-range" },
  {
    key: "featured",
    label: "Featured",
    type: "boolean",
    description: "Only featured products",
  },
]

export function DataTableDemo() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [filters, setFilters] = React.useState<FilterValues>({})
  // Page links carry ?page=, so a page opened in a new tab starts there.
  const [page, setPage] = React.useState(
    () => Number(new URLSearchParams(window.location.search).get("page")) || 1
  )
  const [pageSize, setPageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [confirmIds, setConfirmIds] = React.useState<string[] | null>(null)

  const price = filters.price as NumberRange | undefined
  const vendors = filters.vendor as string[] | undefined
  const filtered = PRODUCTS.filter(
    (p) =>
      (status === "all" || p.status.toLowerCase() === status) &&
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (!filters.stock ||
        (filters.stock === "in" ? p.stock > 0 : p.stock === 0)) &&
      (!vendors?.length || vendors.includes(p.vendor)) &&
      (price?.min === undefined || p.price >= price.min) &&
      (price?.max === undefined || p.price <= price.max) &&
      (!filters.featured || p.featured)
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const applyFilters = (next: FilterValues) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          <Switch checked={loading} onCheckedChange={setLoading} /> Loading
        </label>
        <label className="flex items-center gap-2">
          <Switch checked={refreshing} onCheckedChange={setRefreshing} />{" "}
          Refreshing
        </label>
        <label className="flex items-center gap-2">
          <Switch checked={failed} onCheckedChange={setFailed} /> Error
        </label>
        <span>Search for “zzz” to see the empty state.</span>
      </div>
      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        className="min-w-0 gap-4"
      >
        <TabsList>
          <TabsTrigger value="all">All products</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        {/* The table is the tab panel, so each tab controls something. */}
        <TabsContent value={status} className="min-w-0">
          <DataTable
            columns={productColumns}
            data={pageRows}
            getRowId={(row) => row.id}
            loading={loading}
            refreshing={refreshing}
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
            getRowHref={(row) => `?product=${row.id}#data-table`}
            toolbar={
              <>
                <SearchInput
                  containerClassName="w-full sm:w-72"
                  placeholder="Search products"
                  onSearch={(value) => {
                    setQuery(value)
                    setPage(1)
                  }}
                />
                <div className="ms-auto flex gap-2">
                  <Button variant="outline" size="sm">
                    <DownloadIcon /> Import
                  </Button>
                  <Button variant="outline" size="sm">
                    <UploadIcon /> Export
                  </Button>
                  <TableFilters
                    fields={productFilters}
                    value={filters}
                    onValueChange={applyFilters}
                  />
                </div>
              </>
            }
            subToolbar={
              <ActiveFilters
                fields={productFilters}
                value={filters}
                onValueChange={applyFilters}
              />
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
              showPageNumbers: true,
              getPageHref: (page) => `?page=${page}#data-table`,
            }}
            labels={{ pagination: "Products pagination" }}
          />
        </TabsContent>
      </Tabs>
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

type Category = {
  id: string
  name: string
  image?: string
  products: number
  status: "Published" | "Draft"
  children?: Category[]
}

const CATEGORIES: Category[] = [
  {
    id: "c1",
    name: "Toys Kid",
    image: "https://picsum.photos/seed/fc-cat-1/80/80",
    products: 24,
    status: "Published",
    children: [
      {
        id: "c1a",
        name: "Wireless Charging Pad",
        products: 180,
        status: "Published",
      },
      {
        id: "c1b",
        name: "Abstract Art",
        image: "https://picsum.photos/seed/fc-cat-2/80/80",
        products: 423,
        status: "Published",
        children: [
          {
            id: "c1b1",
            name: "Personalized Leather",
            products: 734,
            status: "Draft",
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "Eco-Friendly Toothbrush",
    image: "https://picsum.photos/seed/fc-cat-3/80/80",
    products: 0,
    status: "Published",
  },
  { id: "c3", name: "Custom Dog Collar", products: 56, status: "Draft" },
]

const categoryColumns: ColumnDef<Category, unknown>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <MediaCell src={row.original.image} title={row.original.name} size={32} />
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    meta: { align: "end" },
    cell: ({ row }) =>
      row.original.products === 0 ? "No products" : row.original.products,
  },
  {
    accessorKey: "status",
    header: "Visibility",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function DataTableTreeDemo() {
  return (
    <DataTable
      columns={categoryColumns}
      data={CATEGORIES}
      getRowId={(row) => row.id}
      getSubRows={(row) => row.children}
      defaultExpanded={true}
      toolbar={
        <SearchInput
          containerClassName="w-full sm:w-72"
          placeholder="Search categories"
        />
      }
    />
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
  const [query, setQuery] = React.useState("")
  return (
    <div className="flex w-full flex-col gap-5 sm:w-80">
      <div className="flex flex-col gap-2">
        <SearchInput placeholder="Search products" onSearch={setLast} />
        <span className="text-xs text-muted-foreground">
          onSearch (after typing pauses): {last ? `“${last}”` : "—"}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <SearchInput
          placeholder="Search orders"
          searchOn="enter"
          onSearch={setQuery}
          onClear={() => toast("Search cleared")}
        />
        <span className="text-xs text-muted-foreground">
          searchOn="enter" (press Enter): {query ? `“${query}”` : "—"}
        </span>
      </div>
    </div>
  )
}

const ORDER_STATUSES = [
  { value: "on_hold", label: "On hold" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "partially-refunded", label: "Partially refunded" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "partial", label: "Partial" },
  { value: "awaiting_shipment", label: "Awaiting shipment" },
]
const ORDER_TONES: Record<string, StatusTone> = { awaiting_shipment: "default" }

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          API values (on_hold, partially-refunded) with display labels
        </span>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map(({ value, label }) => (
            <StatusBadge key={value} status={value} tones={ORDER_TONES}>
              {label}
            </StatusBadge>
          ))}
        </div>
      </div>
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
          , never a react-icons component directly.
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
                  className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle px-2 py-3 text-foreground-secondary transition-colors hover:border-primary/40 hover:bg-primary-subtle-2 hover:text-primary-ink focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
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

const CARD_BRAND_SAMPLES = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "diners",
  "jcb",
  "unionpay",
  "eftpos_au",
]

export function CardBrandIconDemo() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-8">
        {CARD_BRAND_SAMPLES.map((brand) => (
          <figure
            key={brand}
            className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle px-2 py-3 text-foreground-secondary"
          >
            <CardBrandIcon brand={brand} size={32} />
            <figcaption className="type-hint text-muted-foreground">
              {brand}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex max-w-md items-center gap-3 rounded-xl bg-card p-4 shadow-card">
        <CardBrandIcon brand="Visa" size={32} label="" />
        <div className="min-w-0 flex-1">
          <p className="type-row-title text-foreground">Visa ending in 4242</p>
          <p className="type-hint text-muted-foreground">Expires 12/2027</p>
        </div>
        <Button variant="outline" size="sm">
          Replace
        </Button>
      </div>
    </div>
  )
}

type Brand = {
  id: string
  name: string
  image?: string
  description: string
  status: "Published" | "Draft"
}

const BRANDS: Brand[] = [
  ["Yoga Mat", "Entry-level plan with essential features for small stores"],
  ["Wireless Charging Pad", "185 products"],
  ["Abstract Art", "423 products"],
  ["Personalized Leather", "No products"],
  ["Eco-Friendly Bamboo Toothbrush", "154 products"],
  ["Custom Dog Collar", "No products"],
].map(([name, description], i) => ({
  id: `b${i + 1}`,
  name,
  description,
  image: `https://picsum.photos/seed/fc-brand-${i}/80/80`,
  status: i === 3 ? "Draft" : "Published",
}))

const brandColumns: ColumnDef<Brand, unknown>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row }) => (
      <MediaCell
        src={row.original.image}
        title={row.original.name}
        className="max-w-60"
      />
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block max-w-72 truncate text-foreground-secondary">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Availability",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    meta: { align: "end" },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Actions for ${row.original.name}`}
      >
        <EllipsisIcon />
      </Button>
    ),
  },
]

export function DataTableReorderDemo() {
  const [brands, setBrands] = React.useState(BRANDS)
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Drag a row by its handle, or focus a handle and use Space, the arrow
        keys, then Space to drop.
      </p>
      <DataTable
        title="Brand List"
        columns={brandColumns}
        data={brands}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        enableRowSelection
        onReorder={(next, { from, to }) => {
          setBrands(next)
          toast(
            `Moved “${next[to].name}” from position ${from + 1} to ${to + 1}`
          )
        }}
        toolbar={
          <>
            <SearchInput
              containerClassName="min-w-0 flex-1 sm:w-72 sm:flex-none"
              placeholder="Search brands"
            />
            <TableFilters
              fields={productFilters.slice(0, 1)}
              value={{}}
              onValueChange={() => {}}
            />
          </>
        }
        pagination={{
          page: 1,
          pageSize: 10,
          total: brands.length,
          onPageChange: () => {},
        }}
      />
    </div>
  )
}
