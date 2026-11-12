"use client"

import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"

type NavTabsVariant = "segmented" | "line"

const NavTabsContext = React.createContext<NavTabsVariant>("line")

/** Tabs that navigate. Links carry `aria-current="page"`; content comes from the route. */
function NavTabs({
  className,
  variant = "line",
  ...props
}: React.ComponentProps<"nav"> & { variant?: NavTabsVariant }) {
  return (
    <NavTabsContext.Provider value={variant}>
      <nav
        data-slot="nav-tabs"
        data-variant={variant}
        className={cn(
          "flex w-fit max-w-full [scrollbar-width:none] items-center overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden",
          variant === "segmented"
            ? "gap-1 rounded-lg bg-border p-1"
            : "gap-[3px] shadow-[inset_0_-1px_0_var(--border)]",
          className
        )}
        {...props}
      />
    </NavTabsContext.Provider>
  )
}

/**
 * Scrolls only the tab row so the link is fully visible. `scrollIntoView` would also scroll the
 * page, which cancels a smooth page scroll already running, e.g. to the section the tab names.
 */
function keepInRow(link: HTMLElement, smooth: boolean) {
  const row = link.closest<HTMLElement>('[data-slot="nav-tabs"]')
  if (!row) return
  const bounds = row.getBoundingClientRect()
  const style = getComputedStyle(row)
  const start = bounds.left + (parseFloat(style.paddingLeft) || 0)
  const end = bounds.right - (parseFloat(style.paddingRight) || 0)
  const { left, right } = link.getBoundingClientRect()
  const delta = left < start ? left - start : right > end ? right - end : 0
  if (delta === 0) return
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  row.scrollBy({ left: delta, behavior: smooth && !reduce ? "smooth" : "auto" })
}

/**
 * Pass `asChild` to render your router's Link; set `active` for the current route.
 * The active link scrolls into view within the row, never moving the page.
 */
function NavTabsLink({
  className,
  active = false,
  asChild = false,
  ref,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean; asChild?: boolean }) {
  const variant = React.useContext(NavTabsContext)
  const Comp = asChild ? Slot.Root : "a"
  const link = React.useRef<HTMLAnchorElement | null>(null)
  const mounted = React.useRef(false)

  const setRef = React.useCallback(
    (node: HTMLAnchorElement | null) => {
      link.current = node
      const cleanup = typeof ref === "function" ? ref(node) : undefined
      if (ref && typeof ref !== "function") ref.current = node
      // A returned cleanup replaces React's call with null, so reset both refs here.
      return () => {
        link.current = null
        if (typeof cleanup === "function") cleanup()
        else if (typeof ref === "function") ref(null)
        else if (ref) ref.current = null
      }
    },
    [ref]
  )

  React.useLayoutEffect(() => {
    const smooth = mounted.current
    mounted.current = true
    if (active && link.current) keepInRow(link.current, smooth)
  }, [active])

  return (
    <Comp
      ref={setRef}
      data-slot="nav-tabs-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring [&_svg]:size-4",
        variant === "segmented"
          ? "rounded-md px-4 py-2 text-foreground-secondary hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-1"
          : "px-3 py-2.5 text-muted-foreground hover:text-foreground focus-visible:ring-inset data-active:text-primary-ink data-active:after:absolute data-active:after:inset-x-2 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:rounded-sm data-active:after:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export { NavTabs, NavTabsLink }
