import * as React from "react"
import { cn } from "cn"

import { Spinner } from "@/components/ui/spinner"

type LoadingOverlayProps = React.ComponentProps<"div"> & {
  loading: boolean
  label?: string
}

/** Dims its content and shows a spinner while `loading`, keeping the layout in place. */
function LoadingOverlay({
  loading,
  label = "Loading",
  className,
  children,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      data-slot="loading-overlay"
      aria-busy={loading || undefined}
      className={cn("relative", className)}
      {...props}
    >
      <div inert={loading || undefined} className={cn(loading && "opacity-50")}>
        {children}
      </div>
      {loading && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" role={undefined} aria-label={undefined} />
          <span className="sr-only">{label}</span>
        </div>
      )}
    </div>
  )
}

export { LoadingOverlay, type LoadingOverlayProps }
