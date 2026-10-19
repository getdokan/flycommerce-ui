import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field, FieldDescription, FieldLabel, Icon, Input } from "@/index"

describe("FieldDescription", () => {
  it("renders the hint as before without an icon", () => {
    const { container } = render(
      <FieldDescription>
        Shown on <a href="#invoices">invoices</a>.
      </FieldDescription>
    )
    const hint = container.querySelector("[data-slot=field-description]")!
    expect(hint.tagName).toBe("P")
    expect(hint.querySelector("[data-slot=field-description-icon]")).toBeNull()
    expect(hint.firstChild?.textContent).toBe("Shown on ")
    expect(hint.querySelector(":scope > a")).not.toBeNull()
  })

  it("puts a decorative icon before the text", () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="title">Homepage title</FieldLabel>
        <Input id="title" />
        <FieldDescription icon={<Icon name="info" />}>
          Google shows about <a href="#limits">60 characters</a>.
        </FieldDescription>
      </Field>
    )
    const hint = container.querySelector("[data-slot=field-description]")!
    const icon = hint.querySelector("[data-slot=field-description-icon]")!
    expect(hint.firstElementChild).toBe(icon)
    expect(icon.getAttribute("aria-hidden")).toBe("true")
    expect(icon.querySelector("svg")).not.toBeNull()
    expect(hint.textContent).toBe("Google shows about 60 characters.")
    expect(screen.getByRole("link", { name: "60 characters" })).toBeTruthy()
  })
})
