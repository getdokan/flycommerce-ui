# Changelog

All notable changes to `@flycommerce/ui` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org).

## [0.1.0] - 2026-09-30

The first public release.

### Added

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
- **Icons.** A semantic `<Icon name="…" />` registry with 150 names.
- **Re-exports.** `toast` (from sonner) and the `ColumnDef` type (from TanStack Table), so apps don't need either dependency directly.
- **Styles for any app.** `tailwind.css` for Tailwind 4 apps and a precompiled `styles.css` for apps without Tailwind.
- **Right-to-left** layout support and translatable labels on every component.
- **Claude Code plugin** (`flycommerce-ui`) that teaches Claude the components, tokens, icons and migration map.
