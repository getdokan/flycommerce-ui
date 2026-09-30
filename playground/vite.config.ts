import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { readFileSync } from "node:fs"
import { defineConfig } from "vite"

import { demoSourcePlugin } from "./demo-source-plugin"

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)

export default defineConfig({
  root: import.meta.dirname,
  define: { __UI_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss(), demoSourcePlugin(import.meta.dirname)],
  build: {
    outDir: path.resolve(import.meta.dirname, "../site-dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../src"),
    },
  },
})
