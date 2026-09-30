import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { demoSourcePlugin } from "./demo-source-plugin"

export default defineConfig({
  root: import.meta.dirname,
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
