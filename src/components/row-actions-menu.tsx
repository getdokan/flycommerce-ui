"use client"

import * as React from "react"
import { cn } from "cn"

import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type RowActionsMenuItem = {
  label: string
  /** An icon element before the label, e.g. `<Icon name="external" />`. */
  icon?: React.ReactNode
  /** Runs when the item is picked, a link included. */
  onSelect?: (event: Event) => void
  /** Makes the item a link. */
  href?: string
  /** The link's target; `"_blank"` opens a new tab with `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  disabled?: boolean
  /** Leaves the item out, e.g. Delete for someone who can't delete; a divider it would leave dangling goes too. */
  hidden?: boolean
  /** Red, for an action that removes something or can't be undone. */
  destructive?: boolean
  /** Starts a group: draws a divider above the item, unless it is the first one shown. A hidden item passes its divider to the next one shown. */
  separatorBefore?: boolean
}

type RowActionsMenuLinkProps = {
  href: string
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  children: React.ReactNode
}

type RowActionsMenuProps = {
  /** Labels must be unique: they key the items. */
  items: RowActionsMenuItem[]
  /** The trigger, e.g. for `ConfirmDialog returnFocusTo` when an item opens a confirm. */
  ref?: React.Ref<HTMLButtonElement>
  /** The trigger's accessible name; name the row, e.g. "Actions for boutique-tote.jpg". */
  label?: string
  /** Renders a link item, e.g. your router's `Link` with these props spread on it. Return one element that forwards its ref and passes on the props the menu adds to it. Defaults to `<a>`. */
  renderLink?: (
    item: RowActionsMenuItem,
    props: RowActionsMenuLinkProps
  ) => React.ReactElement
  /** The menu opened or closed; load the row's actions while it is open, showing a disabled "Loading…" item until they arrive, since a menu with no item shown renders nothing. */
  onOpenChange?: (open: boolean) => void
  open?: boolean
  defaultOpen?: boolean
  align?: "start" | "center" | "end"
  /** Shows a spinner in place of the ⋯ while an action runs. */
  loading?: boolean
  disabled?: boolean
  /** Classes for the trigger. */
  className?: string
}

const stop = (event: React.SyntheticEvent) => event.stopPropagation()

// Only the keys a row acts on: Tab and the arrows still reach a dialog's focus trap or a grid around the menu.
const stopActivation = (event: React.KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") event.stopPropagation()
}

function renderAnchor(
  _item: RowActionsMenuItem,
  props: RowActionsMenuLinkProps
) {
  return <a {...props} />
}

/** The ⋯ menu on a list row or a grid tile: actions and links, a divider, then the red ones; clicks stay out of the row. */
function RowActionsMenu({
  items,
  ref,
  label = "Actions",
  renderLink = renderAnchor,
  onOpenChange,
  open,
  defaultOpen,
  align = "end",
  loading,
  disabled,
  className,
}: RowActionsMenuProps) {
  const shown: { item: RowActionsMenuItem; divider: boolean }[] = []
  let divider = false
  for (const item of items) {
    divider ||= Boolean(item.separatorBefore)
    if (item.hidden) continue
    shown.push({ item, divider: divider && shown.length > 0 })
    divider = false
  }
  if (shown.length === 0) return null

  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          ref={ref}
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          loading={loading}
          data-slot="row-actions-menu"
          // A busy or disabled button that let the pointer through would hand the click to the row under it.
          className={cn(
            "disabled:pointer-events-auto disabled:hover:bg-transparent data-loading:pointer-events-auto data-loading:hover:bg-transparent",
            className
          )}
          // The row or tile around the menu has its own click and Enter; the menu's are kept from it.
          onClick={stop}
          onKeyDown={stopActivation}
        >
          {/* Button draws its spinner before the children; the icon makes way so the two don't overflow it. */}
          {!loading && <Icon name="more" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-auto max-w-80 min-w-44"
        // The menu is portalled, but React still bubbles its events to the row.
        onClick={stop}
        onKeyDown={stop}
      >
        {shown.map(({ item, divider }) => {
          const content = (
            <>
              {item.icon}
              <span className="truncate">{item.label}</span>
            </>
          )
          const link = item.href !== undefined && !item.disabled
          return (
            <React.Fragment key={item.label}>
              {divider && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={item.destructive ? "destructive" : "default"}
                disabled={item.disabled}
                onSelect={item.onSelect}
                asChild={link}
              >
                {link
                  ? renderLink(item, {
                      href: item.href!,
                      target: item.target,
                      rel:
                        item.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined,
                      children: content,
                    })
                  : content}
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  RowActionsMenu,
  type RowActionsMenuProps,
  type RowActionsMenuItem,
  type RowActionsMenuLinkProps,
}
