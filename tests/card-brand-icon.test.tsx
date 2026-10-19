import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CardBrandIcon, Icon } from "@/index"

describe("CardBrandIcon", () => {
  it.each([
    ["visa", "visa", "Visa"],
    ["MasterCard", "mastercard", "Mastercard"],
    ["amex", "amex", "American Express"],
    ["American Express", "amex", "American Express"],
    ["discover", "discover", "Discover"],
    ["diners", "diners", "Diners Club"],
    ["diners_club", "diners", "Diners Club"],
    ["JCB", "jcb", "JCB"],
  ])("maps %s to the %s mark named %s", (brand, id, name) => {
    render(<CardBrandIcon brand={brand} />)
    const icon = screen.getByRole("img", { name })
    expect(icon.getAttribute("data-brand")).toBe(id)
    expect(icon.getAttribute("data-icon-name")).toBeNull()
  })

  it("shows the generic card for UnionPay, keeping its name", () => {
    render(<CardBrandIcon brand="unionpay" />)
    const icon = screen.getByRole("img", { name: "UnionPay" })
    expect(icon.getAttribute("data-icon-name")).toBe("billing")
  })

  it("falls back to a generic card named Card for an unknown brand", () => {
    render(<CardBrandIcon brand="eftpos_au" />)
    const icon = screen.getByRole("img", { name: "Card" })
    expect(icon.getAttribute("data-brand")).toBe("unknown")
    expect(icon.getAttribute("data-icon-name")).toBe("billing")
  })

  it("takes a translated label, and is decorative with an empty one", () => {
    const { container } = render(
      <>
        <CardBrandIcon brand="unknown" label="Tarjeta" />
        <CardBrandIcon brand="visa" label="" />
      </>
    )
    expect(screen.getByRole("img", { name: "Tarjeta" })).toBeTruthy()
    expect(screen.getAllByRole("img")).toHaveLength(1)
    expect(
      container
        .querySelector('[data-brand="visa"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true")
  })
})

describe("Icon", () => {
  it("has a spreadsheet name", () => {
    render(<Icon name="spreadsheet" label="CSV file" />)
    expect(
      screen
        .getByRole("img", { name: "CSV file" })
        .getAttribute("data-icon-name")
    ).toBe("spreadsheet")
  })
})
