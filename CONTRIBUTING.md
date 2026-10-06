# Contributing to @flycommerce/ui

## Local development

Requires Node 22 and pnpm (the version is pinned in `package.json`; `corepack enable` installs it).

```bash
pnpm install
pnpm dev          # component gallery at http://localhost:5173
pnpm typecheck
pnpm lint
pnpm test         # renders every gallery demo and runs axe accessibility checks on it
pnpm build        # library: dist/ (ESM per component, .d.ts, CSS entries)
pnpm build:site   # gallery: site-dist/ (static site, deployed to ui.flycommerce.com)
pnpm check:package # after build: publint + "Are the types wrong?" on the packed package
```

CI runs all of these, plus the plugin reference check, on every push and pull request. A new component needs a gallery demo, and that demo is then covered by the tests automatically.

## Where things live

| Path                        | What                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `src/components/ui/`        | shadcn/Radix components, owned and restyled here                                |
| `src/components/`           | FlyCommerce patterns built from them (`DataTable`, `MediaPickerDialog`, …)      |
| `src/styles/theme.css`      | **Design tokens**: the only place colours, radii, shadows and fonts are defined |
| `src/styles/components.css` | Token → Tailwind mapping, `type-*` utilities, variants                          |
| `src/styles/base.css`       | Global base layer (`body`, `*` border and outline colours, font)                |
| `src/styles/tailwind.css`   | Entry for Tailwind apps; `tailwind-core.css` is the same without `base.css`     |
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
2. **Restyle it** to the design (Figma or the PM prototype) using tokens. shadcn writes `lucide-react` imports; switch them to `react-icons/fi` (Feather, as the dashboard uses), or `react-icons/lu` when Feather has no match.
3. **Export it** from `src/index.ts`.
4. **Add a gallery section** in `playground/`:
   - register it in `demos.tsx` with a `source` badge and search `keywords`;
   - its **Code** tab is generated from the demo automatically, so write the demo the way an app should use the component.
5. **Update the plugin:**
   - run `pnpm skill:refs`;
   - edit `plugin/skills/flycommerce-ui/SKILL.md` if the "which component" guidance changes.
6. **Add a line** to `CHANGELOG.md` under **Unreleased**.

## Commit messages

Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <summary>
```

| Type | For |
|---|---|
| `feat` | something new people can use |
| `fix` | a bug fix |
| `perf` | faster or smaller, same behaviour |
| `refactor` | a code change that doesn't change behaviour |
| `docs` | documentation only |
| `test` | tests only |
| `build` | the build, dependencies or release configuration |
| `ci` | GitHub Actions |
| `chore` | anything else, such as a release |

- The scope is optional: the component in kebab-case, such as `data-table` or `rich-text-editor`, or an area: `gallery`, `plugin`, `styles`.
- Write the summary in the imperative, in lower case, with no full stop: `fix(data-table): keep the toolbar on one row`.
- A breaking change adds `!` after the type or scope and says in the body what to change.

PRs are squash-merged, and a check fails the PR until its title follows the format. Keep the commits in the format too: a PR with one commit is squashed under that commit's message.

## Releasing

Releases are automatic once a version tag is pushed: GitHub Actions publishes that version to npm and creates the GitHub release. Versions follow [semantic versioning](https://semver.org); while on `0.x`, breaking changes go in a minor release and are called out in the changelog.

`main` is protected, so the version bump goes through a pull request like any other change.

1. **Open a release PR** from an up-to-date `main`:

   ```bash
   git switch -c release/0.2.0 origin/main
   npm version 0.2.0 --no-git-tag-version
   ```

   In `CHANGELOG.md`, rename **Unreleased** to the new version with today's date, e.g. `## [0.2.0] - 2026-10-15`. The release notes are taken from this section, and the release stops if it's missing. Commit both files as `chore(release): 0.2.0`, push, and open the PR with the same title.

2. **Merge it** with **Squash and merge** once CI is green.

3. **Tag the merge commit.** Only repository admins can push `v*` tags.

   ```bash
   git switch main && git pull
   git tag -a v0.2.0 -m "Release 0.2.0"
   git push origin v0.2.0
   ```

The **Release** workflow then:

- checks that the tag matches `package.json`, is on `main`, and has a changelog section;
- runs typecheck, lint, the tests, the build and the package checks;
- publishes to npm through Trusted Publishing, with provenance;
- creates the GitHub release from the changelog section.

Details:

- **Pre-releases.** A version like `0.2.0-beta.1` is published under the npm tag `next`, so `npm install @flycommerce/ui` keeps giving users the last stable version, and it's marked as a pre-release on GitHub.
- **Re-running.** A failed release can be re-run from the Actions tab (**Re-run failed jobs**). A version that's already on npm is skipped, and the GitHub release is still created.
- **Authentication.** npm Trusted Publishing: on npmjs.com, `@flycommerce/ui` → Settings → Trusted Publisher → GitHub Actions, repository `getdokan/flycommerce-ui`, workflow `release.yml`, no environment. Its permissions must include **npm publish**; with only "npm stage publish" the publish fails with `E403 OIDC permission denied`. No npm token is stored in GitHub. Keep the `NPM_TOKEN` secret unset: if it exists, the workflow uses it instead, and the package's 2FA policy rejects token publishes.
- **Mistakes.** A published version can't be reused, even after it's unpublished. If a release is wrong, fix it and release the next patch version.
