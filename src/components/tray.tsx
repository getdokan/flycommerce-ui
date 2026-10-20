import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const trayVariants = cva("flex flex-col rounded-tray p-1.5 ring-1", {
  variants: {
    tone: {
      primary: "bg-primary-subtle ring-primary/15",
      neutral: "bg-muted ring-border-subtle",
      warning: "bg-warning-subtle/70 ring-warning/20",
      destructive: "bg-destructive-subtle/70 ring-destructive/15",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
})

const trayContentVariants = cva("grow rounded-xl bg-card", {
  variants: {
    tone: {
      primary: "shadow-lead",
      neutral: "shadow-lead",
      warning: "shadow-notice",
      destructive: "shadow-notice",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
})

type TrayProps = React.ComponentProps<"div"> &
  VariantProps<typeof trayVariants> & {
    /** Sits on the tray above the plate, e.g. a notice's icon, title and consequence line. */
    header?: React.ReactNode
    /** Classes for the inner plate, such as its padding or `overflow-hidden`. */
    contentClassName?: string
  }

/** The double-bezel lead: a tinted tray holding a white plate, for the lead of a view or a warning. */
function Tray({
  tone = "primary",
  header,
  className,
  contentClassName,
  children,
  ...props
}: TrayProps) {
  return (
    <div
      data-slot="tray"
      data-tone={tone}
      className={cn(trayVariants({ tone }), className)}
      {...props}
    >
      {header && (
        <div
          data-slot="tray-header"
          className="flex items-center gap-3 px-3.5 pt-2.5 pb-3.5 sm:px-4"
        >
          {header}
        </div>
      )}
      <div
        data-slot="tray-content"
        className={cn(trayContentVariants({ tone }), contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}

export { Tray, trayVariants, type TrayProps }
