---
name: flycommerce-ui
description: Build, restyle or migrate FlyCommerce product UI with the @flycommerce/ui design system (shadcn + Radix, FlyCommerce tokens). Use whenever you create or edit a screen, form, table, modal, settings page or any React UI in the dashboard, flycom-app, an embedded FlyCommerce app or the starter kit; when implementing a Figma frame or the PM prototype; when replacing @getdokan/dokan-ui, Headless UI, react-select, react-date-range or react-icons; or when someone asks "which component should I use".
---

# Building FlyCommerce UI with @flycommerce/ui

`@flycommerce/ui` is the single source of FlyCommerce's look: shadcn/Radix components restyled to the PM prototype (jamil-mahmud/flycommerce-prototype), with the P3 Figma file filling gaps. Screens compose it; they never restyle it.

Live gallery (every component, variant and state, light/dark/RTL/mobile): run `pnpm dev` in the flycommerce-ui repo, or open the hosted gallery linked from its README.

Generated references in this skill (always current, read them instead of guessing):
- `references/exports.md`: every export and which module it comes from
- `references/icons.md`: every `<Icon name>` value
- `references/tokens.md`: every design token and its Tailwind utility
- `references/migration.md`: dokan-ui / Headless UI / react-select → @flycommerce/ui mapping

## Setup (once per app)

```bash
pnpm add @flycommerce/ui
```

Tailwind v4 apps, in the main CSS file:

```css
@import "tailwindcss";
@import "@flycommerce/ui/tailwind.css";
@import "@flycommerce/ui/fonts.css"; /* Inter, if the app doesn't load it already */
```

Apps without Tailwind: `import "@flycommerce/ui/styles.css"`.

At the app root: wrap in `<TooltipProvider>` (and `<DirectionProvider dir>` for RTL locales), render one `<Toaster />`, and set `data-theme="dark"` (or the `dark` class) on `<html>` for dark mode.

## Hard rules

1. **Import from `@flycommerce/ui` only.** Not `@getdokan/dokan-ui`, not Headless UI, not raw Radix, not `react-select`, not `react-icons`/`lucide-react` directly. If the library lacks something, add it to the library (with a gallery demo) instead of building a one-off in the app.
2. **No raw colours or arbitrary values in screens.** No `#hex`, `rgb()`, `bg-[#…]`, `text-gray-500`, `border-gray-200`. Use tokens: `bg-page` (app canvas), `bg-card`/`bg-background` (surfaces), `text-foreground`, `text-foreground-secondary`, `text-muted-foreground`, `border-border`, `border-border-subtle`, `bg-muted`, `text-primary`, `text-destructive`, `text-success-strong`, `text-warning-strong`, `shadow-1`, `rounded-control` (4px controls), `rounded-xl` (12px cards). See `references/tokens.md`.
3. **Don't restyle components with `className`.** `className` is for layout (width, margin, grid placement). A different look is a `variant` or `size`; if none fits, the variant belongs in the library.
4. **Icons go through `<Icon name="…" />`** using a meaning from `references/icons.md` (e.g. `orders`, `vendors`, `payouts`). Inside `Button`, place the icon as the first child; it sizes itself.
5. **Every user-visible string is translatable.** Components expose label props (`labels`, `confirmLabel`, `placeholder`, `clearLabel`, `closeLabel`…); pass the app's `t()` output. Never leave the English defaults in a localized screen.
6. **Keep accessibility intact.** Icon-only buttons need `aria-label`. Inputs need a `FieldLabel htmlFor`. Don't remove focus rings: they only show for keyboard users.
7. **Mobile first.** Every screen must work at 375px: no horizontal page scroll, toolbars wrap, tables scroll inside their card (DataTable does this).

## Which component

