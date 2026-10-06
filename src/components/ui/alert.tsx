import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "border-primary/20 bg-primary-subtle text-foreground **:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-primary-ink",
        success:
          "border-success/25 bg-success-subtle text-success-strong **:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-success-strong",
        warning:
          "border-warning/25 bg-warning-subtle text-warning-strong **:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-warning-strong",
        destructive:
          "border-destructive/25 bg-destructive-subtle text-destructive-strong **:data-[slot=alert-description]:text-foreground-secondary *:[svg]:text-destructive-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function isAlertAction(child: React.ReactNode) {
  return React.isValidElement(child) && child.type === AlertAction
}

function isAlertPart(child: React.ReactNode) {
  return (
    React.isValidElement(child) &&
    (child.type === AlertTitle ||
      child.type === AlertDescription ||
      child.type === AlertAction)
  )
}

function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const items = React.Children.toArray(children)
  const actions = items.filter(isAlertAction)
  const icon =
    actions.length > 0 &&
    React.isValidElement(items[0]) &&
    !isAlertPart(items[0])
      ? items[0]
      : null

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {actions.length > 0 ? (
        <>
          {icon}
          <div
            data-slot="alert-content"
            className="row-span-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 group-has-[>svg]/alert:col-start-2"
          >
            <div className="flex max-w-max min-w-0 grow basis-64 flex-col gap-0.5">
              {items.filter((child) => child !== icon && !isAlertAction(child))}
            </div>
            {actions}
          </div>
        </>
      ) : (
        children
      )}
    </div>
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

/** The alert's call to action. Pass it as a direct child of `Alert`: it sits beside the text when there's room and wraps under it when there isn't. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
