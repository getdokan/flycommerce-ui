# Changelog

All notable changes to `@flycommerce/ui` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org).

## [Unreleased]

### Added

- `ComboboxChip` `removeLabel` (default "Remove") names the chip's remove button, which had no accessible name. Pass a translation, or a label per chip such as `` `Remove ${value}` ``.

### Changed

- `SelectContent` opens the list 6px below the field, aligned to its start and at least as wide as it, instead of over the field with the chosen row on the value: `position` now defaults to `"popper"`, `align` to `"start"` and `sideOffset` to `2` (the list's own 4px slide makes 6px). The list has 4px inner padding and grows with its items up to 18rem, or the space left if that is less, then scrolls. Pass `position="item-aligned"` for the old placement. Lists that already pass `position="popper"` now start-align, sit 2px further away and stop at 18rem; pass `align="center"` and `sideOffset={0}` to keep their old position.
- `Select` rows are at least 36px tall and 1px apart, and the chosen row is medium weight. While the list is open, the trigger's border is brand blue and its chevron turns up. In the trigger, an icon or flag sits 8px from the value (was 6px), and the chevron sits 8px from it, including in `RichTextEditor`'s block select (was 4px).
- Highlighted menu rows take a soft brand tint with the popover's text colour instead of grey: hover, keyboard focus and open submenus in `DropdownMenu`, `ContextMenu` and `Menubar`, and highlighted rows in `Select`, `Combobox` and `Command`. Check marks are brand blue (`--primary-ink`) in all of them, chosen `Combobox` rows are medium weight like `Select`'s, and destructive items keep their red. The tint is the `--accent` token, which only menu rows use; it now points at `--primary-subtle`. To keep grey rows, set `--accent: #f1f1f3` in your theme.
- Chip pickers: `ComboboxChips` has 6px gaps and 6px × 8px padding, with or without chips. `ComboboxChip` is 26px tall with 13px/18px text and 8px padding (2px beside the remove button). `ComboboxChipsInput` is 26px tall and at least 7rem wide. `TagInput` chips are 26px tall with 6px corners and brand text on a brand tint (13px/18px, medium), and its input is 26px tall. Both inputs use 14px/20px text and the muted text colour for their placeholder.
- `SaveBar` matches the dashboard's unsaved-changes bar (`BottomActionBar`): a `gray-900` bar (new `inverse` token) with 8px corners, as wide as the dashboard's (`max-w-lg` up to `max-w-4xl`), `px-6 py-4`, a white message, an outlined Discard and a normal-size Save. The default `saveLabel` is now "Save changes". New `saveMenu` adds a chevron joined to Save for extra save options, like the dashboard's split button.
- **Breaking:** `sonner` is now a peer dependency (`^2`) instead of a dependency, so `toast()` from this package and an app's own `<Toaster>` share one copy of sonner. With the library's own copy, an app that already had sonner rendered its `<Toaster>` from one copy while `toast()` called the other, so those toasts never appeared. Apps must have `sonner@^2` installed: npm and pnpm add peer dependencies automatically, but Yarn doesn't, so a Yarn app fails to build with "Could not resolve 'sonner'" until it runs `yarn add sonner@^2`.
- `CodeEditor` imports the CodeMirror language pack for its `language` when an editor first needs it, instead of all four with the entry. The editor takes typing straight away; closing tags and indentation follow the language once its pack has loaded, a moment later. Plain text (`"text"`, the default) loads none. In a Vite build (minified, React external), the editor costs 107.8 KB gzipped up front instead of 173.8 KB. When an editor mounts, HTML loads 67.7 KB more, because the HTML pack brings the CSS and JavaScript packs for `<style>` and `<script>`; CSS loads 21.0 KB, JavaScript 44.2 KB and JSON 10.0 KB. Apps still need all four packages installed, since bundlers resolve every `import()` at build time. If a pack fails to load (for example in a tab left open across a deploy), the editor keeps working as plain text and logs one warning.

### Fixed

- In dark mode, highlighted menu rows had no background: `--accent` was the popover's own colour. They now show the dark brand tint.
- In apps that use `@tailwindcss/forms`, the typing box in `ComboboxChips` and `TagInput` no longer gets the plugin's border, white background, padding, 16px text or focus ring.
- `Button variant="link"` with an icon marked `data-icon="inline-start"` or `"inline-end"` no longer gets the size's 12px (10px at `sm`) padding on that side, so it sits flush like a link without an icon, and a leading icon is pulled 3px towards the start so an arrow's tip lines up with the text below it. To pad an icon link again, add `has-data-[icon=inline-start]:ps-3` (`has-data-[icon=inline-end]:pe-3` for a trailing icon).
- `CodeEditor`, a code field on CodeMirror 6, as its own entry point, `@flycommerce/ui/code-editor` (like `@flycommerce/ui/chart`): a file tab with the language badge, Copy and Clear; a line-number gutter that, like the prototype, numbers the empty rows under short code too; HTML, CSS, JavaScript, JSON or plain text, which drive auto-closing tags and indentation (the code itself stays in the plain text colour); Tab indents and Escape then Tab moves on; the cursor's line and column, line and character counts (with the limit when `maxLength` is set); and a "No problems" / "N problems" status from the app's own `problems`, whose lines turn red in the gutter. `value`/`defaultValue`/`onValueChange`, `readOnly`, `disabled`, `invalid`, `minRows`/`maxRows`, every string in `labels`, and a ref with `insertText()` (at the cursor, e.g. a merge tag) and `focus()`. Code stays left-to-right on RTL pages.
- The CodeMirror packages (`@codemirror/commands`, `lang-css`, `lang-html`, `lang-javascript`, `lang-json`, `language`, `state` and `view`) are optional peer dependencies: install them only if you use `@flycommerce/ui/code-editor`. The main entry never imports them.
- `CodeEditor` with `value` is controlled like a `<textarea>`. If the parent doesn't set `value` from `onValueChange`, an edit (typing, a paste, Clear or `insertText()`) is reverted at once and the editor shows `value` again; it used to keep the edit. A parent that passes the new value back keeps its cursor and undo history as before. To let the editor keep its own text, pass `defaultValue` instead of `value`.
- `RichTextEditor` `headingLevels`: the heading levels the toolbar offers and loaded HTML keeps, so `headingLevels={[1, 2, 3, 4, 5, 6]}` loads stored H1 and H4 to H6 as they are instead of turning them into paragraphs. Read once, on mount. The default stays `[2, 3]`. New labels: `heading1`, `heading4`, `heading5`, `heading6`.
- `RichTextEditor` `aiActions`: rewrite actions such as Paraphrase, Extend and Simplify in an "AI Assistant" toolbar menu. `run(html, selection, { signal })` gets the document HTML, plus the selected HTML when text is selected, and resolves to the suggested HTML. While it runs, the editor locks and a panel under the toolbar shows a busy state with Cancel; then it shows the original beside the suggestion with Replace, Insert below, Try again and Discard, acting on the selection when there was one and on the whole document otherwise. A rejected run shows its message inline with Try again. Esc cancels or discards without closing a dialog or sheet around the editor, and editing the text or a new `value` closes the panel. Suggestions pass through the editor's schema before they are shown, so the preview is what gets inserted. `onGenerate` is unchanged. New labels: `aiAssistant`, `aiSuggestion`, `original`, `suggestion`, `writing`, `cancel`, `discard`, `tryAgain`, `insertBelow`, `replace`, `aiError`.
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
