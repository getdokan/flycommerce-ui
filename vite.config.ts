import { readFileSync } from "node:fs"
import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))
const externals = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`))

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: "./tsconfig.lib.json", entryRoot: "src" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  publicDir: false,
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
})
