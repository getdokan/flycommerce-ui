// jsdom can't compute colours, so contrast is checked here in a real browser, light and dark.
import { existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { createRequire } from "node:module"
import path from "node:path"
import puppeteer from "puppeteer-core"

const root = path.resolve("site-dist")
const axeSource = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8"
)

const browsers = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean)
const executablePath = browsers.find((file) => existsSync(file))
if (!executablePath) {
  console.error("No Chrome found; set CHROME_PATH.")
  process.exit(1)
}
if (!existsSync(path.join(root, "index.html"))) {
  console.error("site-dist is missing; run pnpm build:site first.")
  process.exit(1)
}

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json",
}
const server = createServer((req, res) => {
  let url = "/"
  try {
    url = decodeURIComponent((req.url ?? "/").split("?")[0])
  } catch {}
  let file = path.join(root, url)
  if (
    !file.startsWith(root + path.sep) ||
    !existsSync(file) ||
    !statSync(file).isFile()
  )
    file = path.join(root, "index.html")
  res.setHeader(
    "content-type",
    types[path.extname(file)] ?? "application/octet-stream"
  )
  res.end(readFileSync(file))
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const { port } = server.address()

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox"],
})
let failures = 0
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  // Demo embeds (video, analytics) can keep the network busy, so idle is best-effort.
  await page.goto(`http://127.0.0.1:${port}/#welcome`, { waitUntil: "load" })
  await page
    .waitForNetworkIdle({ idleTime: 500, timeout: 20_000 })
    .catch(() => {})
  await page.waitForSelector("section[id]")
  await page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none!important;animation:none!important}",
  })
  await page.addScriptTag({ content: axeSource })

  for (const theme of ["light", "dark"]) {
    await page.evaluate((dark) => {
      const html = document.documentElement
      html.toggleAttribute("data-theme", dark)
      if (dark) html.setAttribute("data-theme", "dark")
      html.classList.toggle("dark", dark)
    }, theme === "dark")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const violations = await page.evaluate(async () => {
      // WCAG 1.4.3 exempts inactive controls, so faded disabled parts aren't scanned.
      const result = await window.axe.run(
        {
          include: [document],
          exclude: [
            ['[data-disabled]:not([data-disabled="false"])'],
            ['[aria-disabled="true"]'],
          ],
        },
        { runOnly: ["color-contrast"] }
      )
      return result.violations.flatMap((rule) =>
        rule.nodes.map((node) => ({
          target: node.target.join(" "),
          text: (node.html.match(/>([^<]{1,60})</) ?? [])[1] ?? "",
          message: node.any[0]?.message ?? "",
        }))
      )
    })

    failures += violations.length
    console.log(`${theme}: ${violations.length} contrast violation(s)`)
    for (const v of violations)
      console.log(`  ${v.text.trim() || v.target}\n    ${v.message}`)
  }
} finally {
  await browser.close()
  server.close()
}
process.exit(failures > 0 ? 1 : 0)
