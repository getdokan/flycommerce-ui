# @flycommerce/ui

FlyCommerce's design system: React components built on [shadcn/ui](https://ui.shadcn.com) and Radix, restyled to the FlyCommerce design guideline. The dashboard, the hub and third-party apps all install this package.

> Status: **pre-release (0.0.0, private)**. The components are shadcn's originals. The theme tokens are shadcn's defaults until the Figma variables are applied.

## Install

```bash
pnpm add @flycommerce/ui
```

Requires React 19.

### Apps using Tailwind CSS v4

```css
/* app.css */
@import "tailwindcss";
@import "@flycommerce/ui/tailwind.css";
@import "@flycommerce/ui/fonts.css"; /* optional: Inter */
```

### Apps without Tailwind

```ts
import "@flycommerce/ui/styles.css"
```

### Use

```tsx
import { Button, Card, CardContent } from "@flycommerce/ui"

<Card>
  <CardContent>
    <Button variant="outline">Save</Button>
  </CardContent>
</Card>
```

Every component can also be imported on its own: `import { Button } from "@flycommerce/ui/button"`.

**Dark mode:** set `data-theme="dark"` (or the `dark` class) on any ancestor.
**RTL:** set `dir="rtl"` and wrap the app in `<DirectionProvider dir="rtl">`.

## Develop

```bash
pnpm install
pnpm dev         # playground at http://localhost:5173
pnpm build       # dist/: ESM per component, .d.ts, CSS entries
pnpm typecheck
pnpm lint
```

| Path | What |
|---|---|
| `src/components/ui/` | Components (shadcn source, owned by us) |
| `src/styles/theme.css` | **Design tokens**: the only place colours, radius and fonts are defined |
| `src/styles/components.css` | Token → Tailwind mapping, variants, animations |
| `src/styles/tailwind.css` | Entry for Tailwind apps |
| `src/styles/standalone.css` | Source of the precompiled `styles.css` (no preflight) |
| `src/index.ts` | Public exports |
| `playground/` | Local gallery for checking components against Figma |

### Pulling a component from shadcn

```bash
pnpm dlx shadcn@latest add <name>        # new component
pnpm dlx shadcn@latest add <name> --diff # compare ours with upstream
```

Then export it from `src/index.ts`.

## Rules

- No hex, rgb or arbitrary values (`[12px]`) in components; use tokens from `theme.css`.
- New look = new token or variant here, never a one-off override in a consuming app.
- Every component shows default, hover, focus-visible, disabled, loading (where relevant) and invalid states.
