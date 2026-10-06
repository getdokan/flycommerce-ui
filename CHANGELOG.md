# Changelog

All notable changes to `@flycommerce/ui` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org).

## [Unreleased]

### Added

- Claude plugin 0.3.1: pages of an installable FlyCommerce app hand off to the `flycommerce-apps` and `flycommerce-api` plugins (from the `flycommerce` marketplace in `getdokan/flycommerce-sdk`) for framing, session tokens and store calls.
- `CardBrandIcon brand="visa"`: payment card brand marks for Visa, Mastercard, American Express, Discover, Diners Club and JCB, accepting the brand strings payment APIs return; UnionPay and unknown brands show a generic card. Named after the brand by default, decorative with `label=""`.
- `Icon` name `spreadsheet`, for CSV and spreadsheet files.
- `@flycommerce/ui/tailwind-core.css`: `tailwind.css` without the global base layer (`body` background and text colour, border and outline colours on every element, Inter on `html`), for apps adopting the library page by page. `tailwind.css` and `styles.css` are unchanged.
- `DataTable`: rows with `onRowClick` or the new `getRowHref` are focusable (focus ring) and open with Enter; with `getRowHref`, cmd/ctrl-click, middle-click and cmd/ctrl+Enter open the row's URL in a new tab. Clicks and keys on links, buttons, inputs and checkboxes inside a row, or on content portaled out of it such as menus, no longer open the row, so `stopPropagation` workarounds can go.
- `DataTable`: `refreshing` keeps the current rows and toolbar while data is refetched, dims the rows, shows a thin progress bar at the top of the table (named by `labels.loading`, default "Loading…") and marks the table `aria-busy`. `loading` still shows skeleton rows and wins when both are set.
- `DataTable`: while `loading`, the table is marked `aria-busy` and a visually hidden status announces `labels.loading` (default "Loading…").
- `DataTable`: offset `pagination` takes `showPageNumbers` (numbered pages with first, last and ellipses; `siblingCount`, default 1) and `getPageHref`, which renders the page controls as links so they can be opened in a new tab while a plain click still calls `onPageChange`. New labels: `page`, `morePages`.
- `DataTable`: `labels.pagination` names the pagination landmark (default "Pagination") in offset and cursor mode; `PaginationEllipsis` takes a `label` (default "More pages"), now announced to screen readers instead of hidden.
- `CardContent flush`: edge-to-edge content for a divided list of rows, with no side padding, no gap against a header or footer band and no card padding below it when it comes last.
- `RadioCard` `badge`: a node shown after the title, such as an "Active" `Badge` on the saved option; it wraps under a long title and keeps the title and description where they are in cards without one.
- `SearchInput`: `searchOn="enter"` searches only on Enter (and with `""` on clear or Esc), for lists that refetch or navigate on each search; `onClear` fires when the clear button or Esc empties the field.

### Fixed

- In apps that use `@tailwindcss/forms`, focused `Input`, `Textarea` and `NativeSelect` no longer get the plugin's 1px blue ring on top of their own focus border, and `NativeSelect` no longer shows the plugin's chevron next to its own.
- `DataTable`: with a `title`, the `toolbar` now gets its own full-width row below `sm`, so a `SearchInput` with `containerClassName="w-full sm:w-72"` fills it instead of shrinking to its content. Wider screens are unchanged.
- `RichTextEditor`: `@tiptap/core` and `@tiptap/extensions` are now dependencies, so an app on another tiptap version no longer mixes two copies of `@tiptap/core` and fails to build (`"isValidCSSStyleValue" is not exported by @tiptap/core`).

### Changed

- `StatusBadge` matches API values in snake_case or kebab-case (`on_hold`, `partially-refunded`) and normalises `tones` keys the same way; `data-status` holds the normalised key, and `partially paid`, `ready for pickup` (warning) and `partial` (default) are built in.

## [0.2.0] - 2026-10-01

The library now matches the redesigned dashboard. Every component looks different, so check your screens after upgrading.

### Added

- `IconChip`: an icon on a tinted tile (`tone`, `shape`, `size`), for stat cards, settings rows, card titles and status icons.
- Claude plugin: `references/dashboard-design.md`, a guide to the redesigned dashboard's look (surfaces, shadows, corners, icons, icon chips, tables, tabs, forms) mapped to library components.

### Changed

