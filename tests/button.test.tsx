import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button, ButtonArrow } from "@/index"

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
