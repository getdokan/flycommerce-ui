# @flycommerce/ui

The FlyCommerce design system for React: accessible components, design tokens and ready-made patterns that give every FlyCommerce surface (the merchant dashboard, the hub and third-party apps) the same look and behaviour.

[![npm version](https://img.shields.io/npm/v/@flycommerce/ui.svg)](https://www.npmjs.com/package/@flycommerce/ui)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/getdokan/flycommerce-ui/blob/main/LICENSE)
[![CI](https://github.com/getdokan/flycommerce-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/getdokan/flycommerce-ui/actions/workflows/ci.yml)

**[Browse the component gallery →](https://ui.flycommerce.com)**

Built on [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) and [Tailwind CSS v4](https://tailwindcss.com), restyled to FlyCommerce's design.

- **90+ components.** The complete shadcn set plus commerce patterns: data tables with filters, media library, category picker, rich-text editor, save bar, stat cards and more.
- **One source of truth for the look.** Colour, radius, shadow and type tokens with light and dark themes. Screens compose components; they never restyle them.
- **Accessible by default.** Keyboard support throughout, focus rings for keyboard users only, labelled controls, screen-reader announcements for drag and drop and uploads.
- **Ready for every market.** RTL layouts, and every user-visible string can be translated through props.
- **Mobile first.** Every component is checked at 375px.
- **Lightweight.** Tree-shakeable ESM with TypeScript types: an app pays only for what it imports (a `Button` adds about 14 KB gzipped). Heavy extras like charts are opt-in.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
- [Quick start](#quick-start)
- [Components](#components)
- [Recipes](#recipes)
- [Design tokens](#design-tokens)
- [Icons](#icons)
- [Accessibility and localisation](#accessibility-and-localisation)
- [Building with Claude Code](#building-with-claude-code)
- [Versioning](#versioning)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Requirements

|               |                                                                                       |
| ------------- | ------------------------------------------------------------------------------------- |
| React         | 19                                                                                    |
| Styling       | Tailwind CSS 4 (recommended), or the precompiled stylesheet for apps without Tailwind |
| Module format | ESM only                                                                              |
| Charts        | Optional: install `recharts` 3 only if you use `@flycommerce/ui/chart`                |
| Browsers      | Those Tailwind CSS 4 supports: Chrome 111+, Safari 16.4+, Firefox 128+                |

## Installation

```bash
pnpm add @flycommerce/ui
# or
npm install @flycommerce/ui
# or
yarn add @flycommerce/ui
```

## Setup

### 1. Styles

**Apps using Tailwind CSS 4.** Add the library after Tailwind in your main stylesheet. It registers the design tokens and tells Tailwind to scan the library's components:

```css
@import "tailwindcss";
@import "@flycommerce/ui/tailwind.css";
@import "@flycommerce/ui/fonts.css"; /* Inter, if your app doesn't load it already */
```

**Apps without Tailwind.** Import the precompiled stylesheet once at the app root. It contains no CSS reset, so it won't restyle the rest of your page:

```ts
import "@flycommerce/ui/styles.css"
import "@flycommerce/ui/fonts.css"
```

### 2. Providers

Wrap the app once:

```tsx
import { Toaster, TooltipProvider } from "@flycommerce/ui"

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
```

### 3. Dark mode and RTL

- **Dark mode:** set `data-theme="dark"` (or the `dark` class) on `<html>`.
- **Right-to-left:** set `dir="rtl"` on `<html>` and wrap the app in `<DirectionProvider dir="rtl">`.

## Quick start

```tsx
import { useState } from "react"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldLabel,
  Input,
  SwitchField,
  toast,
} from "@flycommerce/ui"

export function StoreSettings() {
  const [name, setName] = useState("Trendy Store")

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Store details</CardTitle>
        <CardDescription>
          Shown on your storefront and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Field>
          <FieldLabel htmlFor="store-name" required>
            Store name
          </FieldLabel>
          <Input
            id="store-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <SwitchField
          title="Accept reviews"
          description="Let customers rate products they bought."
        />
        <Button
          className="justify-self-start"
          onClick={() => toast.success("Saved")}
        >
          Save changes
        </Button>
      </CardContent>
    </Card>
  )
}
```

The base components can also be imported one by one, for example `import { Button } from "@flycommerce/ui/button"`. Either way, bundlers only include what you use.

## Components

The [live gallery](https://ui.flycommerce.com) shows every component, variant and state in light, dark, RTL and mobile layouts, with a **Code** tab to copy each example.

| Category              | Components                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions               | `Button`, `ButtonGroup`, `Toggle`, `ToggleGroup`, `CopyButton`                                                                                                                                                                                                                                                                               |
| Forms                 | `Field`, `Input`, `InputGroup`, `Textarea`, `PasswordInput`, `SearchInput`, `Select`, `Combobox`, `AsyncCombobox`, `RichSelect`, `TreeSelect`, `TagInput`, `OptionListEditor`, `Checkbox`, `RadioGroup`, `RadioCard`, `Switch`, `SwitchField`, `Slider`, `InputOTP`, `DatePicker`, `DateRangePicker`, `RichTextEditor`, `Dropzone`, `Rating` |
| Data display          | `DataTable`, `Table`, `TableFilters`, `ActiveFilters`, `MediaCell`, `StatCard`, `Badge`, `StatusBadge`, `Avatar`, `ImageWithFallback`, `Item`, `Kbd`                                                                                                                                                                                         |
| Media                 | `MediaPickerDialog`, `MediaGrid`, `MediaTile`, `MediaDetailsPanel`, `UploadQueue`, `VideoUrlList`                                                                                                                                                                                                                                            |
| Feedback              | `Alert`, `toast`, `Progress`, `Skeleton`, `Spinner`, `Empty`, `LoadingOverlay`                                                                                                                                                                                                                                                               |
| Overlays              | `Dialog`, `ConfirmDialog`, `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `Tooltip`, `InfoTooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`                                                                                                                                                                                                 |
| Navigation and layout | `Sidebar`, `PageHeader`, `NavTabs`, `Tabs`, `Breadcrumb`, `Pagination`, `Card`, `Accordion`, `Collapsible`, `Separator`, `ScrollArea`, `ResizablePanelGroup`, `SaveBar`                                                                                                                                                                      |
| Foundations           | `Icon`, design tokens, `type-*` typography utilities                                                                                                                                                                                                                                                                                         |

**Charts** live in their own entry point so apps that don't chart never install or bundle a chart library:

```bash
pnpm add recharts
```

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@flycommerce/ui/chart"
```

## Recipes

### A list page with search, filters and pagination

```tsx
import { useState } from "react"
import {
  ActiveFilters,
  DataTable,
  MediaCell,
  SearchInput,
  StatusBadge,
  TableFilters,
  type ColumnDef,
  type FilterField,
} from "@flycommerce/ui"

type Product = {
  id: string
  name: string
  image: string
  vendor: string
  status: string
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <MediaCell
        src={row.original.image}
        title={row.original.name}
        description={`by ${row.original.vendor}`}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
  },
]

const filterFields: FilterField[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
    ],
  },
]

export function ProductList({
  products,
  total,
}: {
  products: Product[]
  total: number
}) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  return (
    <DataTable
      columns={columns}
      data={products}
      getRowId={(row) => row.id}
      enableRowSelection
      toolbar={
        <>
          <SearchInput
            containerClassName="w-full sm:w-72"
            placeholder="Search products"
            onSearch={() => setPage(1)}
          />
          <div className="ms-auto">
            <TableFilters
              fields={filterFields}
              value={filters}
              onValueChange={setFilters}
            />
          </div>
        </>
      }
      subToolbar={
        <ActiveFilters
          fields={filterFields}
          value={filters}
          onValueChange={setFilters}
        />
      }
      pagination={{ page, pageSize: 10, total, onPageChange: setPage }}
    />
  )
}
```

`DataTable` also supports sorting, bulk actions, cursor pagination, tree rows (`getSubRows`) and drag-to-reorder (`onReorder`).

### Picking and uploading images

`MediaPickerDialog` is the complete "Add Media" flow: upload with progress, a searchable media library, image details and alt text. It never calls an API itself. Your app passes the items and an `upload` function, so it works with any storage backend.

```tsx
import { useState } from "react"
import {
  Button,
  MediaPickerDialog,
  type MediaItem,
  type UploadFn,
} from "@flycommerce/ui"

const upload: UploadFn = async (file, { signal, onProgress }) => {
  // Call your API here; report progress (0–100) and honour `signal` for cancel.
  const stored = await myApi.upload(file, { signal, onProgress })
  return {
    id: stored.id,
    url: stored.url,
    name: file.name,
    mimeType: file.type,
    size: file.size,
  }
}

export function ProductImages({ library }: { library: MediaItem[] }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<MediaItem[]>([])

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add images</Button>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        multiple
        max={5}
        value={images}
        onConfirm={setImages}
        upload={upload}
        items={library}
      />
    </>
  )
}

declare const myApi: {
  upload(
    file: File,
    options: { signal: AbortSignal; onProgress: (percent: number) => void }
  ): Promise<{ id: string; url: string }>
}
```

## Design tokens

All colours, radii, shadows and type sizes are CSS variables defined once in the theme, with light and dark values. Use them through Tailwind utilities, never raw hex values:

| Purpose          | Utilities                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces         | `bg-page`, `bg-background`, `bg-card`, `bg-card-header`, `bg-muted`                                                                                   |
| Text             | `text-foreground`, `text-foreground-secondary`, `text-muted-foreground`                                                                               |
| Brand and status | `bg-primary` (fills), `text-primary-ink` (blue text and links), `bg-primary-subtle`, `text-success-strong`, `text-warning-strong`, `text-destructive` |
| Lines            | `border-border`, `border-border-subtle`                                                                                                               |
| Shape and depth  | `rounded-control`, `rounded-card`, `shadow-1`, `shadow-card`, `shadow-2`, `shadow-pop`                                                                |
| Typography       | `type-page-title`, `type-card-title`, `type-body`, `type-field-label`, `type-hint`, `type-table-header` …                                             |

The library leaves Tailwind's own radius and shadow scales untouched, so installing it never changes existing parts of your app.

## Icons

Use the semantic icon registry rather than importing icon glyphs directly. The name describes the meaning, so a glyph can change in one place:

```tsx
import { Button, Icon } from "@flycommerce/ui"

export function AddOrder() {
  return (
    <Button>
      <Icon name="orders" /> New order
    </Button>
  )
}
```

The gallery's [Icons page](https://ui.flycommerce.com/#icons) lists all 150 names.

## Accessibility and localisation

- Built on Radix primitives: correct roles, focus management and keyboard support.
- Focus rings appear for keyboard users only.
- Icon-only buttons take an `aria-label`. Inputs pair with a `FieldLabel`.
- Every component that renders text accepts label props (`labels`, `placeholder`, `confirmLabel`, …). Pass your translations; the English defaults are for prototyping.
- Layouts use logical properties, so they mirror correctly in RTL.

## Building with Claude Code

This repository is also a Claude Code plugin marketplace. The `flycommerce-ui` plugin teaches Claude which component to use, the design tokens, icon names, screen recipes and the migration path from older UI kits:

```
/plugin marketplace add getdokan/flycommerce-ui
/plugin install flycommerce-ui@flycommerce-ui
```

See [plugin/README.md](https://github.com/getdokan/flycommerce-ui/blob/main/plugin/README.md) to enable it for a whole repository.

## Versioning

The package follows [semantic versioning](https://semver.org). While the version is `0.x`, a minor release may include breaking changes; each one is listed in the [changelog](https://github.com/getdokan/flycommerce-ui/blob/main/CHANGELOG.md).

## Security

Please report vulnerabilities privately; see [SECURITY.md](https://github.com/getdokan/flycommerce-ui/blob/main/SECURITY.md).

## Contributing

See [CONTRIBUTING.md](https://github.com/getdokan/flycommerce-ui/blob/main/CONTRIBUTING.md) for local development, the component rules and the release process.

## License

[MIT](https://github.com/getdokan/flycommerce-ui/blob/main/LICENSE)