- **Matches the dashboard redesign.** The look now follows the dashboard's Figma tokens instead of the earlier prototype, so apps built with the library sit next to redesigned dashboard pages without a visible seam. Every component looks slightly different. No props were removed; only the `IconProps` type changed (see Icons below).
  - Neutral greys replace the blue-tinted ones: text `#24242b`/`#464654`/`#68687e`, borders `#e2e2e7`/`#f1f1f3`, page `#f1f1f3`.
  - Controls (buttons, inputs, selects, toggles) are 40px tall with 8px corners, up from 38px and 4px.
  - `Card`, `DataTable` and `StatCard` drop their border for the new `shadow-card`; a `CardHeader` with `border-b` gets a grey header band; card titles are 16px bold.
  - `Tabs` and segmented `NavTabs`: grey track without a border, white active pill, 14px text, dark active label instead of blue.
  - Menus, selects and popovers use 8px corners and `shadow-card`; tooltips are smaller with 4px corners.
  - `StatCard` follows the dashboard overview: value over the label, icon in a 36px chip on the right.
  - Tables: 12px semibold uppercase headers, `px-4 py-5` cells, grey row hover.
  - **Icons now come from `react-icons`, the package the dashboard uses**: Feather (`react-icons/fi`) wherever it has the glyph, the dashboard sidebar's own choices for navigation (`abandonedCart`, `vendors`, `themes`, `integrations`, `support`, `setupGuide` changed glyph), and Lucide (`react-icons/lu`) only where Feather has nothing. `lucide-react` is no longer a dependency. `<Icon name>` values are unchanged; `IconProps` now extends react-icons' `IconType` props instead of Lucide's.
  - Card titles 16px bold; row titles and field labels 14px.
  - `destructive` is slightly darker (`#cc2d36`) to keep 4.5:1 on the grey surfaces.

## [0.1.1] - 2026-09-30

### Fixed

- **README on npmjs.com.** The license badge showed "package not found" (it was cached before the first publish); it's now a fixed MIT badge. Added a CI status badge, and links to the license, changelog and guides now work on the npm page.

### Changed

- Releases are now published from GitHub Actions through npm Trusted Publishing, with provenance.

## [0.1.0] - 2026-09-30

The first public release.

### Added

- **Accessible contrast.** Every text colour meets WCAG AA (4.5:1) on every surface in light and dark mode, checked with axe in the browser. Use `text-primary-ink` for blue text and links; `bg-primary` for blue fills.
- **Design tokens.** Colour, radius, shadow and type tokens with light and dark themes, available as Tailwind utilities (`bg-page`, `text-foreground-secondary`, `rounded-control`, `shadow-1`, `type-card-title`, …). Tailwind's own radius and shadow scales are left untouched.
- **Components.** The full shadcn/ui set on Radix, restyled to FlyCommerce's design. Components that don't have a FlyCommerce design yet keep shadcn's defaults.
- **Forms:**
  - inputs and field labels: `Field`, `PasswordInput`, `SearchInput`;
  - pickers: `AsyncCombobox`, `RichSelect`, `TreeSelect`, `TagInput`, `OptionListEditor`, `RadioCard`, `SwitchField`;
  - dates: `DatePicker`, `DateRangePicker`, with presets;
  - content: `RichTextEditor`, with an optional "Generate with AI" action;
  - files and ratings: `Dropzone`, `Rating`.
- **Data:**
  - `DataTable` (TanStack Table) with selection, sorting, bulk actions, offset or cursor pagination, tree rows, drag-to-reorder, and loading, empty and error states;
  - `TableFilters` and `ActiveFilters`;
  - `MediaCell`, `StatCard`, `StatusBadge`.
- **Media library:** `MediaPickerDialog` (upload with progress, library search, attachment details, video links), `MediaGrid`, `MediaTile`, `MediaDetailsPanel`, `UploadQueue`, `VideoUrlList`.
- **Page patterns:** `PageHeader`, `NavTabs`, `SaveBar`, `ConfirmDialog`, `InfoTooltip`, `LoadingOverlay`, `CopyButton`, `ImageWithFallback`.
- **Charts** as a separate entry point, `@flycommerce/ui/chart`, with `recharts` as an optional peer dependency.
- **Icons.** A semantic `<Icon name="…" />` registry with 150 names.
- **Re-exports.** `toast` (from sonner) and the `ColumnDef` type (from TanStack Table), so apps don't need either dependency directly.
- **Styles for any app.** `tailwind.css` for Tailwind 4 apps and a precompiled `styles.css` for apps without Tailwind.
- **Right-to-left** layout support and translatable labels on every component.
- **Claude Code plugin** (`flycommerce-ui`) that teaches Claude the components, tokens, icons and migration map.
