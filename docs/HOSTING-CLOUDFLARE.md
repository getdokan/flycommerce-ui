# Hosting the FlyCommerce UI gallery on Cloudflare

For DevOps. Written 2026-09-30.

## What is being hosted

Only the **component gallery**: a static website where developers browse every `@flycommerce/ui` component, switch between Preview and Code, and copy examples.

- It is plain static files: one `index.html`, one JS bundle, one CSS file, fonts. About **2.4 MB** in total.
- There is **no server, no API, no database, no environment variables and no secrets**. The site calls nothing of ours.
- The npm package `@flycommerce/ui` is published separately to npmjs.com by GitHub Actions. That is **not** part of this job.

## Build facts

|                   |                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Repository        | `github.com/getdokan/flycommerce-ui` (public)                                                               |
| Production branch | `main`                                                                                                      |
| Node              | **22**                                                                                                      |
| Package manager   | **pnpm 10.33.0**, pinned in `package.json` (`packageManager`). `corepack enable` picks it up automatically. |
| Install           | `pnpm install --frozen-lockfile` (public npm registry only; no `.npmrc` or tokens needed)                   |
| Build             | `pnpm build:site`                                                                                           |
| Output directory  | `site-dist`                                                                                                 |
| Routing           | Single page; sections use `#anchors`, so **no rewrite or redirect rules** are needed                        |
| Headers           | `site-dist/_headers` ships with the build (see below); nothing to configure by hand                         |

This exact sequence was run in a fresh clone on Node 22.23 with corepack (2026-09-30): install and build succeeded, and `site-dist` contained `index.html`, `assets/` and `_headers`.

### Headers included in the build

`playground/public/_headers` is copied into `site-dist/_headers`, which Cloudflare applies automatically:

