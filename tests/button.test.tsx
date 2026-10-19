import { render, screen } from "@testing-library/react"
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

  it("is busy and disabled while loading", () => {
    render(
      <Button shape="pill" loading>
        Checking with PayPal
        <ButtonArrow />
      </Button>
    )
    const button = screen.getByRole("button", { name: "Checking with PayPal" })
    expect(button.getAttribute("aria-busy")).toBe("true")
    expect((button as HTMLButtonElement).disabled).toBe(true)
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
