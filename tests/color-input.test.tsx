import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ColorInput, Field, FieldLabel, type ColorInputProps } from "@/index"

type Props = Omit<ColorInputProps, "value" | "onValueChange"> & {
  initial?: string | null
  onValueChange?: (value: string | null) => void
}

function BrandColour({ initial = null, onValueChange, ...props }: Props) {
  const [value, setValue] = React.useState<string | null>(initial)
  return (
    <Field>
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
    </Field>
  )
}

const hexInput = () => screen.getByLabelText("Brand colour") as HTMLInputElement
const picker = () => screen.getByLabelText("Pick a colour") as HTMLInputElement
const error = () => screen.queryByRole("alert")

describe("ColorInput", () => {
  it("is labelled by its Field and shows the colour without the #", () => {
    render(<BrandColour initial="#1F2A44" />)
    expect(hexInput().value).toBe("1F2A44")
    expect(picker().value).toBe("#1f2a44")
    expect(error()).toBeNull()
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

  it("shows the error for other lengths and passes the text on", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour initial="#c9a4" onValueChange={onValueChange} />)

    expect(error()?.textContent).toBe("Use 3 or 6 hex digits, like #1F2A44.")
    expect(hexInput().getAttribute("aria-invalid")).toBe("true")
    expect(hexInput().getAttribute("aria-describedby")).toBe(error()?.id)
    expect(
      hexInput()
        .closest("[data-slot=color-input]")
        ?.hasAttribute("data-invalid")
    ).toBe(true)

    await user.type(hexInput(), "6")
    expect(onValueChange).toHaveBeenLastCalledWith("#c9a46")
    expect(error()).not.toBeNull()

    await user.type(hexInput(), "A")
    expect(onValueChange).toHaveBeenLastCalledWith("#c9a46a")
    expect(error()).toBeNull()
    expect(hexInput().hasAttribute("aria-invalid")).toBe(false)
  })

  it("treats an empty field as invalid unless allowClear", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BrandColour initial="#1f2a44" onValueChange={onValueChange} />)

    await user.clear(hexInput())
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(error()).not.toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("clears to null with allowClear and keeps focus in the field", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BrandColour
        initial="#c9a46a"
        allowClear
        fallback="#1f2a44"
        labels={{ clear: "Use brand colour" }}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Use brand colour" }))

    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(hexInput().value).toBe("")
    expect(document.activeElement).toBe(hexInput())
    expect(error()).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Use brand colour" })
    ).toBeNull()
    expect(picker().value).toBe("#1f2a44")
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

  it("marks the field invalid without its own message when told to", () => {
    render(<BrandColour initial="#1f2a44" invalid />)
    expect(hexInput().getAttribute("aria-invalid")).toBe("true")
    expect(error()).toBeNull()
  })

  it("translates every string", () => {
    render(
      <BrandColour
        initial="#12"
        labels={{ picker: "Choisir une couleur", error: "3 ou 6 chiffres." }}
      />
    )
    expect(screen.getByLabelText("Choisir une couleur")).toBeTruthy()
    expect(error()?.textContent).toBe("3 ou 6 chiffres.")
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