| Path                                            | Header                                                                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` and `/index.html`                           | `Cache-Control: no-cache`, so a new deploy is visible at once                                                                                                                  |
| `/assets/*` (file names contain a content hash) | `Cache-Control: public, max-age=31536000, immutable`                                                                                                                           |
| everything                                      | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` |

Verified locally with `wrangler pages dev site-dist`: all four headers are present and asset caching is applied.

## Decide before you start

1. **Domain.** Live at `https://ui.flycommerce.com` since 2026-09-30.
2. **Public or staff only.** The gallery contains no secrets, and the npm package will be public anyway, so public is fine. For staff only, put it behind Cloudflare Access (see "Optional: staff only").
3. **Search engines.** If it shouldn't be indexed, add `X-Robots-Tag: noindex` under `/*` in `playground/public/_headers` (a developer change, one line).

## Option A (recommended): Cloudflare Pages, connected to GitHub

Every push to `main` deploys to production. Every pull request gets its own preview URL. Rollback is one click.

This option needs the **Cloudflare GitHub app** installed on the `getdokan` organisation with access to the `flycommerce-ui` repo. That needs a GitHub org owner. If that isn't allowed, use Option B.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `getdokan/flycommerce-ui`.
2. Build settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `pnpm build:site`
   - Build output directory: `site-dist`
   - Root directory: _(leave empty)_
3. Environment variables (Production **and** Preview): `NODE_VERSION` = `22`.
4. Save and deploy. The first build takes about 2 minutes. You get a `*.pages.dev` URL.
5. Check the build log:
   - It should say it's installing with pnpm 10 from `pnpm-lock.yaml`.
   - If it shows a different pnpm major, or a lockfile error, change the build command to `npx pnpm@10.33.0 install --frozen-lockfile && npx pnpm@10.33.0 build:site`.

The dashboard labels above are from Cloudflare's current UI as best we know; if a label differs, the values are what matter.

## Option B: deploy from GitHub Actions with Wrangler

Use this if the Cloudflare GitHub app can't be installed on the org. Deploys run in GitHub; Cloudflare only receives the built files.

1. Create the Pages project once, from any machine logged in to Cloudflare:

   ```bash
   npx wrangler pages project create flycommerce-ui --production-branch=main
   ```

2. Create a Cloudflare API token with the permission **Account → Cloudflare Pages → Edit**, scoped to this account only.
3. In GitHub → `getdokan/flycommerce-ui` → Settings → Secrets and variables → Actions, add:
   - `CLOUDFLARE_API_TOKEN` (the token)
   - `CLOUDFLARE_ACCOUNT_ID` (from the Cloudflare dashboard sidebar)
4. Add `.github/workflows/deploy-gallery.yml`:

   ```yaml
   name: Deploy gallery

   on:
     push:
       branches: [main]
     workflow_dispatch:

   concurrency:
     group: deploy-gallery
     cancel-in-progress: true

   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         deployments: write
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: pnpm
         - run: pnpm install --frozen-lockfile
         - run: pnpm build:site
         - uses: cloudflare/wrangler-action@v3
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             command: pages deploy site-dist --project-name=flycommerce-ui --branch=main
   ```

   `pnpm/action-setup` reads the pnpm version from `package.json`, the same way the repo's existing CI does.

## Custom domain

Pages project → **Custom domains** → **Set up a custom domain** → enter the chosen host (e.g. `ui.flycommerce.com`). If the zone is on this Cloudflare account, the DNS record and certificate are created for you; the certificate takes a few minutes.

## Optional: staff only

Zero Trust → **Access** → **Applications** → **Add** → **Self-hosted**:

- Application domain: the custom domain.
- Policy: allow emails ending in the company domain, or a specific group.

Also protect the `*.pages.dev` hostname, or disable it, so it can't be used to get around Access.

## Check after the first deploy

Run these against the real URL:

```bash
curl -sI https://ui.flycommerce.com/ | grep -iE "^HTTP|cache-control|x-frame-options"
```

Expect `200`, `Cache-Control: no-cache` and `X-Frame-Options: DENY`.

```bash
curl -sI "https://ui.flycommerce.com$(curl -s https://ui.flycommerce.com/ | grep -o '/assets/index-[^"]*\.js' | head -1)" | grep -iE "^HTTP|cache-control"
```

Expect `200` and `Cache-Control: public, max-age=31536000, immutable`.

Then open the site in a browser:

- The sidebar lists the components.
- `/#media-picker` scrolls to "Media picker (Add Media)".
- Its **Code** tab shows source, and the copy button works.
- The moon button switches dark mode.
- The console shows no red errors, apart from two deliberate broken-image examples (`example.invalid/…`).

## Day to day

- **Deploys:** a merge to `main` redeploys automatically. There is no manual step.
- **Rollback:**
  - Option A: Pages project → **Deployments** → pick an earlier one → **Rollback**.
  - Option B: run the workflow again from an earlier commit, or use the same Rollback button (Pages keeps every upload).
- **Leftover config:** `vercel.json` in the repo is from an earlier Vercel plan and can be deleted once Cloudflare is live.
- **Outside resources:**
  - Demo images come from `picsum.photos` and one example links to YouTube; fonts are bundled.
  - If you later add a `Content-Security-Policy`, allow `img-src https://picsum.photos https://fastly.picsum.photos blob: data:`.

## Troubleshooting

| Symptom                                                    | Cause / fix                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Build fails with `ERR_PNPM_…` or "lockfile not up to date" | Wrong pnpm major. Use the `npx pnpm@10.33.0 …` build command (Option A, step 5).                                    |
| Build fails with a Node syntax error                       | `NODE_VERSION` isn't set to 22 for that environment (it must be set for Preview as well as Production).             |
| Old version still shows after a deploy                     | Browser cache from before `_headers` existed. A hard refresh fixes it once; `index.html` is `no-cache` from now on. |
| Page loads but has no styles                               | The output directory isn't `site-dist`, so `assets/` isn't being served.                                            |

Questions about the build: the flycommerce-ui maintainers. Questions about the Cloudflare account, DNS or Access: DevOps.
