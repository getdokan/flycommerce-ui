# Changelog

## 0.1.0

First release of `@flycommerce/ui`.

- **Theme**: FlyCommerce tokens from the PM prototype (light and dark), with the P3 Figma file where the prototype is silent. Tailwind's stock radius and shadow scales are untouched; use `radius-control`, `radius-card` and `shadow-1/2/pop`.
- **Components**: the full shadcn set on Radix, restyled to the prototype (buttons, forms, badges, cards, tables, tabs, dialogs, sheets, menus, tooltips, toasts, sidebar). Components with no design yet keep shadcn's defaults.
- **Patterns**: PageHeader, DataTable (TanStack), ConfirmDialog, SaveBar, SearchInput, StatusBadge, StatCard, RadioCard, SwitchField, NavTabs, AsyncCombobox, TagInput, PasswordInput, DatePicker, DateRangePicker, Dropzone, RichTextEditor (with an optional "Generate with AI" action), CopyButton, InfoTooltip, LoadingOverlay, Rating, ImageWithFallback.
- **Icons**: semantic `<Icon name="…" />` registry with 150 names.
