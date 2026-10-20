import type { FileRejection } from "@/components/dropzone"

type FileRules = {
  accept?: string
  maxSize?: number
  maxFiles?: number
}

function sortFiles(
  files: Iterable<File>,
  { accept, maxSize, maxFiles = Infinity }: FileRules
) {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    if (accept && !matchesAccept(file, accept))
      rejected.push({ file, reason: "type" })
    else if (maxSize !== undefined && file.size > maxSize)
      rejected.push({ file, reason: "size" })
    else if (accepted.length >= maxFiles)
      rejected.push({ file, reason: "count" })
    else accepted.push(file)
  }
  return { accepted, rejected }
}

function rulesOf(accept: string) {
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
}

function matchesAccept(file: File, accept: string) {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return rulesOf(accept).some((rule) =>
    rule.startsWith(".")
      ? name.endsWith(rule)
      : rule.endsWith("/*")
        ? type.startsWith(rule.slice(0, -1))
        : type === rule
  )
}

const FORMAT_NAMES: Record<string, string> = {
  jpeg: "JPG",
  "svg+xml": "SVG",
  webp: "WebP",
  "x-icon": "ICO",
  "vnd.microsoft.icon": "ICO",
}

function describeAccept(accept: string) {
  const rules = rulesOf(accept)
  if (rules.some((rule) => rule.includes("*"))) return ""
  const names = [
    ...new Set(
      rules.map((rule) => {
        const format = rule.startsWith(".")
          ? rule.slice(1)
          : rule.slice(rule.indexOf("/") + 1)
        return FORMAT_NAMES[format] ?? format.toUpperCase()
      })
    ),
  ]
  const last = names.pop()
  return names.length ? `${names.join(", ")} or ${last}` : (last ?? "")
}

export { describeAccept, sortFiles }
