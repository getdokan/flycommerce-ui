import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import type { Plugin } from "vite"

const VIRTUAL_ID = "virtual:demo-sources"
const RESOLVED_ID = "\0" + VIRTUAL_ID

type Decl = { name: string; node: ts.Node; file: ParsedFile; pos: number }
type ParsedFile = {
  path: string
  source: ts.SourceFile
  imports: Map<
    string,
    {
      module: string
      imported: string
      namespace?: boolean
      typeOnly?: boolean
    }
  >
  decls: Map<string, Decl>
}

const LIBRARY = "@flycommerce/ui"

/**
 * Builds `{ [demoId]: code }` from playground/demos.tsx: each demo's render body
 * (or the demo component it renders), the local helpers it uses, and imports
 * rewritten to what an app would write.
 */
export function demoSourcePlugin(dir: string): Plugin {
  const entry = path.join(dir, "demos.tsx")
  return {
    name: "flycommerce-demo-sources",
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return
      const files = new Map<string, ParsedFile>()
      const parse = (file: string): ParsedFile => {
        const cached = files.get(file)
        if (cached) return cached
        this.addWatchFile(file)
        const parsed = parseFile(file)
        files.set(file, parsed)
        return parsed
      }
      const sources = extract(parse(entry), parse, dir)
      return `export default ${JSON.stringify(sources)}`
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(dir)) return
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) server.moduleGraph.invalidateModule(mod)
    },
  }
}

function parseFile(file: string): ParsedFile {
  const text = fs.readFileSync(file, "utf8")
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const parsed: ParsedFile = {
    path: file,
    source,
    imports: new Map(),
    decls: new Map(),
  }
  for (const stmt of source.statements) {
    if (
      ts.isImportDeclaration(stmt) &&
      ts.isStringLiteral(stmt.moduleSpecifier)
    ) {
      const module = stmt.moduleSpecifier.text
      const clause = stmt.importClause
      if (!clause) continue
      if (clause.name)
        parsed.imports.set(clause.name.text, { module, imported: "default" })
      const bindings = clause.namedBindings
      if (bindings && ts.isNamespaceImport(bindings)) {
        parsed.imports.set(bindings.name.text, {
          module,
          imported: "*",
          namespace: true,
        })
      } else if (bindings) {
        for (const el of bindings.elements) {
          parsed.imports.set(el.name.text, {
            module,
            imported: (el.propertyName ?? el.name).text,
            typeOnly: el.isTypeOnly || clause.isTypeOnly,
          })
        }
      }
    } else if (
      (ts.isFunctionDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt) ||
        ts.isInterfaceDeclaration(stmt)) &&
      stmt.name
    ) {
      parsed.decls.set(stmt.name.text, {
        name: stmt.name.text,
        node: stmt,
        file: parsed,
        pos: stmt.pos,
      })
    } else if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) {
          parsed.decls.set(d.name.text, {
            name: d.name.text,
            node: stmt,
            file: parsed,
            pos: stmt.pos,
          })
        }
      }
    }
  }
  return parsed
}

function identifiers(node: ts.Node): Set<string> {
  const names = new Set<string>()
  const visit = (n: ts.Node) => {
    if (ts.isIdentifier(n) && !isPropertyName(n)) names.add(n.text)
    ts.forEachChild(n, visit)
  }
  visit(node)
  return names
}

// `a.b`, `{ b: 1 }`, `<X b={1} />`: `b` names a property, not a binding.
function isPropertyName(id: ts.Identifier) {
  const p = id.parent
  return (
    (ts.isPropertyAccessExpression(p) && p.name === id) ||
    ((ts.isPropertyAssignment(p) ||
      ts.isPropertySignature(p) ||
      ts.isMethodDeclaration(p)) &&
      p.name === id) ||
    (ts.isJsxAttribute(p) && p.name === id) ||
    (ts.isQualifiedName(p) && p.right === id)
  )
}

