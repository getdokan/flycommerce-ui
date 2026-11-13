import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button, CollapsibleCard } from "@/index"

function Section(props: Partial<React.ComponentProps<typeof CollapsibleCard>>) {
  return (
    <CollapsibleCard
      title="Orders and payments"
      description="Updates to shoppers"
      meta="4 of 6 on"
      {...props}
    >
      <p>Order shipped</p>
    </CollapsibleCard>
  )
}

const header = () => screen.getByRole("button", { name: "Orders and payments" })

describe("CollapsibleCard", () => {
  it("names the header button after the title and describes it with the description and meta", () => {
    render(<Section />)

    expect(header().getAttribute("aria-describedby")).toBeTruthy()
    expect(
      header()
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
    ).toEqual(["Updates to shoppers", "4 of 6 on"])
  })

  it("puts the header button inside a heading at the given level", () => {
    render(<Section headingLevel={2} />)

    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading.tagName).toBe("H2")
    expect(heading.contains(header())).toBe(true)
  })

  it("leaves out a description, meta or actions given as false or an empty string", () => {
    render(<Section description={false} meta="" actions={false} />)

    expect(header().hasAttribute("aria-describedby")).toBe(false)
    expect(
      document.querySelector('[data-slot="collapsible-card-description"]')
    ).toBeNull()
    expect(
      document.querySelector('[data-slot="collapsible-card-meta"]')
    ).toBeNull()
    expect(
      document.querySelector('[data-slot="collapsible-card-actions"]')
    ).toBeNull()
  })

  it("defaults to a level 3 heading", () => {
    render(<Section />)

    expect(screen.getByRole("heading", { level: 3 })).toBeTruthy()
  })

  it("starts closed and toggles with a click, Enter and Space", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Section onOpenChange={onOpenChange} />)

    expect(header().getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Order shipped")).toBeNull()

    await user.click(header())
    expect(header().getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Order shipped")).toBeTruthy()
    expect(
      document.getElementById(header().getAttribute("aria-controls")!)
    ).toBeTruthy()

    await user.keyboard("{Enter}")
    expect(header().getAttribute("aria-expanded")).toBe("false")

    await user.keyboard(" ")
    expect(header().getAttribute("aria-expanded")).toBe("true")
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]])
  })

  it("opens by default with defaultOpen", () => {
    render(<Section defaultOpen />)

    expect(header().getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Order shipped")).toBeTruthy()
  })

  it("follows a controlled open, as a search that forces sections open would", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(<Section open onOpenChange={onOpenChange} />)

    expect(screen.getByText("Order shipped")).toBeTruthy()

    await user.click(header())
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(header().getAttribute("aria-expanded")).toBe("true")

    rerender(<Section open={false} onOpenChange={onOpenChange} />)
    expect(header().getAttribute("aria-expanded")).toBe("false")
  })

  it("keeps actions outside the header button, so using them doesn't toggle the card", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <Section
        onOpenChange={onOpenChange}
        actions={<Button onClick={onAction}>Manage team</Button>}
      />
    )

    const action = screen.getByRole("button", { name: "Manage team" })
    expect(header().contains(action)).toBe(false)

    await user.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(header().getAttribute("aria-expanded")).toBe("false")
  })

  it("can't be toggled while disabled", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Section disabled onOpenChange={onOpenChange} />)

    await user.click(header())
    expect(onOpenChange).not.toHaveBeenCalled()
    expect((header() as HTMLButtonElement).disabled).toBe(true)
  })

  it("runs the body edge to edge by default and pads it with padding default", () => {
    const { rerender } = render(<Section defaultOpen />)
    const body = () =>
      screen.getByText("Order shipped").parentElement as HTMLElement

    expect(body().getAttribute("data-padding")).toBe("none")

    rerender(<Section defaultOpen padding="default" />)
    expect(body().getAttribute("data-padding")).toBe("default")
  })

  it("leaves out the description link when there is no description or meta", () => {
    render(
      <CollapsibleCard title="Marketing">
        <p>Back in stock</p>
      </CollapsibleCard>
    )

    expect(
      screen
        .getByRole("button", { name: "Marketing" })
        .hasAttribute("aria-describedby")
    ).toBe(false)
  })
})
