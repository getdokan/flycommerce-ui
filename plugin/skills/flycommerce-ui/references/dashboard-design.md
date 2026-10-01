# Dashboard design guide

The look of the redesigned FlyCommerce dashboard (`/admin`), and the `@flycommerce/ui` piece that produces each part of it. Use this when building a new screen or migrating an old one, so it sits next to the redesigned pages without a visible seam.

Source: an audit of the dashboard repo on 2026-10-01 (Figma P3 tokens in `src/assets/styles/partials/tailwind.css`, `TableCard`, `FormSection`, `MultitabFilters`, dokan-ui 2.0.10 `Card` and `AppTab`). The library tokens carry these values, so **never copy the hex values below into a screen**; they are here so you can recognise the patterns in old code.

## Redesigned vs legacy pages

Redesigned pages sit on the grey canvas (`#f1f1f3`) and use borderless white cards with a soft shadow. Legacy pages sit on white and use `border border-gray-200 rounded-sm` boxes. When you touch a legacy page, migrate it to the redesigned look; never extend the legacy look.

Redesigned: overview (`/admin`), products, categories, brands, collections, attributes, reviews, Q&A, orders, returns, refunds, invoices, subscription plans, payouts, vendors, customers, coupons, blogs, support tickets, abuse reports, custom pages, delivery, media, settings (general, SEO, notification, payout, AI, checkout, mobile app, team; tax partly), login.

Still legacy: themes, integrations, email templates, settings for payment, billing, shipping, invoicing, cart, URL redirects, return, policies and delivery, setup guide, welcome.

## Page shell

| Part        | Dashboard                                       | Library                                                    |
| ----------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Canvas      | `#f1f1f3`                                       | `bg-page`                                                  |
| Page title  | `text-2xl font-bold`, subtitle `text-sm` grey   | `PageHeader` > `PageHeaderTitle` + `PageHeaderDescription` |
| Primary CTA | brand blue, 40px, 8px corners, semibold         | `Button` (default)                                         |
| Secondary   | white, `#e2e2e7` border, 8px corners, no shadow | `Button variant="outline"`                                 |
| Save bar    | dark floating bar, Discard + Save               | `SaveBar`                                                  |

## Surfaces

| Pattern                 | Dashboard                                                                               | Library                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Card                    | `rounded-xl bg-white shadow-card`, **no border**                                        | `Card`                                                              |
| Card with a header band | header `bg #f7f7f8`, `border-b #f1f1f3`, `px-5 py-4`, title 16px bold                   | `CardHeader className="border-b"` + `CardTitle` + `CardDescription` |
| Card body               | `p-5`                                                                                   | `CardContent`                                                       |
| Table card              | `TableCard` + `TableCardHeader` (white header, `px-5 py-4`, divider)                    | `DataTable` (`title`, `toolbar`)                                    |
| Stat tile               | `shadow-card rounded-xl p-5`, value 24px over a 12px label, 36px icon chip on the right | `StatCard`                                                          |
| Row dividers            | `border-b #f1f1f3`                                                                      | `border-border-subtle`                                              |

## Shadows

| Dashboard shadow                                         | Used on                         | Library                               |
| -------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| `0 1px 2px -1px rgb(0 0 0/.1), 0 1px 3px rgb(0 0 0/.1)`  | cards, table cards, menus       | `shadow-card`                         |
| `0 1px 2px rgb(0 0 0/.05)` (+ a second 2px layer)        | active tab pill, grouped inputs | `shadow-1`                            |
| `0 0 0 4px rgb(21 93 252/.2)` + blue border              | focus on search and selects     | built into controls (`focus-visible`) |
| `0 2px 20px rgb(0 0 0/.15)`, `0 6px 20px rgb(0 0 0/.08)` | legacy popovers and menus       | `shadow-card` (redesign)              |
| `shadow-xl`                                              | dokan-ui `Modal`                | `Dialog` (built in)                   |

Don't add other shadows. Cards are flat apart from `shadow-card`; nothing hovers with a bigger shadow except media tiles.

## Corners

| Element                               | Radius              | Library                               |
| ------------------------------------- | ------------------- | ------------------------------------- |
| Card, table card, dropzone, thumbnail | 12px (`rounded-xl`) | built in                              |
| Input, select, search, button         | 8px (`rounded-lg`)  | `rounded-control`, built in           |
| Menu, dropdown, popover               | 8px                 | built in                              |
| Tab track / active pill               | 8px / 6px           | `Tabs`, `NavTabs variant="segmented"` |
| Icon chip                             | 8px or round        | `IconChip shape`                      |
| Badge                                 | round pill          | `Badge`, `StatusBadge`                |
| Avatar                                | round               | `Avatar`                              |

Legacy code uses `rounded` / `rounded-sm` (4px) on dokan-ui `Button`, `SimpleInput`, `Modal`, tooltips and status badges. The redesign moved controls to 8px; the library follows the redesign.

## Icons

