# Changelog

All notable changes to `@flycommerce/ui` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org).

## [Unreleased]

### Added

- `SettingsNav`: a two-pane settings area. A rail of grouped links (icon tile, active state) with a filter over labels, group labels and keywords, a live result count, an empty state and a `/` shortcut; below a 56rem-wide area, a "Jump to section" select. Links render through `renderLink` for router links; every string is in `labels`.

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
