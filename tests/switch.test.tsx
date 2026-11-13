import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { describe, expect, it, vi } from "vitest"

import { Switch, TooltipProvider } from "@/index"

const REASON = "Shoppers need this email, so it's always sent."

const description = (element: HTMLElement) =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ")

function renderLocked(props: React.ComponentProps<typeof Switch> = {}) {
  const onCheckedChange = vi.fn()
  render(
    <TooltipProvider>
      <Switch
        aria-label="Order confirmed"
        checked
        disabledReason={REASON}
        onCheckedChange={onCheckedChange}
        {...props}
      />
    </TooltipProvider>
  )
  return { toggle: screen.getByRole("switch"), onCheckedChange }
}

describe("Switch", () => {
  it("keeps a plain disabled switch natively disabled, with no tooltip", () => {
    const { container } = render(<Switch aria-label="Vacation mode" disabled />)
    const toggle = screen.getByRole("switch", { name: "Vacation mode" })
    expect((toggle as HTMLButtonElement).disabled).toBe(true)
    expect(toggle.getAttribute("aria-disabled")).toBeNull()
    expect(toggle.getAttribute("aria-describedby")).toBeNull()
    expect(container.querySelector("[data-slot=switch-reason]")).toBeNull()
  })

  it("stays focusable and on, reads as unavailable, and is described by the reason", () => {
    const { toggle } = renderLocked({ disabled: true })
    expect(toggle.getAttribute("aria-checked")).toBe("true")
    expect(toggle.getAttribute("data-state")).toBe("checked")
    expect(toggle.getAttribute("aria-disabled")).toBe("true")
    expect((toggle as HTMLButtonElement).disabled).toBe(false)
    expect(description(toggle)).toBe(REASON)
  })

  it("ignores clicks and keys but still calls onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { toggle, onCheckedChange } = renderLocked({
      checked: undefined,
      defaultChecked: true,
      onClick,
    })

    await user.click(toggle)
    expect(onClick).toHaveBeenCalledTimes(1)
    toggle.focus()
    await user.keyboard(" ")
    await user.keyboard("{Enter}")

    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(toggle.getAttribute("aria-checked")).toBe("true")
  })

  it("shows the reason on keyboard focus and on hover", async () => {
    const user = userEvent.setup()
    const { toggle } = renderLocked()

    await user.tab()
    expect(document.activeElement).toBe(toggle)
    expect((await screen.findByRole("tooltip")).textContent).toBe(REASON)

    await user.tab()
    expect(screen.queryByRole("tooltip")).toBeNull()

    await user.hover(toggle)
    expect((await screen.findByRole("tooltip")).textContent).toBe(REASON)
  })

  it("keeps the reason showing when the switch is pressed", async () => {
    const user = userEvent.setup()
    const { toggle } = renderLocked()

    await user.hover(toggle)
    await screen.findByRole("tooltip")
    await user.click(toggle)
    expect(screen.getByRole("tooltip").textContent).toBe(REASON)

    await user.keyboard(" ")
    expect(screen.getByRole("tooltip").textContent).toBe(REASON)
  })

  it("keeps its focus, value and layout classes when it gets locked", async () => {
    const user = userEvent.setup()
    const view = (reason?: string) => (
      <TooltipProvider>
        <Switch
          aria-label="Order confirmed"
          className="ms-auto"
          disabledReason={reason}
        />
      </TooltipProvider>
    )
    const { rerender } = render(view())
    const toggle = screen.getByRole("switch")
    await user.click(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("true")

    rerender(view(REASON))

    expect(screen.getByRole("switch")).toBe(toggle)
    expect(document.activeElement).toBe(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("true")
    expect(toggle.className).toContain("ms-auto")
    expect(toggle.hasAttribute("data-disabled")).toBe(true)
  })

  it("doesn't open the reason by itself when locked again", async () => {
    const user = userEvent.setup()
    const view = (reason?: string) => (
      <TooltipProvider>
        <Switch aria-label="Order confirmed" disabledReason={reason} />
      </TooltipProvider>
    )
    const { rerender } = render(view(REASON))
    await user.click(screen.getByRole("switch"))
    expect(screen.getByRole("tooltip")).toBeTruthy()

    rerender(view())
    await user.unhover(screen.getByRole("switch"))
    ;(document.activeElement as HTMLElement | null)?.blur()
    rerender(view(REASON))

    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("keeps the reason while focused even after the pointer passes over", async () => {
    const user = userEvent.setup()
    const { toggle } = renderLocked()

    await user.tab()
    await screen.findByRole("tooltip")
    await user.hover(toggle)
    await user.unhover(toggle)

    expect(screen.getByRole("tooltip").textContent).toBe(REASON)
  })

  it("shows the reason when a focused switch gets locked, and Escape hides it", async () => {
    const user = userEvent.setup()
    const view = (reason?: string) => (
      <TooltipProvider>
        <Switch aria-label="Order confirmed" disabledReason={reason} />
      </TooltipProvider>
    )
    const { rerender } = render(view())
    await user.tab()

    rerender(view(REASON))
    expect((await screen.findByRole("tooltip")).textContent).toBe(REASON)

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("locks for a reason made of several parts, as a rich translation returns", () => {
    render(
      <TooltipProvider>
        <Switch
          aria-label="Order confirmed"
          disabledReason={["Shoppers need ", <b key="b">this</b>, " email."]}
        />
      </TooltipProvider>
    )
    expect(screen.getByRole("switch").getAttribute("aria-disabled")).toBe(
      "true"
    )
  })

  it("unlocks when disabled is false, so the reason can follow a condition", async () => {
    const user = userEvent.setup()
    const { toggle, onCheckedChange } = renderLocked({
      disabled: false,
      checked: undefined,
    })
    expect(toggle.getAttribute("aria-disabled")).toBeNull()
    await user.click(toggle)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("keeps the reason after a tap until a press elsewhere or Escape", async () => {
    const user = userEvent.setup()
    const { toggle } = renderLocked()

    await user.click(toggle)
    await user.unhover(toggle)
    ;(document.activeElement as HTMLElement | null)?.blur()
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(screen.getByRole("tooltip").textContent).toBe(REASON)

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("stays open while the pointer moves onto the reason", async () => {
    const user = userEvent.setup()
    const { toggle } = renderLocked()

    await user.hover(toggle)
    const tooltip = await screen.findByRole("tooltip")
    await user.unhover(toggle)
    await user.hover(tooltip.parentElement!)
    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(screen.getByRole("tooltip")).toBeTruthy()
  })

  it("leaves a locked switch out of form data and validation, like disabled", () => {
    render(
      <TooltipProvider>
        <form data-testid="form">
          <Switch
            aria-label="Order confirmed"
            name="orderConfirmed"
            required
            checked
            disabledReason={REASON}
          />
        </form>
      </TooltipProvider>
    )
    const form = screen.getByTestId("form") as HTMLFormElement
    expect(new FormData(form).has("orderConfirmed")).toBe(false)
    expect(form.checkValidity()).toBe(true)
  })

  it.each([0, true])("doesn't lock for a %s reason", (reason) => {
    render(
      <Switch
        aria-label="Vacation mode"
        disabledReason={reason as React.ReactNode}
      />
    )
    const toggle = screen.getByRole("switch")
    expect(toggle.getAttribute("aria-disabled")).toBeNull()
    expect(toggle.querySelector("[data-slot=switch-reason]")).toBeNull()
  })

  it("adds the reason to a description the switch already has", () => {
    render(
      <TooltipProvider>
        <p id="hint">Sent when an order is placed.</p>
        <Switch
          aria-label="Order confirmed"
          aria-describedby="hint"
          disabledReason={REASON}
        />
      </TooltipProvider>
    )
    expect(description(screen.getByRole("switch"))).toBe(
      `Sent when an order is placed. ${REASON}`
    )
  })

  it("treats an empty reason as no reason", () => {
    const { container } = render(
      <Switch aria-label="Vacation mode" disabled disabledReason="" />
    )
    expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
      true
    )
    expect(container.querySelector("[data-slot=switch-reason]")).toBeNull()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <Switch aria-label="Order confirmed" checked disabledReason={REASON} />
      </TooltipProvider>
    )
    const results = await axe.run(container)
    expect(results.violations.map((violation) => violation.id)).toEqual([])
  })
})
