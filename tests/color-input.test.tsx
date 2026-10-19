import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  ColorInput,
  Field,
  FieldError,
  FieldLabel,
  type ColorInputProps,
} from "@/index"

type Props = Omit<ColorInputProps, "value" | "onValueChange"> & {
  initial?: string | null
  onValueChange?: (value: string | null) => void
}

const HEX_ERROR = "Use 3 or 6 hex digits, like #1F2A44."

function BrandColour({ initial = null, onValueChange, ...props }: Props) {
  const [value, setValue] = React.useState<string | null>(initial)
  const valid = value !== null && /^#[0-9a-f]{6}$/.test(value)
  return (
    <Field data-invalid={!valid || undefined}>
      <FieldLabel htmlFor="brand-colour">Brand colour</FieldLabel>
      <ColorInput
        id="brand-colour"
        value={value}
        onValueChange={(next) => {
          setValue(next)
          onValueChange?.(next)
        }}
        {...props}
      />
      {!valid && <FieldError>{HEX_ERROR}</FieldError>}
    </Field>
  )
}

const hexInput = () => screen.getByLabelText("Brand colour") as HTMLInputElement
const picker = () => screen.getByLabelText("Pick a colour") as HTMLInputElement
const root = () => hexInput().closest<HTMLElement>("[data-slot=color-input]")!
const swatch = () =>
  root().querySelector<HTMLElement>("[data-slot=color-input-swatch]")!
const marked = () =>
  hexInput().getAttribute("aria-invalid") === "true" &&
  root().hasAttribute("data-invalid")

describe("ColorInput", () => {
  it("is labelled by its Field and shows the colour without the #", () => {
    render(<BrandColour initial="#1F2A44" />)
    expect(hexInput().value).toBe("1F2A44")
    expect(picker().value).toBe("#1f2a44")
    expect(swatch().style.backgroundColor).toBe("rgb(31, 42, 68)")
    expect(marked()).toBe(false)
  })

  it("normalises 6 digits to lower-case #rrggbb", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour initial="#000000" onValueChange={onValueChange} />)

    await user.clear(hexInput())
    await user.type(hexInput(), "1F2A44")

    expect(onValueChange).toHaveBeenLastCalledWith("#1f2a44")
    expect(hexInput().value).toBe("1F2A44")
    expect(picker().value).toBe("#1f2a44")
  })

  it("expands 3 digits and keeps what was typed", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour onValueChange={onValueChange} />)

    await user.type(hexInput(), "AbC")

    expect(onValueChange).toHaveBeenLastCalledWith("#aabbcc")
    expect(hexInput().value).toBe("AbC")
  })

  it("drops the # and anything that isn't a hex digit, up to 6 digits", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour onValueChange={onValueChange} />)

    await user.click(hexInput())
    await user.paste("#1F2A44")
    expect(onValueChange).toHaveBeenLastCalledWith("#1f2a44")

    await user.type(hexInput(), "9z")
    expect(hexInput().value).toBe("1F2A44")
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it("marks other lengths invalid and passes the text on", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour initial="#c9a4" onValueChange={onValueChange} />)

    expect(marked()).toBe(true)
    expect(swatch().style.backgroundColor).toBe("")

    await user.type(hexInput(), "6")
    expect(onValueChange).toHaveBeenLastCalledWith("#c9a46")
    expect(marked()).toBe(true)

    await user.type(hexInput(), "A")
    expect(onValueChange).toHaveBeenLastCalledWith("#c9a46a")
    expect(marked()).toBe(false)
    expect(hexInput().hasAttribute("aria-invalid")).toBe(false)
  })

  it("leaves the message to the Field, so it shows once", () => {
    render(<BrandColour initial="#c9a4" />)
    const alerts = screen.getAllByRole("alert")
    expect(alerts).toHaveLength(1)
    expect(alerts[0].textContent).toBe(HEX_ERROR)
    expect(root().contains(alerts[0])).toBe(false)
    expect(
      hexInput().closest("[data-slot=field]")?.getAttribute("data-invalid")
    ).toBe("true")
  })

  it("never renders a message of its own", () => {
    render(
      <ColorInput
        aria-label="Accent"
        value="#c9a4"
        invalid
        onValueChange={() => {}}
      />
    )
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByLabelText("Accent").getAttribute("aria-invalid")).toBe(
      "true"
    )
  })

  it("treats an empty field as invalid unless allowClear", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour initial="#1f2a44" onValueChange={onValueChange} />)

    await user.clear(hexInput())
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(marked()).toBe(true)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("clears to null with allowClear and keeps focus in the field", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ColorInput
        aria-label="Invoice colour"
        value="#c9a46a"
        allowClear
        fallback="#1f2a44"
        labels={{ clear: "Use brand colour" }}
        onValueChange={onValueChange}
      />
    )
    const input = screen.getByLabelText("Invoice colour") as HTMLInputElement

    await user.click(screen.getByRole("button", { name: "Use brand colour" }))

    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(input.value).toBe("")
    expect(document.activeElement).toBe(input)
    expect(input.hasAttribute("aria-invalid")).toBe(false)
    expect(
      screen.queryByRole("button", { name: "Use brand colour" })
    ).toBeNull()
    expect(
      (screen.getByLabelText("Pick a colour") as HTMLInputElement).value
    ).toBe("#1f2a44")
  })

  it("takes the colour picked with the native picker", () => {
    const onValueChange = vi.fn()
    render(<BrandColour initial="#1f2a44" onValueChange={onValueChange} />)

    fireEvent.change(picker(), { target: { value: "#ff8800" } })

    expect(onValueChange).toHaveBeenLastCalledWith("#ff8800")
    expect(hexInput().value).toBe("ff8800")
  })

  it("follows a value changed from outside", () => {
    const { rerender } = render(
      <ColorInput
        aria-label="Accent"
        value="#1f2a44"
        onValueChange={() => {}}
      />
    )
    rerender(
      <ColorInput
        aria-label="Accent"
        value="#C9A46A"
        onValueChange={() => {}}
      />
    )
    expect(screen.getByLabelText("Accent")).toHaveProperty("value", "C9A46A")
  })

  it("marks a valid colour invalid when told to, and keeps its swatch", () => {
    render(<BrandColour initial="#1f2a44" invalid />)
    expect(marked()).toBe(true)
    expect(swatch().style.backgroundColor).toBe("rgb(31, 42, 68)")
  })

  it("translates its strings", () => {
    render(
      <BrandColour
        initial="#1f2a44"
        allowClear
        labels={{ picker: "Choisir une couleur", clear: "Effacer" }}
      />
    )
    expect(screen.getByLabelText("Choisir une couleur")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Effacer" })).toBeTruthy()
  })

  it("disables the picker and the text field", () => {
    render(<BrandColour initial="#1f2a44" disabled allowClear />)
    expect(hexInput().disabled).toBe(true)
    expect(picker().disabled).toBe(true)
    expect(
      screen.getByRole("button", { name: "Clear" }).hasAttribute("disabled")
    ).toBe(true)
  })
})
