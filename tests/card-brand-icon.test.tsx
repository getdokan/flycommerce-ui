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

describe("CardBrandIcon variant", () => {
  it("is the one-colour glyph by default", () => {
    render(<CardBrandIcon brand="visa" />)
    expect(
      screen.getByRole("img", { name: "Visa" }).getAttribute("data-variant")
    ).toBe("mono")
  })

  it.each([
    ["visa", "visa", "Visa"],
    ["Mastercard", "mastercard", "Mastercard"],
    ["American Express", "amex", "American Express"],
    ["unionpay", "unionpay", "UnionPay"],
    ["discover", "discover", "Discover"],
    ["jcb", "jcb", "JCB"],
    ["diners_club", "diners", "Diners Club"],
  ])("draws %s in full colour as the %s card", (brand, id, name) => {
    render(<CardBrandIcon brand={brand} variant="color" />)
    const mark = screen.getByRole("img", { name })
    expect(mark.getAttribute("data-variant")).toBe("color")
    expect(mark.getAttribute("data-brand")).toBe(id)
    expect(mark.getAttribute("data-icon-name")).toBeNull()
    expect(mark.getAttribute("viewBox")).toBe("0 0 780 500")
    expect(mark.getAttribute("height")).toBe("24")
    expect(mark.getAttribute("width")).toBe("37")
  })

  it("is size tall and 1.56 times as wide", () => {
    render(<CardBrandIcon brand="visa" variant="color" size={26} />)
    const mark = screen.getByRole("img", { name: "Visa" })
    expect(mark.getAttribute("height")).toBe("26")
    expect(mark.getAttribute("width")).toBe("41")
  })

  it("keeps its size when a parent sizes every svg inside it", () => {
    render(<CardBrandIcon brand="visa" variant="color" size={20} />)
    const mark = screen.getByRole("img", { name: "Visa" })
    expect(mark.style.height).toBe("20px")
    expect(mark.style.width).toBe("31px")
  })

  it("falls back to the generic card for an unknown brand", () => {
    render(<CardBrandIcon brand="eftpos_au" variant="color" />)
    const icon = screen.getByRole("img", { name: "Card" })
    expect(icon.getAttribute("data-brand")).toBe("unknown")
    expect(icon.getAttribute("data-icon-name")).toBe("billing")
  })

  it("is decorative with an empty label and shows a title when given", () => {
    const { container } = render(
      <>
        <CardBrandIcon brand="visa" variant="color" label="" />
        <CardBrandIcon brand="amex" variant="color" title="Amex" />
      </>
    )
    expect(
      container
        .querySelector('[data-brand="visa"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true")
    expect(
      container.querySelector('[data-brand="amex"] > title')?.textContent
    ).toBe("Amex")
  })

  it("gives each JCB mark its own gradient ids", () => {
    const { container } = render(
      <>
        <CardBrandIcon brand="jcb" variant="color" />
        <CardBrandIcon brand="jcb" variant="color" />
      </>
    )
    const ids = [...container.querySelectorAll("linearGradient")].map(
      (gradient) => gradient.id
    )
    expect(ids).toHaveLength(6)
    expect(new Set(ids).size).toBe(6)
    for (const mark of container.querySelectorAll('[data-brand="jcb"]')) {
      for (const path of mark.querySelectorAll('path[fill^="url(#"]')) {
        const id = path.getAttribute("fill")!.slice(5, -1)
        expect(mark.querySelector(`[id="${id}"]`)).not.toBeNull()
      }
    }
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
