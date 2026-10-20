import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Badge, SwitchField } from "@/index"

const state = (container: HTMLElement) =>
  container.querySelector("[data-slot=switch-field-state]")

describe("SwitchField", () => {
  it("keeps the default look without a state label", () => {
    const { container } = render(
      <SwitchField title="Vacation mode" description="Close the store." />
    )
    const field = container.querySelector("[data-slot=switch-field]")!
    expect(field.getAttribute("data-variant")).toBe("default")
    expect(state(container)).toBeNull()
    const toggle = screen.getByRole("switch", { name: "Vacation mode" })
    expect(toggle.getAttribute("aria-describedby")).toBe(
      screen.getByText("Close the store.").id
    )
  })

  it("shows Enabled or Disabled in the row variant, hidden from screen readers", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <SwitchField
        variant="row"
        title="Product reviews"
        description="Let customers rate products they bought."
      />
    )
    const toggle = screen.getByRole("switch", { name: "Product reviews" })
    expect(container.querySelector("[data-variant=row]")).not.toBeNull()
    expect(state(container)?.textContent).toBe("Disabled")
    expect(state(container)?.getAttribute("aria-hidden")).toBe("true")
    expect(toggle.getAttribute("aria-describedby")).toBe(
      screen.getByText("Let customers rate products they bought.").id
    )

    await user.click(toggle)
    expect(toggle.getAttribute("aria-checked")).toBe("true")
    expect(state(container)?.textContent).toBe("Enabled")
  })

  it("follows a controlled value and takes other words", () => {
    const { container, rerender } = render(
      <SwitchField
        title="Guest checkout"
        stateLabel={{ on: "On", off: "Off" }}
        checked
      />
    )
    expect(state(container)?.textContent).toBe("On")
    rerender(
      <SwitchField
        title="Guest checkout"
        stateLabel={{ on: "On", off: "Off" }}
        checked={false}
      />
    )
    expect(state(container)?.textContent).toBe("Off")
    rerender(
      <SwitchField variant="row" title="Guest checkout" stateLabel={false} />
    )
    expect(state(container)).toBeNull()
  })

  it("toggles from anywhere in the row variant", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <SwitchField
        variant="row"
        title="Address validation"
        description="Check shipping addresses before tax is worked out."
        onCheckedChange={onCheckedChange}
      />
    )
    await user.click(
      screen.getByText("Check shipping addresses before tax is worked out.")
    )
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    await user.click(screen.getByText("Enabled"))
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    expect(onCheckedChange).toHaveBeenCalledTimes(2)
  })

  it("only toggles from the title in the default variant", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <SwitchField
        title="Address validation"
        description="Check shipping addresses before tax is worked out."
        onCheckedChange={onCheckedChange}
      />
    )
    await user.click(
      screen.getByText("Check shipping addresses before tax is worked out.")
    )
    expect(onCheckedChange).not.toHaveBeenCalled()
    await user.click(screen.getByText("Address validation"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("shows its children only while on, outside the label", async () => {
    const user = userEvent.setup()
    for (const variant of ["default", "row"] as const) {
      const { unmount } = render(
        <SwitchField variant={variant} title="API logging">
          <label>
            Log retention <input defaultValue="30" />
          </label>
        </SwitchField>
      )
      const toggle = screen.getByRole("switch", { name: "API logging" })
      expect(
        screen.queryByRole("textbox", { name: /Log retention/ })
      ).toBeNull()

      await user.click(toggle)
      const retention = screen.getByRole("textbox", { name: /Log retention/ })
      await user.click(retention)
      expect(toggle.getAttribute("aria-checked")).toBe("true")
      expect(toggle.closest("label")?.contains(retention) ?? false).toBe(false)

      await user.click(toggle)
      expect(
        screen.queryByRole("textbox", { name: /Log retention/ })
      ).toBeNull()
      unmount()
    }
  })

  it("puts the badge after the title, outside the switch's name", () => {
    for (const variant of ["default", "row"] as const) {
      const { unmount } = render(
        <SwitchField
          variant={variant}
          title="Marketplace transactions"
          badge={<Badge variant="secondary">Recommended</Badge>}
          defaultChecked
        />
      )
      const title = screen.getByText("Marketplace transactions")
      const badge = screen.getByText("Recommended")
      expect(
        title.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      expect(
        screen.getByRole("switch", { name: "Marketplace transactions" })
      ).toBeTruthy()
      unmount()
    }
  })

  it("blocks toggling while loading", async () => {
    const user = userEvent.setup()
    function Saving() {
      const [on, setOn] = React.useState(false)
      return (
        <SwitchField
          variant="row"
          title="Report transactions"
          checked={on}
          onCheckedChange={setOn}
          loading
        />
      )
    }
    render(<Saving />)
    const toggle = screen.getByRole("switch", { name: "Report transactions" })
    expect(toggle.getAttribute("aria-busy")).toBe("true")
    await user.click(screen.getByText("Report transactions"))
    expect(toggle.getAttribute("aria-checked")).toBe("false")
  })
})
