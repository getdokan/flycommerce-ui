import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Badge,
  CheckboxCard,
  CheckboxCardGroup,
  RadioCard,
  RadioCardGroup,
} from "@/index"

async function press(user: ReturnType<typeof userEvent.setup>, key: string) {
  await user.keyboard(`{${key}>}`)
  await user.keyboard(`{/${key}}`)
}

function Warranty({
  onValueChange,
}: {
  onValueChange?: (value: string) => void
}) {
  const [value, setValue] = React.useState("custom")
  return (
    <RadioCardGroup
      variant="rows"
      aria-label="Warranty"
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    >
      <RadioCard value="inherit" title="Use default" />
      <RadioCard
        value="custom"
        title="Choose a policy"
        badge={<Badge variant="success">Active</Badge>}
        description="Pick a specific policy for this product."
        details={
          value === "custom" && (
            <label>
              Warranty policy <input defaultValue="2-year" />
            </label>
          )
        }
      />
      <RadioCard value="none" title="No warranty" />
    </RadioCardGroup>
  )
}

describe("RadioCard", () => {
  it("renders the badge after the title, inside the radio", () => {
    render(
      <RadioCardGroup defaultValue="physical">
        <RadioCard
          value="physical"
          title="Physical product"
          badge={<Badge>Active</Badge>}
          description="Requires shipping"
        />
        <RadioCard value="digital" title="Digital product" />
      </RadioCardGroup>
    )
    const radio = screen.getByRole("radio", {
      name: /^Physical product.*Active/,
    })
    const title = screen.getByText("Physical product")
    const badge = screen.getByText("Active")
    expect(radio.contains(badge)).toBe(true)
    expect(
      title.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.getByRole("radio", { name: "Digital product" })).toBeDefined()
  })

  it("defaults to cards and ignores details there", () => {
    const { container } = render(
      <RadioCardGroup defaultValue="a">
        <RadioCard value="a" title="A" details={<span>Fields for A</span>} />
      </RadioCardGroup>
    )
    expect(
      container
        .querySelector("[data-slot=radio-card-group]")
        ?.getAttribute("data-variant")
    ).toBe("cards")
    expect(
      screen.getByRole("radio", { name: "A" }).getAttribute("data-variant")
    ).toBe("cards")
    expect(screen.queryByText("Fields for A")).toBeNull()
  })

  it("renders rows with details outside the radio", () => {
    const { container } = render(<Warranty />)
    expect(
      container
        .querySelector("[data-slot=radio-card-group]")
        ?.getAttribute("data-variant")
    ).toBe("rows")
    const radio = screen.getByRole("radio", {
      name: /^Choose a policy.*Active/,
    })
    expect(radio.getAttribute("data-variant")).toBe("rows")
    const field = screen.getByRole("textbox", { name: /Warranty policy/ })
    const row = radio.closest("[data-slot=radio-card-row]")!
    expect(radio.contains(field)).toBe(false)
    expect(row.contains(field)).toBe(true)
    expect(
      row.querySelector("[data-slot=radio-card-details]")?.contains(field)
    ).toBe(true)
  })

  it("moves and selects rows with the arrow keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Warranty onValueChange={onValueChange} />)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: /^Choose a policy/ })
    )
    await press(user, "ArrowDown")
    const none = screen.getByRole("radio", { name: "No warranty" })
    expect(document.activeElement).toBe(none)
    expect(none.getAttribute("aria-checked")).toBe("true")
    expect(onValueChange).toHaveBeenLastCalledWith("none")
    expect(
      screen.queryByRole("textbox", { name: /Warranty policy/ })
    ).toBeNull()

    await press(user, "ArrowUp")
    await press(user, "ArrowUp")
    expect(
      screen
        .getByRole("radio", { name: "Use default" })
        .getAttribute("aria-checked")
    ).toBe("true")
    expect(onValueChange).toHaveBeenLastCalledWith("inherit")
  })

  it("leaves typing in the details to the field", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Warranty onValueChange={onValueChange} />)

    await user.tab()
    await user.tab()
    const field = screen.getByRole("textbox", { name: /Warranty policy/ })
    expect(document.activeElement).toBe(field)
    await user.keyboard("{ArrowLeft}{ArrowDown}{ArrowUp}{End} plus")
    expect((field as HTMLInputElement).value).toBe("2-year plus")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("selects a row on click and skips disabled rows", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCardGroup
        variant="rows"
        aria-label="Refund shipping"
        defaultValue="customer"
        onValueChange={onValueChange}
      >
        <RadioCard value="customer" title="Customer" />
        <RadioCard value="system" title="System" disabled />
        <RadioCard value="vendor" title="Vendor" />
      </RadioCardGroup>
    )
    await user.click(screen.getByText("System"))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByText("Vendor"))
    expect(onValueChange).toHaveBeenCalledWith("vendor")
  })
})

