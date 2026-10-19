# Changelog

All notable changes to `@flycommerce/ui` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org).

## [Unreleased]

### Added

- `StatCard layout="label-first"`: the label over the value, as in the Settings and report figure tiles. A 14px medium label in `foreground-secondary`, then the value at 24px semibold in tabular figures; an `action` such as an `InfoTooltip` sits right after the label. `value-first` stays the default and looks exactly as before; `hero` applies to it only.
- `StatCard valueSize="sm"`: a 16px label-first value (16/24, weight 600, -0.2px, tabular figures) for figures that read as a phrase, such as a payment date or a plan name.
- `StatCard foot`: a muted 12px line under the value, or a `Progress` meter.
- `StatGroup`: joins stat cards into one band. The cards sit on a 1px gap over `border-subtle`, so hairlines divide them at any column count. Pass the columns per band in `className`, such as `sm:grid-cols-2`, `grid-cols-2 lg:grid-cols-4` or `sm:grid-cols-3`; without one the band is a single column. It is a list for screen readers (name it with `aria-label` or `aria-labelledby`), and each card in it is a list item without its own corners or shadow. The band is a card of its own; `flush` drops that surface for use inside a `Card`, where `className="border-t border-border-subtle"` divides it from the content above.
- `type-stat-value` and `type-stat-value-sm` utilities: P3 H6 and Body S, semibold, in tabular figures, used by label-first stat cards.
- `SheetContent size`: the width of a left or right sheet from `sm` up, `sm` (24rem, the default and today's width), `md`, `lg`, `xl`, `2xl`, `3xl` or `4xl` (28 to 56rem), e.g. `lg` for a create or edit form and `2xl` for a wide one. Top and bottom sheets ignore it. A plain `sm:max-w-lg` class never beat the built-in width; a `data-[side=right]:sm:max-w-*` class still does.
- `Progress tone`: `default`, `success`, `warning` or `destructive` colours the fill, e.g. a seats meter that turns orange at the plan limit, instead of overriding `[data-slot=progress-indicator]`.
- `Table variant="list"`: a light table for lists inside a card. The header is 12px medium in sentence case with no grey band, cells are 14px and wrap, rows are divided by hairlines, and only rows with an `onClick` tint on hover (and show a focus ring when focusable). The first and last columns line up with a 20px card edge, 24px from `sm`.
- `Table size`: `sm` and `lg` move the row padding one 4px step tighter or roomier than `default`: 8, 12 or 16px in a list table, 16, 20 or 24px (header included) in a default one.
- `DescriptionList` and `DescriptionItem`: read-only facts as divided label and value rows (`dl`, `dt`, `dd`), the muted label on the left and the value on the right, stacking when the row is too narrow. Pass the label as `label` and the value as children.
- `ConfirmDialog acknowledgeLabel`: a checkbox with this label that must be ticked before the confirm button enables, e.g. "I am sure I want to remove them". It clears when the dialog closes and works together with `confirmText`.

### Changed

- `SaveBar` matches the dashboard's unsaved-changes bar (`BottomActionBar`): a `gray-900` bar (new `inverse` token) with 8px corners, as wide as the dashboard's (`max-w-lg` up to `max-w-4xl`), `px-6 py-4`, a white message, an outlined Discard and a normal-size Save. The default `saveLabel` is now "Save changes". New `saveMenu` adds a chevron joined to Save for extra save options, like the dashboard's split button.
- **Breaking:** `sonner` is now a peer dependency (`^2`) instead of a dependency, so `toast()` from this package and an app's own `<Toaster>` share one copy of sonner. With the library's own copy, an app that already had sonner rendered its `<Toaster>` from one copy while `toast()` called the other, so those toasts never appeared. Apps must have `sonner@^2` installed: npm and pnpm add peer dependencies automatically, but Yarn doesn't, so a Yarn app fails to build with "Could not resolve 'sonner'" until it runs `yarn add sonner@^2`.

### Fixed

- `Progress` passes `value` to the progress bar, so screen readers announce it: `aria-valuenow` and `aria-valuetext` ("62%", or your `getValueLabel`) are set, and `data-state` is `loading` or `complete` instead of always `indeterminate`.
- `Progress` fills from the right in right-to-left layouts.
- `ConfirmDialog`: the typed-confirmation label reads as one sentence again. It had gaps around the name, because the label lays out its children as a flex row with a gap. Only the text to type is bold now, so it stands out from the regular-weight "Type … to confirm".
- Claude plugin: `references/tokens.md` lists every light-theme token. It left out 20 of the 61, among them `--muted-foreground`, `--primary-subtle`, `--ring` and `--radius`, because the generator skipped the line after any token without a comment.
- Screen-reader-only text no longer stretches the page in apps whose content scrolls inside a container (an app shell with a scrolling `main`). `sr-only` text is absolutely positioned. In `DataTable` (its loading status and the "More pages" label of its page numbers), `PaginationEllipsis`, `CopyButton` and `SidebarTrigger` it had no positioned ancestor inside the component, so it was placed against the page instead, at its unscrolled position far below the window. That made the document taller than the window, and scrolling past the end of the content moved the whole layout up. Each now has a positioned parent of its own.

## [0.3.1] - 2026-10-06

### Fixed

- Inside a FlyCommerce app page, the 24rem popup cap from 0.3.0 now applies only to popups that size themselves to the space left in the frame: date pickers, menus, popper-mode selects, `RichSelect` and `TreeSelect`, which scroll past it. Plain `Popover` content is no longer cut off at 24rem without a scrollbar, tooltips and hover cards are untouched, and an app can override the cap with its own `!max-h-*` class.

## [0.3.0] - 2026-10-06

New: `SettingsNav`, `SegmentedControl`, `CardBrandIcon`, numbered pages, row links and a refreshing state in `DataTable`, and a `tailwind-core.css` entry for apps adopting the library page by page.

**Check when upgrading:**

- `DataTable`: clicks on a link, button, input or checkbox inside a row no longer call `onRowClick`. A cell that is a bare `<button>` relying on the row click needs its own handler.
- `StatusBadge`: `data-status` now holds the normalised key (`on_hold` becomes `on hold`), so CSS or tests that select `[data-status=on_hold]` need updating.
- `Alert`: pass `AlertAction` as a direct child of `Alert`. An action inside a fragment or a wrapper component isn't detected.

### Added

- Claude plugin 0.3.1: pages of an installable FlyCommerce app hand off to the `flycommerce-apps` and `flycommerce-api` plugins (from the `flycommerce` marketplace in `getdokan/flycommerce-sdk`) for framing, session tokens and store calls.
- `SettingsNav`: a two-pane settings area. A rail of grouped links (icon tile, active state) with a filter over labels, group labels and keywords, a live result count, an empty state and an opt-in shortcut key (`shortcutKey="/"`); below a 56rem-wide area, a "Jump to section" menu that navigates only on Enter or click. Links render through `renderLink` for router links; every string is in `labels`.
- `SegmentedControl` and `SegmentedControlItem`: one required choice among a few short options (e.g. Metric / Imperial) with the segmented `NavTabs` look. Radio semantics: arrow keys move and select, it can't be emptied, and `value` or `defaultValue` is required; `size="sm"` and `disabled` on the group or an item.
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

- Inside a FlyCommerce app page, popups (date pickers, selects, menus, rich and tree selects) are no longer squeezed into a small scrolling box: they're capped at 24rem instead of the space left in the frame, which is only as tall as the page. With `@flycommerce/app-bridge` growing the frame while a popup is open, the whole popup shows.
- In apps that use `@tailwindcss/forms`, focused `Input`, `Textarea` and `NativeSelect` no longer get the plugin's 1px blue ring on top of their own focus border, and `NativeSelect` no longer shows the plugin's chevron next to its own.
- `DataTable`: with a `title`, the `toolbar` now gets its own full-width row below `sm`, so a `SearchInput` with `containerClassName="w-full sm:w-72"` fills it instead of shrinking to its content. Wider screens are unchanged.
- `RichTextEditor`: `@tiptap/core` and `@tiptap/extensions` are now dependencies, so an app on another tiptap version no longer mixes two copies of `@tiptap/core` and fails to build (`"isValidCSSStyleValue" is not exported by @tiptap/core`).
- `AlertAction` no longer overlaps the title and description: it sits beside the text when there's room and wraps under it when there isn't, whatever the label length, with or without an icon. An alert with an action still sizes to its content in a popover or other shrink-to-fit parent. Pass `AlertAction` as a direct child of `Alert`.

### Changed

- `StatusBadge` matches API values in snake_case or kebab-case (`on_hold`, `partially-refunded`) and normalises `tones` keys the same way; `data-status` holds the normalised key, and `partially paid`, `ready for pickup` (warning) and `partial` (default) are built in.
- `DataTable` loads `@dnd-kit` only when `onReorder` is set: drag-and-drop is a separate module imported on first use, so tables without reordering no longer ship it (about 59 KB minified, 17 KB gzipped, less for an app that only uses `DataTable`). The module starts loading as soon as a table with `onReorder` mounts, even while it is still `loading`. A reorderable table renders its rows straight away and enables the drag handles once the module has loaded, without moving anything; if the module fails to load (an old tab after a deploy), the rows stay, without drag handles, instead of the table failing, and a console warning says why.

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
