"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { FiX as XIcon } from "react-icons/fi"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-[rgb(10_10_16/0.5)] duration-100 supports-backdrop-filter:backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const DialogPaddingContext = React.createContext<"default" | "none">("default")

function DialogContent({
  className,
  children,
  size = "default",
  padding = "default",
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Width from sm upward: sm 400px, default 480px, lg 720px, xl 800px, 2xl 900px, 3xl 960px (keeping a 1rem side margin on narrower screens). */
  size?: "sm" | "default" | "lg" | "xl" | "2xl" | "3xl"
  /** `none` drops the padding and the gap, for a body that runs edge to edge, such as a preview beside a form; pad the parts inside. */
  padding?: "default" | "none"
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        data-padding={padding}
        className={cn(
          "fixed start-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 overflow-y-auto rounded-xl border bg-popover p-6 text-sm text-popover-foreground shadow-pop duration-100 outline-none data-[size=2xl]:sm:max-w-[900px] data-[size=3xl]:sm:max-w-[min(960px,calc(100%-2rem))] data-[size=default]:sm:max-w-[480px] data-[size=lg]:sm:max-w-[720px] data-[size=sm]:sm:max-w-[400px] data-[size=xl]:sm:max-w-[800px] rtl:translate-x-1/2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          padding === "none" && "grid-cols-1 gap-0 p-0",
          className
        )}
        {...props}
      >
        <DialogPaddingContext.Provider value={padding}>
          {children}
        </DialogPaddingContext.Provider>
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="outline"
              className="absolute end-5 top-5 size-9 rounded-lg shadow-1"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">{closeLabel}</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex min-h-9 flex-col justify-center gap-1 pe-12",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel = "Close",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeLabel?: React.ReactNode
}) {
  const padding = React.useContext(DialogPaddingContext)
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "sticky -bottom-6 z-10 -mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-border bg-card-header px-6 py-5 sm:flex-row sm:justify-end sm:gap-4",
        padding === "none" && "bottom-0 mx-0 mb-0",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{closeLabel}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-xl leading-7 font-bold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
