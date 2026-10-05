import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-1 gap-x-2 gap-y-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:@container/alert has-[>svg]:grid-cols-[auto_1fr] *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "border-primary/20 bg-primary-subtle text-foreground *:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-primary-ink",
        success:
          "border-success/25 bg-success-subtle text-success-strong *:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-success-strong",
        warning:
          "border-warning/25 bg-warning-subtle text-warning-strong *:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-warning-strong",
        destructive:
          "border-destructive/25 bg-destructive-subtle text-destructive-strong *:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-destructive-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "mt-1.5 @max-md/alert:group-has-[>svg]/alert:col-start-2 @md/alert:-col-start-1 @md/alert:row-span-2 @md/alert:row-start-1 @md/alert:ms-2 @md/alert:mt-0 @md/alert:self-center",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