| Need | Use |
|---|---|
| Page title, description, back link, primary actions | `PageHeader`, `PageHeaderBack` (`asChild` with the router `Link`), `PageHeaderContent`, `PageHeaderTitle`, `PageHeaderDescription`, `PageHeaderActions` |
| List of records with search, filters, selection, bulk actions, pagination | `DataTable` (TanStack `ColumnDef[]`; `toolbar`, `subToolbar`, `enableRowSelection`, `bulkActions`, `sortable`, `pagination` offset or cursor, `loading`, `error`, `empty`) |
| Filtering a table | `TableFilters` (filter icon in the toolbar → right-side sheet; field types `select`, `multi`, `range`, `date-range`, `boolean`; applies on "Apply") + `ActiveFilters` in `subToolbar` (removable chips, "Clear all"). Status tabs sit above the table, not inside the sheet. |
| Product / category / vendor cell with a thumbnail | `MediaCell src title description` ("by {vendor}"); image falls back to a placeholder |
| Nested rows (category tree) | `DataTable getSubRows={(row) => row.children} defaultExpanded` |
| Status of an order/product/vendor | `StatusBadge status="Pending"` (maps the word to a tone; pass `tone` or `tones` to override) |
| Other small labels | `Badge variant="success\|warning\|destructive\|default\|secondary\|soon\|outline"`, optional `dot` |
| Primary / secondary / quiet / danger actions | `Button` (default = blue primary, `outline`, `secondary` = blue outline, `ghost`, `destructive` = red text, `destructive-solid`, `link`); `size="sm"` in toolbars; `loading` while saving |
| Router link that looks like a button | `<Button asChild><Link to="…">…</Link></Button>` |
| "Are you sure?" | `ConfirmDialog` (`destructive`, async `onConfirm` keeps it open until done, `confirmText` for typed confirmation) |
| Any other modal | `Dialog` + `DialogContent size="sm\|default\|lg\|xl"`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` |
| Side panel / detail drawer | `Sheet` (side) or `Drawer` (bottom, mobile) |
| Unsaved changes on a form page | `SaveBar open={isDirty}` with `onSave`, `onDiscard`, `loading` |
| Form field | `Field` > `FieldLabel htmlFor required\|optional` + control + `FieldDescription` / `FieldError` |
| Long text | `Textarea`; with a limit → `maxLength` + `showCount` ("12/500 characters") |
| Text / number / email | `Input`; with prefix/suffix (`$`, `USD`, icon) → `InputGroup` + `InputGroupAddon` + `InputGroupInput` |
| Password | `PasswordInput` |
| Search box | `SearchInput onSearch` (debounced, clearable) |
| Pick one of a few fixed options | `Select`; many options with typing → `Combobox`; options from an API → `AsyncCombobox` (`loadOptions`) |
| Free-text multi values (tags, emails) | `TagInput` |
| Option cards (Physical vs Digital product) | `RadioCardGroup` + `RadioCard title description` |
| On/off setting with explanation | `SwitchField title description loading` (bare `Switch` only inside tables) |
| Date / date+time / range with presets | `DatePicker` (`withTime`), `DateRangePicker` (`presets`) |
| File upload area | `Dropzone accept maxSize onFiles onReject` |
| KPI tile | `StatCard label value delta deltaNote icon hero` (at most one `hero` per view); inline growth → `Delta` |
| In-page section switch | `Tabs` + `TabsList` (segmented default, `variant="line"` for underline) |
| Tabs that change the route | `NavTabs` + `NavTabsLink asChild active` |
| Explain a term next to it | `InfoTooltip content="…"`; general hover hint → `Tooltip` |
| Info / success / warning / error message on a page | `Alert variant="info\|success\|warning\|destructive"` |
| Transient feedback | `toast.success("…")` from `sonner` (the app renders `<Toaster />` once) |
| Nothing to show yet | `Empty` + `EmptyMedia variant="icon"` + `EmptyTitle` + `EmptyDescription` + actions |
| Loading | inside tables → `DataTable loading`; a region refreshing → `LoadingOverlay`; first load of a block → `Skeleton` |
| Copy to clipboard | `CopyButton value` (`iconOnly` for compact) |
| Stars | `Rating value` (display) / `Rating value onValueChange` (input) |
| Product/store image | `ImageWithFallback src alt aspectRatio` |

## Typography

Inter throughout. Use the `type-*` utilities for size, weight and spacing and pair them with a colour utility; don't hand-pick `text-[13px] font-semibold`:

`type-page-title` (24/700) · `type-overview-value` (24/600) · `type-kpi-value` (18/700) · `type-card-title` (15/640) · `type-section-label` (14/600) · `type-body` (14/400) · `type-row-title` (13.5/560) · `type-field-label` (12.5/560) · `type-kpi-label` (12/400) · `type-hint` (11.5/400) · `type-badge` (11.5/600) · `type-table-header` (11/700 uppercase) · `type-group-heading` (10.5/650 uppercase).

Components already apply these internally (`PageHeaderTitle`, `CardTitle`, `FieldLabel`, table headers…); reach for the utilities only in custom layout.

## Screen recipes

**List page**

```tsx
<PageHeader>
  <PageHeaderContent>
    <PageHeaderTitle>{t("Products")}</PageHeaderTitle>
  </PageHeaderContent>
  <PageHeaderActions>
    <Button variant="secondary"><Icon name="ai" /> {t("AI Assistant")}</Button>
    <Button asChild><Link to="/products/new"><Icon name="add" /> {t("Add product")}</Link></Button>
  </PageHeaderActions>
