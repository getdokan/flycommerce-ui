import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CardBrandMark } from "@/index"

describe("CardBrandMark", () => {
  it.each([
    ["visa", "visa", "Visa"],
    ["Mastercard", "mastercard", "Mastercard"],
    ["American Express", "amex", "American Express"],
    ["unionpay", "unionpay", "UnionPay"],
    ["discover", "discover", "Discover"],
    ["jcb", "jcb", "JCB"],
    ["diners_club", "diners", "Diners Club"],
  ])("draws %s in full colour as the %s card", (brand, id, name) => {
    render(<CardBrandMark brand={brand} />)
    const mark = screen.getByRole("img", { name })
    expect(mark.getAttribute("data-slot")).toBe("card-brand-mark")
    expect(mark.getAttribute("data-brand")).toBe(id)
    expect(mark.getAttribute("data-icon-name")).toBeNull()
    expect(mark.getAttribute("viewBox")).toBe("0 0 780 500")
    expect(mark.getAttribute("height")).toBe("24")
    expect(mark.getAttribute("width")).toBe("37")
  })

  it("is size tall and 1.56 times as wide", () => {
    render(<CardBrandMark brand="visa" size={26} />)
    const mark = screen.getByRole("img", { name: "Visa" })
    expect(mark.getAttribute("height")).toBe("26")
    expect(mark.getAttribute("width")).toBe("41")
  })

  it("keeps its size when a parent sizes every svg inside it", () => {
    render(<CardBrandMark brand="visa" size={20} />)
    const mark = screen.getByRole("img", { name: "Visa" })
    expect(mark.style.height).toBe("20px")
    expect(mark.style.width).toBe("31px")
  })

  it("falls back to the generic card, at the same size, for an unknown brand", () => {
    render(<CardBrandMark brand="eftpos_au" />)
    const icon = screen.getByRole("img", { name: "Card" })
    expect(icon.getAttribute("data-slot")).toBe("card-brand-mark")
    expect(icon.getAttribute("data-brand")).toBe("unknown")
    expect(icon.getAttribute("data-icon-name")).toBe("billing")
    expect(icon.style.height).toBe("24px")
    expect(icon.style.width).toBe("37px")
  })

  it("is decorative with an empty label", () => {
    const { container } = render(<CardBrandMark brand="visa" label="" />)
    const mark = container.querySelector('[data-slot="card-brand-mark"]')
    expect(mark?.getAttribute("aria-hidden")).toBe("true")
    expect(mark?.hasAttribute("role")).toBe(false)
    expect(mark?.hasAttribute("aria-label")).toBe(false)
  })

  it("gives each JCB mark its own gradient ids", () => {
    const { container } = render(
      <>
        <CardBrandMark brand="jcb" />
        <CardBrandMark brand="jcb" />
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