The dashboard imports `react-icons`, overwhelmingly Feather (`react-icons/fi`), plus a few Heroicons, BoxIcons and Font Awesome glyphs and custom SVGs in `src/components/icons/dashboard/`. The library draws its icons from the same package: Feather (`react-icons/fi`) wherever Feather has the glyph, with the dashboard's own sidebar choices (`FiHome`, `FiShoppingBag`, `FiShoppingCart`, `TbShoppingCartX`, `FiUser` for vendors, `FiLayers`, `FiSliders`, `FiSettings`…), and Lucide (`react-icons/lu`) only for meanings Feather lacks. The dashboard's two custom sidebar SVGs (payouts, marketing) are not copied; the library uses `LuBanknote` and `LuMegaphone`. So:

- Replace every `Fi*` (and the odd `Hi*`, `Bi*`, `Fa*`) with `<Icon name="…" />` using the meaning from `icons.md` (e.g. `FiTrash2` → `delete`, `FiEye` → `reveal`, `HiOutlineDotsHorizontal` → `more`). Filled or heavier sets (Font Awesome, solid Heroicons) don't match; don't bring them back.
- Sizes by context: 16px in buttons and inputs (automatic in `Button`), 20px in nav, settings rows and 36px chips, 12px for inline validation, 24px or more only in empty states (`Empty`).
- Colour comes from the context: muted grey for decoration, `text-foreground-secondary` for settings rows, status tone inside a toned `IconChip`. Never `color="#E64B5F"` or `text-gray-600`.

## Icon chips (icon on a tinted background)

The dashboard hand-builds these in many places with different sizes and colours. Use `IconChip` for all of them:

| Dashboard pattern                                                      | `IconChip`                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Stat tile: `h-9 w-9 rounded-lg bg-surface-faded`, grey icon            | `<IconChip>` (square, md, neutral)                                   |
| Card title: `h-9 w-9 rounded-full bg-surface-faded` + chart icon       | `<IconChip shape="round">`                                           |
| Settings row: `rounded-lg bg-[#F1F1F3] p-1.5`, `size-5 text-[#464654]` | `<IconChip tone="grey">`                                             |
| Customer stats: round, mint / blue / pink tints                        | `<IconChip shape="round" tone="success\|primary\|destructive">`      |
| Driver / checkout: `h-10 w-10 rounded-md/lg bg-gray-100`               | `<IconChip size="lg" tone="grey">`                                   |
| Step number, initials: `bg-primary-50 text-primary-600 rounded-full`   | `<IconChip shape="round" tone="primary">` (or `Avatar` for initials) |
| Warning in a modal: `h-12 w-12 rounded-full bg-amber-100`              | `<IconChip size="xl" shape="round" tone="warning">`                  |
| Empty state: 128px `bg-primary-50` circle                              | `Empty` + `EmptyMedia variant="icon"`                                |

## Tables

| Part         | Dashboard                                                         | Library                                                  |
| ------------ | ----------------------------------------------------------------- | -------------------------------------------------------- |
| Header row   | `bg #f7f7f8`, 12px semibold uppercase grey, `px-4 py-5`           | `DataTable` / `TableHead`                                |
| Cells        | 14px, `px-4 py-5`, `#f1f1f3` dividers                             | `TableCell`                                              |
| Row hover    | `#f7f7f8`                                                         | built in                                                 |
| Product cell | 40px thumbnail with 12px corners, name 14px semibold, "by vendor" | `MediaCell`                                              |
| Row actions  | 32px round ghost button with a horizontal-dots icon               | `Button variant="ghost" size="icon-sm"` + `DropdownMenu` |
| Status       | `StatusBadge` (custom palette, 4px corners)                       | `StatusBadge status`                                     |

## Tabs

Status filters above a table (`MultitabFilters`, dokan-ui `AppTab`): grey `#e2e2e7` track, 8px corners, 4px padding, white active pill with 6px corners and a light shadow, 14px medium text. That is `Tabs` + `TabsList` (default variant). The underline version (`AppTab variant="underline"`, media page) is `TabsList variant="line"`; route tabs use `NavTabs`.

## Forms

- One section per `Card` with a header band (`CardHeader className="border-b"`), fields in `CardContent`.
- Labels 14px medium (`FieldLabel`), inputs 40px with 8px corners (`Input`, `Select`, `SearchInput`), helper text 12px grey (`FieldDescription`), errors red with an icon (`FieldError`).
- Toggles with a description: `SwitchField` rows inside the card, separated by dividers.

## Typography

Inter. Page title 24/700, modal title 18/700, card title 16/700, row title 14/600, body 14/400, label 14/500, helper 12/400, table header 12/600 uppercase. These are the `type-*` utilities in `SKILL.md`; components apply them already.

## Accessibility deviations

The library is a little darker than the dashboard in three places, so text meets WCAG AA (4.5:1). Keep the library's values; don't "fix" them back:

- Unselected tab text is `#464654`; the dashboard's `#8f8fa3` / `#68687e` fails on the grey track.
- Placeholders are `#6b6b80`; the dashboard's `#8f8fa3` is 3.2:1.
- Error red is `#cc2d36`, slightly darker than the original, to pass on grey surfaces.
- Toned icon chips use the library's status tints (`success-subtle`, `primary-subtle`, `destructive-subtle`…), not the customer page's one-off `#E9F8F7` / `#EDF5FE` / `#FAF0F2` with `#00BC8B` icons, which are under 3:1. The neutral (`#f7f7f8`) and grey (`#f1f1f3`) chips match the dashboard exactly.
