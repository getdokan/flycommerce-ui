// Adds `.js` to relative imports in dist/**/*.d.ts so the types resolve under
// `moduleResolution: node16 | nodenext`, not only under bundler resolution.
import fs from "node:fs"
import path from "node:path"

const dist = path.resolve(import.meta.dirname, "../dist")
const specifier = /((?:from|import)\s*\(?\s*)(["'])(\.{1,2}\/[^"']+)\2/g
let fixed = 0

for (const file of fs.readdirSync(dist, { recursive: true })) {
  if (!file.endsWith(".d.ts")) continue
  const full = path.join(dist, file)
  const dir = path.dirname(full)
  const source = fs.readFileSync(full, "utf8")
  const next = source.replace(specifier, (match, lead, quote, spec) => {
    if (/\.(js|mjs|cjs|json|css)$/.test(spec)) return match
    const target = path.resolve(dir, spec)
    let resolved
    if (fs.existsSync(`${target}.d.ts`)) resolved = `${spec}.js`
    else if (fs.existsSync(path.join(target, "index.d.ts")))
      resolved = `${spec}/index.js`
    else throw new Error(`${file}: can't resolve "${spec}"`)
    fixed += 1
    return `${lead}${quote}${resolved}${quote}`
  })
  if (next !== source) fs.writeFileSync(full, next)
}

console.log(`fix-dts-extensions: ${fixed} imports`)
