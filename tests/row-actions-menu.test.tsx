import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DirectionProvider,
  Icon,
  RowActionsMenu,
  type RowActionsMenuItem,
} from "@/index"
import { applyTailwind } from "./tailwind"

const items = (
  overrides: Partial<Record<string, Partial<RowActionsMenuItem>>> = {}
) =>
  [
    {
      label: "Open",
      icon: <Icon name="external" />,
      href: "https://cdn.example.com/boutique-tote.jpg",
      target: "_blank",
      ...overrides.open,
    },
    { label: "Copy URL", icon: <Icon name="duplicate" />, ...overrides.copy },
    { label: "Download", icon: <Icon name="export" />, ...overrides.download },
    {
      label: "Delete",
      icon: <Icon name="delete" />,
      destructive: true,
      separatorBefore: true,
      ...overrides.delete,
    },
  ] satisfies RowActionsMenuItem[]

const menuChildren = () =>
  Array.from(screen.getByRole("menu").children).map((child) =>
    child.getAttribute("role") === "separator" ? "—" : (child.textContent ?? "")
  )

describe("RowActionsMenu", () => {
  it("is an icon-only ghost button named by its label, Actions by default", () => {
    const { rerender } = render(<RowActionsMenu items={items()} />)
    const trigger = screen.getByRole("button", { name: "Actions" })
    expect(trigger.getAttribute("data-variant")).toBe("ghost")
    expect(trigger.getAttribute("data-size")).toBe("icon-sm")
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu")
    expect(trigger.querySelector("[data-icon-name=more]")).toBeTruthy()
    expect(trigger.textContent).toBe("")

    rerender(
      <RowActionsMenu label="Actions for boutique-tote.jpg" items={items()} />
    )
    expect(
      screen.getByRole("button", { name: "Actions for boutique-tote.jpg" })
    ).toBeTruthy()
  })

  it("lists the items in order, with a divider before the red one", () => {
    render(<RowActionsMenu items={items()} open />)
    expect(menuChildren()).toEqual([
      "Open",
      "Copy URL",
      "Download",
      "—",
      "Delete",
    ])
    const remove = screen.getByRole("menuitem", { name: "Delete" })
    expect(remove.getAttribute("data-variant")).toBe("destructive")
    expect(
      screen
        .getByRole("menuitem", { name: "Copy URL" })
        .getAttribute("data-variant")
    ).toBe("default")
    expect(remove.querySelector("[data-icon-name=delete]")).toBeTruthy()
  })

  it("drops hidden items and the divider they would leave dangling", () => {
    const { rerender } = render(
      <RowActionsMenu
        items={items({ download: { hidden: true }, delete: { hidden: true } })}
        open
      />
    )
    expect(menuChildren()).toEqual(["Open", "Copy URL"])

    rerender(
      <RowActionsMenu
        items={items({
          open: { hidden: true },
          copy: { hidden: true },
          download: { hidden: true },
        })}
        open
      />
    )
    expect(menuChildren()).toEqual(["Delete"])
  })

  it("renders nothing when every item is hidden", () => {
    const { container } = render(
      <RowActionsMenu items={[{ label: "Delete", hidden: true }]} />
    )
    expect(container.innerHTML).toBe("")
  })

  it("runs an item's onSelect, and keeps clicks and Enter out of the row", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    const onRowClick = vi.fn()
    const onRowKeyDown = vi.fn()
    render(
      <div onClick={onRowClick} onKeyDown={onRowKeyDown}>
        <RowActionsMenu items={items({ copy: { onSelect: onCopy } })} />
      </div>
    )
    await user.click(screen.getByRole("button", { name: "Actions" }))
    await user.click(screen.getByRole("menuitem", { name: "Copy URL" }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).toBeNull()

    screen.getByRole("button", { name: "Actions" }).focus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("menu")).toBeTruthy()
    screen.getByRole("menuitem", { name: "Copy URL" }).focus()
    await user.keyboard("{Enter}")
    expect(onCopy).toHaveBeenCalledTimes(2)

    expect(onRowClick).not.toHaveBeenCalled()
    expect(onRowKeyDown).not.toHaveBeenCalled()
  })

  it("makes an item with href a link, opening a new tab safely", () => {
    render(<RowActionsMenu items={items()} open />)
    const link = screen.getByRole("menuitem", { name: "Open" })
    expect(link.tagName).toBe("A")
    expect(link.getAttribute("href")).toBe(
      "https://cdn.example.com/boutique-tote.jpg"
    )
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    expect(screen.getByRole("menuitem", { name: "Copy URL" }).tagName).toBe(
      "DIV"
    )
  })

  it("leaves a disabled link without its href", () => {
    render(<RowActionsMenu items={items({ open: { disabled: true } })} open />)
    const open = screen.getByRole("menuitem", { name: "Open" })
    expect(open.getAttribute("href")).toBeNull()
    expect(open.getAttribute("aria-disabled")).toBe("true")
  })

  it("renders links through renderLink, e.g. a router's Link", () => {
    const RouterLink = React.forwardRef<
      HTMLAnchorElement,
      React.ComponentProps<"a"> & { to: string }
    >(function RouterLink({ to, ...props }, ref) {
      return <a ref={ref} data-router="" href={to} {...props} />
    })
    render(
      <RowActionsMenu
        items={[{ label: "View order", href: "/admin/orders/7" }]}
        renderLink={(_item, { href, ...props }) => (
          <RouterLink to={href} {...props} />
        )}
        open
      />
    )
    const link = screen.getByRole("menuitem", { name: "View order" })
    expect(link.hasAttribute("data-router")).toBe(true)
    expect(link.getAttribute("href")).toBe("/admin/orders/7")
    expect(link.getAttribute("rel")).toBeNull()
  })

  it("tells the app when it opens, so the row's actions can load then", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<RowActionsMenu items={items()} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("keeps a loading trigger focusable but closed", async () => {
    const user = userEvent.setup()
    render(<RowActionsMenu items={items()} loading />)
    const trigger = screen.getByRole("button", { name: "Actions" })
    expect(trigger.getAttribute("aria-busy")).toBe("true")
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("draws only the spinner while loading, in place of the more icon", () => {
    const { rerender } = render(<RowActionsMenu items={items()} loading />)
    const trigger = () => screen.getByRole("button", { name: "Actions" })
    expect(trigger().querySelectorAll("svg")).toHaveLength(1)
    expect(trigger().querySelector("[data-icon-name=more]")).toBeNull()

    rerender(<RowActionsMenu items={items()} />)
    expect(trigger().querySelectorAll("svg")).toHaveLength(1)
    expect(trigger().querySelector("[data-icon-name=more]")).toBeTruthy()
  })

  it("doesn't light up on hover while disabled or loading", () => {
    const { rerender } = render(<RowActionsMenu items={items()} loading />)
    const trigger = () => screen.getByRole("button", { name: "Actions" })
    expect(trigger().className).toContain("data-loading:hover:bg-transparent")
    rerender(<RowActionsMenu items={items()} disabled />)
    expect(trigger().className).toContain("disabled:hover:bg-transparent")
  })

  it("aligns to the end edge, and follows the direction in RTL", () => {
    render(
      <DirectionProvider dir="rtl">
        <RowActionsMenu items={items()} open />
      </DirectionProvider>
    )
    const menu = screen.getByRole("menu")
    expect(menu.getAttribute("data-align")).toBe("end")
    expect(menu.getAttribute("dir")).toBe("rtl")
  })

  it("keeps a loading or disabled trigger under the pointer, so a click can't reach the row", async () => {
    const { rerender } = render(<RowActionsMenu items={items()} loading />)
    await applyTailwind()
    const trigger = () => screen.getByRole("button", { name: "Actions" })
    expect(getComputedStyle(trigger()).pointerEvents).not.toBe("none")

    rerender(<RowActionsMenu items={items()} disabled />)
    await applyTailwind()
    expect(getComputedStyle(trigger()).pointerEvents).not.toBe("none")
  })

  it("doesn't open from a press on a disabled trigger", () => {
    render(<RowActionsMenu items={items()} disabled />)
    const trigger = screen.getByRole("button", { name: "Actions" })
    expect(trigger.hasAttribute("data-disabled")).toBe(true)
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("lets Tab through to a dialog's focus trap", async () => {
    const user = userEvent.setup()
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Pick a file</DialogTitle>
          <DialogDescription>Choose one.</DialogDescription>
          <Button>First</Button>
          <RowActionsMenu items={items()} />
        </DialogContent>
      </Dialog>
    )
    screen.getByRole("button", { name: "Actions" }).focus()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" })
    )
  })

  it("keeps focus on the same action when the items change while it is open", () => {
    const { rerender } = render(<RowActionsMenu items={items()} open />)
    screen.getByRole("menuitem", { name: "Copy URL" }).focus()
    rerender(<RowActionsMenu items={items({ open: { hidden: true } })} open />)
    expect(document.activeElement?.textContent).toBe("Copy URL")
  })

  it("keeps a hidden item's divider for the next item shown", () => {
    render(
      <RowActionsMenu
        items={[
          { label: "Open" },
          { label: "Copy URL" },
          { label: "Archive", separatorBefore: true, hidden: true },
          { label: "Delete", destructive: true },
        ]}
        open
      />
    )
    expect(menuChildren()).toEqual(["Open", "Copy URL", "—", "Delete"])
  })

  it("returns focus to the trigger after a confirm opened from an item closes", async () => {
    const user = userEvent.setup()
    function Row() {
      const [confirming, setConfirming] = React.useState(false)
      const trigger = React.useRef<HTMLButtonElement>(null)
      return (
        <>
          <RowActionsMenu
            ref={trigger}
            items={[{ label: "Delete", onSelect: () => setConfirming(true) }]}
          />
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            returnFocusTo={trigger}
            title="Delete boutique-tote.jpg?"
            confirmLabel="Delete file"
            onConfirm={() => {}}
          />
        </>
      )
    }
    render(<Row />)
    await user.click(screen.getByRole("button", { name: "Actions" }))
    await user.click(screen.getByRole("menuitem", { name: "Delete" }))
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("alertdialog")).toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Actions" })
    )
  })
})
