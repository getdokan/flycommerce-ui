import * as React from "react"
import { highlight } from "sugar-high"

import { CopyButton, cn } from "@/index"

export function CodeBlock({
  code,
  copyLabel = "Copy code",
  className,
}: {
  code: string
  copyLabel?: string
  className?: string
}) {
  const html = React.useMemo(() => highlight(code), [code])
  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-lg border bg-page",
        className
      )}
    >
      <CopyButton
        value={code}
        iconOnly
        label={copyLabel}
        className="absolute end-2 top-2 z-10 bg-background"
      />
      <pre className="max-h-[520px] overflow-auto p-4 pe-12 font-mono text-[12.5px] leading-5">
        {/* Our own source, highlighted into spans. */}
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