describe("CheckboxCard", () => {
  it("is a named group of checkboxes, as cards by default", async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { container } = render(
      <CheckboxCardGroup aria-label="Sales channels">
        <CheckboxCard
          title="Online store"
          description="Your storefront"
          defaultChecked
        />
        <CheckboxCard title="Point of sale" onCheckedChange={onCheckedChange} />
      </CheckboxCardGroup>
    )
    const group = screen.getByRole("group", { name: "Sales channels" })
    expect(group.getAttribute("data-variant")).toBe("cards")
    expect(
      container
        .querySelector("[data-slot=checkbox-card]")
        ?.getAttribute("data-variant")
    ).toBe("cards")
    expect(
      screen
        .getByRole("checkbox", { name: /^Online store/ })
        .getAttribute("aria-checked")
    ).toBe("true")

    const pos = screen.getByRole("checkbox", { name: "Point of sale" })
    await user.click(pos)
    expect(pos.getAttribute("aria-checked")).toBe("true")
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    pos.focus()
    await user.keyboard(" ")
    expect(pos.getAttribute("aria-checked")).toBe("false")
  })

  it("renders rows with details outside the checkbox", async () => {
    const user = userEvent.setup()
    function Methods() {
      const [on, setOn] = React.useState(false)
      return (
        <CheckboxCardGroup variant="rows" aria-label="Fulfilment methods">
          <CheckboxCard
            title="Third-party couriers"
            badge={<Badge variant="secondary">Default</Badge>}
            checked={on}
            onCheckedChange={(next) => setOn(next === true)}
            details={on && <button type="button">Connect a courier</button>}
          />
          <CheckboxCard title="In-house delivery" disabled />
        </CheckboxCardGroup>
      )
    }
    const { container } = render(<Methods />)
    expect(
      screen
        .getByRole("group", { name: "Fulfilment methods" })
        .getAttribute("data-variant")
    ).toBe("rows")

    const couriers = screen.getByRole("checkbox", {
      name: /^Third-party couriers.*Default/,
    })
    await user.click(couriers)
    const connect = screen.getByRole("button", { name: "Connect a courier" })
    expect(couriers.contains(connect)).toBe(false)
    expect(
      container
        .querySelector("[data-slot=checkbox-card-details]")
        ?.contains(connect)
    ).toBe(true)
    await user.click(connect)
    expect(couriers.getAttribute("aria-checked")).toBe("true")

    const inHouse = screen.getByRole("checkbox", { name: "In-house delivery" })
    await user.click(inHouse)
    expect(inHouse.getAttribute("aria-checked")).toBe("false")
  })

  it("shows the indeterminate state", () => {
    render(
      <CheckboxCardGroup aria-label="Channels">
        <CheckboxCard title="All channels" checked="indeterminate" />
      </CheckboxCardGroup>
    )
    expect(
      screen
        .getByRole("checkbox", { name: "All channels" })
        .getAttribute("aria-checked")
    ).toBe("mixed")
  })
})