function extract(
  demosFile: ParsedFile,
  parse: (file: string) => ParsedFile,
  dir: string
): Record<string, string> {
  const out: Record<string, string> = {}

  const resolveLocal = (file: ParsedFile, name: string): Decl | undefined => {
    const own = file.decls.get(name)
    if (own) return own
    const imp = file.imports.get(name)
    if (imp && imp.module.startsWith("./")) {
      const target = parse(
        path.resolve(dir, imp.module.replace(/(\.tsx)?$/, ".tsx"))
      )
      return resolveLocal(target, imp.imported)
    }
    return undefined
  }

  const visitDemo = (obj: ts.ObjectLiteralExpression) => {
    let id: string | undefined
    let render: ts.ArrowFunction | undefined
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name))
        continue
      if (prop.name.text === "id" && ts.isStringLiteral(prop.initializer))
        id = prop.initializer.text
      if (prop.name.text === "render" && ts.isArrowFunction(prop.initializer))
        render = prop.initializer
    }
    if (!id || !render) return

    // `render: () => <XDemo />` shows XDemo itself.
    const body = render.body
    const inner = ts.isParenthesizedExpression(body) ? body.expression : body
    let root: Decl | undefined
    if (
      ts.isJsxSelfClosingElement(inner) &&
      ts.isIdentifier(inner.tagName) &&
      inner.attributes.properties.length === 0
    ) {
      root = resolveLocal(demosFile, inner.tagName.text)
    }

    const included = new Map<string, Decl>()
    const imports = new Map<string, Set<string>>()
    let usesReact = false

    const collect = (node: ts.Node, file: ParsedFile, self?: string) => {
      for (const name of identifiers(node)) {
        if (name === self) continue
        if (name === "React" && file.imports.get("React")?.namespace) {
          usesReact = true
          continue
        }
        const imp = file.imports.get(name)
        if (imp && !imp.module.startsWith("./")) {
          const module =
            imp.module === "@/index"
              ? LIBRARY
              : imp.module.replace(/^@\/components\/ui\//, `${LIBRARY}/`)
          if (!imports.has(module)) imports.set(module, new Set())
          const spec =
            imp.imported === name ? name : `${imp.imported} as ${name}`
          imports.get(module)!.add(imp.typeOnly ? `type ${spec}` : spec)
          continue
        }
        const decl = resolveLocal(file, name)
        if (
          decl &&
          !included.has(`${decl.file.path}:${decl.name}`) &&
          decl.node !== root?.node
        ) {
          included.set(`${decl.file.path}:${decl.name}`, decl)
          collect(decl.node, decl.file, decl.name)
        }
      }
    }

    let main: string
    if (root) {
      collect(root.node, root.file, root.name)
      main = root.node.getText(root.file.source)
      if (!/^export /.test(main)) main = `export ${main}`
    } else {
      collect(body, demosFile)
      const jsx = dedent(inner.getText(demosFile.source))
      main = `export function Example() {\n  return (\n${indent(jsx, 4)}\n  )\n}`
    }

    const lines: string[] = []
    if (usesReact) lines.push(`import * as React from "react"`)
    const order = (m: string) => (m === LIBRARY ? 1 : 0)
    for (const [module, names] of [...imports].sort(
      (a, b) => order(a[0]) - order(b[0]) || a[0].localeCompare(b[0])
    )) {
      const list = [...names].sort((a, b) =>
        a.replace(/^type /, "").localeCompare(b.replace(/^type /, ""))
      )
      const inline = `import { ${list.join(", ")} } from "${module}"`
      lines.push(
        inline.length <= 80
          ? inline
          : `import {\n${list.map((n) => `  ${n},`).join("\n")}\n} from "${module}"`
      )
    }

    const helpers = [...included.values()]
      .sort((a, b) =>
        a.file === b.file
          ? a.pos - b.pos
          : a.file.path.localeCompare(b.file.path)
      )
      .filter((d, i, all) => all.findIndex((x) => x.node === d.node) === i)
      .map((d) => d.node.getText(d.file.source).replace(/^export /, ""))

    out[id] =
      [lines.join("\n"), ...helpers, main].filter(Boolean).join("\n\n") + "\n"
  }

  const walk = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) visitDemo(node)
    ts.forEachChild(node, walk)
  }
  walk(demosFile.source)
  return out
}

function dedent(text: string) {
  const lines = text.split("\n")
  const rest = lines.slice(1).filter((l) => l.trim())
  const min = rest.length
    ? Math.min(...rest.map((l) => l.match(/^ */)![0].length))
    : 0
  return [
    lines[0],
    ...lines
      .slice(1)
      .map((l) => l.slice(Math.min(min, l.match(/^ */)![0].length))),
  ].join("\n")
}

function indent(text: string, spaces: number) {
  const pad = " ".repeat(spaces)
  return text
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n")
}
