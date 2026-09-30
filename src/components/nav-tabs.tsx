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
            ? "gap-0.5 rounded-[9px] border border-border bg-page p-[3px]"
            : "gap-[3px] shadow-[inset_0_-1px_0_var(--border)]",
          className
        )}
        {...props}
      />
    </NavTabsContext.Provider>
  )
}

/** Pass `asChild` to render your router's Link; set `active` for the current route. */
function NavTabsLink({
  className,
  active = false,
  asChild = false,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean; asChild?: boolean }) {
  const variant = React.useContext(NavTabsContext)
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="nav-tabs-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 text-[13px] font-[550] whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring [&_svg]:size-4",
        variant === "segmented"
          ? "rounded-[3px] px-[13px] py-1.5 text-foreground-secondary hover:text-foreground data-active:bg-background data-active:text-primary-ink data-active:shadow-1"
          : "px-3 py-2.5 text-muted-foreground hover:text-foreground focus-visible:ring-inset data-active:text-primary-ink data-active:after:absolute data-active:after:inset-x-2 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:rounded-sm data-active:after:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export { NavTabs, NavTabsLink }
