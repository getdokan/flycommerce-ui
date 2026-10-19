import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Badge,
  Checkbox,
  CheckboxCard,
  CheckboxCardGroup,
  RadioCard,
  RadioCardGroup,
  RadioGroup,
  RadioGroupItem,
} from "@/index"

const RADIO_BEHAVIOUR =
  /^(peer|group\/|outline-none|after:|focus-visible:|aria-invalid:|dark:aria-invalid:|group-has-|disabled:|data-checked:text-)/
const CHECKBOX_BEHAVIOUR =
  /^(peer|group\/|relative$|outline-none|after:|focus-visible:|aria-invalid:|dark:aria-invalid:|group-has-|disabled:)/

const look = (control: Element, behaviour: RegExp) =>
  [...control.classList].filter((name) => !behaviour.test(name))

const missing = (from: Element, names: string[]) =>
  names.filter((name) => !from.classList.contains(name))

const under = (el: Element, variant: string) =>
  [...el.classList]
    .filter((name) => name.startsWith(variant))
    .map((name) => name.slice(variant.length))

const dims = (el: Element) =>
  [...el.classList].filter((name) => /(^|:)opacity-/.test(name))

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

describe("option rows", () => {
  it("draw RadioGroupItem's radio, with its dot only while checked", async () => {
    const user = userEvent.setup()
    render(
      <>
        <RadioGroup defaultValue="plain" aria-label="Plain">
          <RadioGroupItem value="plain" aria-label="Plain radio" />
        </RadioGroup>
        <RadioCardGroup
          variant="rows"
          defaultValue="customer"
          aria-label="Refund shipping"
        >
          <RadioCard value="customer" title="Customer" />
          <RadioCard value="vendor" title="Vendor" />
        </RadioCardGroup>
      </>
    )
    const item = screen.getByRole("radio", { name: "Plain radio" })
    const dot = item.querySelector("[data-slot=radio-group-indicator]")!
    const customer = screen
      .getByRole("radio", { name: "Customer" })
      .querySelector("[data-slot=radio-card-control]")!
    const vendor = screen
      .getByRole("radio", { name: "Vendor" })
      .querySelector("[data-slot=radio-card-control]")!

    expect(look(item, RADIO_BEHAVIOUR)).toContain(
      "dark:data-checked:bg-primary"
    )
    expect(missing(customer, look(item, RADIO_BEHAVIOUR))).toEqual([])
    expect(customer.getAttribute("aria-hidden")).toBe("true")
    expect(customer.getAttribute("data-state")).toBe("checked")
    expect(vendor.getAttribute("data-state")).toBe("unchecked")
    expect(
      customer.querySelector("[data-slot=radio-group-indicator]")?.outerHTML
    ).toBe(dot.outerHTML)
    expect(vendor.querySelector("[data-slot=radio-group-indicator]")).toBeNull()

    await user.click(screen.getByText("Vendor"))
    expect(vendor.getAttribute("data-state")).toBe("checked")
    expect(
      vendor.querySelector("[data-slot=radio-group-indicator]")?.outerHTML
    ).toBe(dot.outerHTML)
    expect(customer.getAttribute("data-state")).toBe("unchecked")
  })

  it("dim only the radio of a disabled row, as RadioGroupItem dims itself", () => {
    render(
      <>
        <RadioGroup aria-label="Plain">
          <RadioGroupItem value="plain" aria-label="Plain radio" disabled />
        </RadioGroup>
        <RadioCardGroup
          variant="rows"
          defaultValue="customer"
          aria-label="Refund shipping"
        >
          <RadioCard value="customer" title="Customer" />
          <RadioCard value="system" title="System" disabled />
          <RadioCard
            value="vendor"
            title="Vendor"
            disabled
            className="opacity-60"
          />
        </RadioCardGroup>
      </>
    )
    const item = screen.getByRole("radio", { name: "Plain radio" })
    const system = screen.getByRole("radio", { name: "System" })
    const control = system.querySelector("[data-slot=radio-card-control]")!
    const row = system.closest("[data-slot=radio-card-row]")!

    expect(system.hasAttribute("disabled")).toBe(true)
    expect(under(system, "disabled:")).toContain("cursor-not-allowed")
    expect(control.hasAttribute("data-disabled")).toBe(true)
    expect(under(control, "data-disabled:")).toEqual(
      under(item, "disabled:").filter((name) => name.startsWith("opacity-"))
    )
    expect([...dims(row), ...dims(system)]).toEqual([])

    const vendor = screen.getByRole("radio", { name: "Vendor" })
    expect(dims(vendor.closest("[data-slot=radio-card-row]")!)).toEqual([
      "opacity-60",
    ])
    expect(dims(vendor)).toEqual([])
  })

  it("draw Checkbox's box and mark, and dim only it when disabled", () => {
    render(
      <>
        <Checkbox aria-label="Plain checkbox" defaultChecked />
        <Checkbox aria-label="Plain mixed" checked="indeterminate" />
        <Checkbox aria-label="Plain disabled" disabled />
        <CheckboxCardGroup variant="rows" aria-label="Fulfilment methods">
          <CheckboxCard title="Third-party couriers" defaultChecked />
          <CheckboxCard title="Every courier" checked="indeterminate" />
          <CheckboxCard title="In-house delivery" disabled />
          <CheckboxCard
            title="Manual"
            checked
            disabled
            className="opacity-60"
          />
        </CheckboxCardGroup>
      </>
    )
    const control = (name: string) =>
      screen
        .getByRole("checkbox", { name })
        .querySelector("[data-slot=checkbox-card-control]")!
    const mark = (el: Element) =>
      el.querySelector("[data-slot=checkbox-indicator]")?.outerHTML
    const plain = screen.getByRole("checkbox", { name: "Plain checkbox" })

    expect(look(plain, CHECKBOX_BEHAVIOUR)).toContain(
      "dark:data-checked:bg-primary"
    )
    expect(
      missing(control("Third-party couriers"), look(plain, CHECKBOX_BEHAVIOUR))
    ).toEqual([])
    expect(control("Third-party couriers").getAttribute("data-state")).toBe(
      "checked"
    )
    expect(mark(control("Third-party couriers"))).toBe(mark(plain))
    expect(mark(control("Every courier"))).toBe(
      mark(screen.getByRole("checkbox", { name: "Plain mixed" }))
    )
    expect(mark(control("In-house delivery"))).toBeUndefined()

    const inHouse = screen.getByRole("checkbox", { name: "In-house delivery" })
    expect(inHouse.hasAttribute("disabled")).toBe(true)
    expect(control("In-house delivery").hasAttribute("data-disabled")).toBe(
      true
    )
    expect(under(control("In-house delivery"), "data-disabled:")).toEqual(
      under(
        screen.getByRole("checkbox", { name: "Plain disabled" }),
        "disabled:"
      ).filter((name) => name.startsWith("opacity-"))
    )
    expect([
      ...dims(inHouse.closest("[data-slot=checkbox-card-row]")!),
      ...dims(inHouse),
    ]).toEqual([])

    const manual = screen.getByRole("checkbox", { name: "Manual" })
    expect(dims(manual.closest("[data-slot=checkbox-card-row]")!)).toEqual([
      "opacity-60",
    ])
    expect(dims(manual)).toEqual([])
  })

  it("leave the boxed cards as they were", () => {
    render(
      <>
        <RadioCardGroup defaultValue="physical" aria-label="Product type">
          <RadioCard value="physical" title="Physical" className="max-w-sm" />
          <RadioCard value="digital" title="Digital" disabled />
        </RadioCardGroup>
        <CheckboxCardGroup aria-label="Sales channels">
          <CheckboxCard title="Online store" className="max-w-sm" />
          <CheckboxCard title="Point of sale" disabled />
        </CheckboxCardGroup>
      </>
    )
    expect(
      screen
        .getByRole("radio", { name: "Physical" })
        .classList.contains("max-w-sm")
    ).toBe(true)
    expect(
      screen
        .getByRole("checkbox", { name: "Online store" })
        .classList.contains("max-w-sm")
    ).toBe(true)
    expect(
      document.querySelector(
        "[data-slot=radio-card-row], [data-slot=checkbox-card-row]"
      )
    ).toBeNull()
    expect(document.querySelector("[data-slot=radio-card-control]")).toBeNull()
    const pos = screen.getByRole("checkbox", { name: "Point of sale" })
    expect(under(pos, "disabled:")).toContain("opacity-50")
    expect(
      under(pos.querySelector("[aria-hidden=true]")!, "data-disabled:")
    ).toEqual([])
    expect(
      under(screen.getByRole("radio", { name: "Digital" }), "disabled:")
    ).toContain("opacity-50")
  })
})
