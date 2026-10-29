import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Button,
  ButtonArrow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/index"

describe("Button shape", () => {
  it("leaves the default shape without a data-shape", () => {
    render(<Button>Save</Button>)
    expect(
      screen.getByRole("button", { name: "Save" }).hasAttribute("data-shape")
    ).toBe(false)
  })

  it("marks a pill and keeps the arrow out of its name", () => {
    render(
      <Button shape="pill">
        Upgrade plan
        <ButtonArrow />
      </Button>
    )
    const button = screen.getByRole("button", { name: "Upgrade plan" })
    expect(button.getAttribute("data-shape")).toBe("pill")
    const arrow = button.querySelector('[data-slot="button-arrow"]')
    expect(arrow?.getAttribute("aria-hidden")).toBe("true")
    expect(arrow?.hasAttribute("data-pinned")).toBe(false)
    expect(arrow?.querySelector("svg")).not.toBeNull()
  })

  it("pins the arrow of a full-width pill", () => {
    render(
      <Button shape="pill">
        Start with Grow
        <ButtonArrow pinned />
      </Button>
    )
    const button = screen.getByRole("button", { name: "Start with Grow" })
    expect(
      button
        .querySelector('[data-slot="button-arrow"]')
        ?.hasAttribute("data-pinned")
    ).toBe(true)
  })

  it("keeps a pill link a link", () => {
    render(
      <Button shape="pill" asChild>
        <a href="/billing">
          Change plan
          <ButtonArrow />
        </a>
      </Button>
    )
    const link = screen.getByRole("link", { name: "Change plan" })
    expect(link.getAttribute("data-shape")).toBe("pill")
    expect(link.querySelector('[data-slot="button-arrow"]')).not.toBeNull()
  })

  it("is busy and aria-disabled while loading, and stays focusable", () => {
    render(
      <Button shape="pill" loading>
        Checking with PayPal
        <ButtonArrow />
      </Button>
    )
    const button = screen.getByRole("button", { name: "Checking with PayPal" })
    expect(button.getAttribute("aria-busy")).toBe("true")
    expect(button.getAttribute("aria-disabled")).toBe("true")
    expect((button as HTMLButtonElement).disabled).toBe(false)
  })
})

describe("Button loading", () => {
  function Retry({ onClick }: { onClick: () => void }) {
    const [loading, setLoading] = React.useState(false)
    return (
      <Button
        loading={loading}
        onClick={() => {
          onClick()
          setLoading(true)
        }}
      >
        Try again
      </Button>
    )
  }

  it("keeps focus when it starts loading", async () => {
    const user = userEvent.setup()
    render(<Retry onClick={() => {}} />)
    const button = screen.getByRole("button", { name: "Try again" })
    button.focus()
    await user.keyboard("{Enter}")
    expect(button.getAttribute("aria-busy")).toBe("true")
    expect(document.activeElement).toBe(button)
  })

  it("ignores clicks, Enter and Space while loading", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Retry onClick={onClick} />)
    const button = screen.getByRole("button", { name: "Try again" })
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)

    button.focus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("doesn't submit its form while loading", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <input aria-label="Note" />
        <Button type="submit" loading>
          Save
        </Button>
      </form>
    )
    await user.click(screen.getByRole("button", { name: "Save" }))
    await user.type(screen.getByRole("textbox", { name: "Note" }), "x{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("doesn't open a menu it triggers, by key or press, while loading", async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button loading onKeyDown={onKeyDown}>
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const button = screen.getByRole("button", { name: "Export" })
    button.focus()
    for (const key of ["{Enter}", " ", "{ArrowDown}", "{ArrowUp}"])
      await user.keyboard(key)
    fireEvent.pointerDown(button, { button: 0, pointerType: "mouse" })
    expect(screen.queryByRole("menu")).toBeNull()

    // Other keys still reach the app, and Tab still moves on.
    await user.keyboard("{Home}")
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it("keeps an app's own aria-busy button clickable when it isn't loading", () => {
    const onClick = vi.fn()
    render(
      <Button aria-busy onClick={onClick}>
        Refresh
      </Button>
    )
    const button = screen.getByRole("button", { name: "Refresh" })
    expect(button.hasAttribute("data-loading")).toBe(false)
    expect(button.className).not.toMatch(/aria-busy:pointer/)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("keeps a loading Select trigger closed on the arrow keys", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <SelectPrimitive.Root onOpenChange={onOpenChange}>
        <SelectPrimitive.Trigger asChild>
          <Button loading>Currency</Button>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content>
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Item value="usd">
                <SelectPrimitive.ItemText>USD</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    )
    screen.getByRole("combobox").focus()
    await user.keyboard("{ArrowDown}{ArrowUp}{Enter} ")
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("lets arrow keys through on a loading button that opens no popup", async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    render(
      <Button loading onKeyDown={onKeyDown}>
        Save
      </Button>
    )
    screen.getByRole("button", { name: "Save" }).focus()
    await user.keyboard("{ArrowDown}{ArrowUp}{Enter}")
    expect(onKeyDown).toHaveBeenCalledTimes(2)
  })

  it("stays natively disabled when disabled is set as well", () => {
    render(
      <Button loading disabled>
        Save
      </Button>
    )
    expect(
      (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
  })
})

describe("Button module", () => {
  afterEach(() => {
    vi.doUnmock("react-icons/fi")
    vi.resetModules()
  })

  it("leaves the arrow glyph to ButtonArrow", async () => {
    const factory = vi.fn(async (importOriginal: () => Promise<unknown>) =>
      importOriginal()
    )
    vi.doMock("react-icons/fi", factory)
    vi.resetModules()

    await import("@/components/ui/button")
    expect(factory).not.toHaveBeenCalled()

    await import("@/components/ui/button-arrow")
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