</PageHeader>
<Tabs value={status} onValueChange={setStatus}><TabsList>…status tabs…</TabsList></Tabs>
<DataTable
  columns={columns}
  data={data?.items ?? []}
  loading={isLoading}
  error={isError ? t("The server didn't respond.") : undefined}
  enableRowSelection
  bulkActions={(rows) => <Button size="sm" variant="destructive" onClick={() => askDelete(rows)}>{t("Delete")}</Button>}
  toolbar={<>
    <SearchInput containerClassName="w-full sm:w-72" placeholder={t("Search products")} onSearch={setSearch} />
    <div className="ms-auto flex gap-2">
      <Button variant="outline" size="sm"><Icon name="import" /> {t("Import")}</Button>
      <TableFilters fields={filterFields} value={filters} onValueChange={setFilters} />
    </div>
  </>}
  subToolbar={<ActiveFilters fields={filterFields} value={filters} onValueChange={setFilters} />}
  pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage, onPageSizeChange: setPageSize }}
  labels={{ previous: t("Previous"), next: t("Next"), showing: (a, b, n) => t("Showing {{a}} to {{b}} of {{n}}", { a, b, n }) }}
/>
```

Check the icon names you use against `references/icons.md`; `add` and `ai` above are illustrative.

**Form page**: `PageHeader` with `PageHeaderBack`; one `Card` per section (`CardHeader className="border-b"` + `CardTitle` + `CardDescription`, `CardContent` holding `Field`s in a `grid gap-5 sm:grid-cols-2`); `SaveBar open={formState.isDirty}` wired to react-hook-form's `handleSubmit` / `reset`.

**Settings page**: `NavTabs` for sub-pages; a `Card` per group containing `SwitchField` rows; saving toggles show `loading`.

## Before you finish

- Type-check and lint the app.
- Open the screen at desktop and at 375px, in light and dark, and in RTL if the app is localized: no horizontal scroll, nothing clipped, nothing unreadable.
- Grep your diff for `#[0-9a-fA-F]{3,6}`, `-\[`, `gray-`, `lucide-react`, `react-icons`, `@getdokan/dokan-ui`, `@headlessui`: each hit needs a reason or a fix.
- If you added a missing variant or composite, add it to the flycommerce-ui library with a gallery demo, and regenerate this skill's references with `pnpm skill:refs`.
