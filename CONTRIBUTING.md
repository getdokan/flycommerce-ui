# Contributing to @flycommerce/ui

## Local development

Requires Node 22 and pnpm (the version is pinned in `package.json`; `corepack enable` installs it).

```bash
pnpm install
pnpm dev          # component gallery at http://localhost:5173
pnpm typecheck
pnpm lint
pnpm build        # library: dist/ (ESM per component, .d.ts, CSS entries)
pnpm build:site   # gallery: site-dist/ (static site, see docs/HOSTING-CLOUDFLARE.md)
```

CI runs typecheck, lint, both builds and the plugin reference check on every push.

## Where things live

| Path                        | What                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `src/components/ui/`        | shadcn/Radix components, owned and restyled here                                |
| `src/components/`           | FlyCommerce patterns built from them (`DataTable`, `MediaPickerDialog`, …)      |
| `src/styles/theme.css`      | **Design tokens**: the only place colours, radii, shadows and fonts are defined |
| `src/styles/components.css` | Token → Tailwind mapping, `type-*` utilities, variants                          |
| `src/styles/tailwind.css`   | Entry for Tailwind apps                                                         |
| `src/styles/standalone.css` | Source of the precompiled `styles.css` (no CSS reset)                           |
| `src/index.ts`              | Public exports                                                                  |
| `playground/`               | The gallery. `demos.tsx` registers every section                                |
| `plugin/`                   | Claude Code plugin; `references/` is generated                                  |

## Rules for components

- No hex, `rgb()` or arbitrary values in components. Use tokens from `theme.css`, or add a token.
- A different look is a new `variant` or `size`, never a one-off override in an app.
- Every user-visible string is a prop with an English default, so apps can translate it.
- Show default, hover, keyboard focus, disabled, loading and invalid states where they apply.
- Check at 375px, in dark mode and in RTL. No horizontal page scroll.
- Icon-only buttons need `aria-label`; inputs need a label.

## Adding or changing a component

1. **Start from shadcn** when it has the component:
   - `pnpm dlx shadcn@latest add <name>` for a new one;
   - `pnpm dlx shadcn@latest add <name> --diff` to compare ours with upstream.
2. **Restyle it** to the design (Figma or the PM prototype) using tokens.
3. **Export it** from `src/index.ts`.
4. **Add a gallery section** in `playground/`:
   - register it in `demos.tsx` with a `source` badge and search `keywords`;
   - its **Code** tab is generated from the demo automatically, so write the demo the way an app should use the component.
5. **Update the plugin:**
   - run `pnpm skill:refs`;
   - edit `plugin/skills/flycommerce-ui/SKILL.md` if the "which component" guidance changes.
6. **Add a line** to `CHANGELOG.md` under **Unreleased**.

## Releasing

Releases follow [semantic versioning](https://semver.org); while on `0.x`, breaking changes go in a minor release and are called out in the changelog.

1. **Update the files:**
   - move the **Unreleased** changelog entries under the new version with today's date;
   - bump `version` in `package.json`.
2. **Check it** with `pnpm typecheck && pnpm lint && pnpm build`, and merge to `main`.
3. **Publish a GitHub release** tagged `v<version>` (e.g. `v0.2.0`). The **Release** workflow checks that the tag matches `package.json`, rebuilds and publishes to npm.

A published version can't be reused, even after it's unpublished. If a release is wrong, fix it and publish the next patch version.
