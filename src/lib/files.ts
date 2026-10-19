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

function matchesAccept(file: File, accept: string) {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule
    )
}

export { sortFiles }
