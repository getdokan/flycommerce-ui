import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[78px] w-full rounded-control border border-input bg-background px-3 py-2.5 text-base transition-colors outline-none placeholder:text-placeholder hover:border-placeholder focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted-foreground aria-invalid:border-destructive md:text-sm dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
