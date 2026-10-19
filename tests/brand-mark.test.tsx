import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { BrandMark } from "@/index"

describe("BrandMark", () => {
  it("is decorative without a label", () => {
    const { container } = render(
      <BrandMark>
        <svg viewBox="0 0 24 24" />
      </BrandMark>
    )
    const mark = container.querySelector('[data-slot="brand-mark"]')
    expect(mark?.getAttribute("aria-hidden")).toBe("true")
    expect(mark?.getAttribute("data-size")).toBe("md")
    expect(mark?.hasAttribute("data-fill")).toBe(false)
    expect(mark?.querySelector("svg")).not.toBeNull()
    expect(screen.queryByRole("img")).toBeNull()
  })

  it("is an image named by its label", () => {
    render(
      <BrandMark label="Stripe" size="lg">
        <svg viewBox="0 0 24 24" />
      </BrandMark>
    )
    const mark = screen.getByRole("img", { name: "Stripe" })
    expect(mark.getAttribute("data-size")).toBe("lg")
    expect(mark.hasAttribute("aria-hidden")).toBe(false)
    expect(
      mark.querySelector("svg")?.closest('[aria-hidden="true"]')
    ).not.toBeNull()
  })

  it("draws src as an image with an empty alt, edge to edge with fill", () => {
    const { container } = render(
      <BrandMark src="/apps/mailchimp.png" fill size="2xl" />
    )
    const mark = container.querySelector('[data-slot="brand-mark"]')
    expect(mark?.getAttribute("data-fill")).toBe("true")
    expect(mark?.getAttribute("data-size")).toBe("2xl")
    const img = mark?.querySelector("img")
    expect(img?.getAttribute("src")).toBe("/apps/mailchimp.png")
    expect(img?.getAttribute("alt")).toBe("")
  })

  it("passes a brand background through style", () => {
    render(
      <BrandMark label="DHL" style={{ backgroundColor: "rgb(255, 204, 0)" }}>
        <svg viewBox="0 0 24 24" />
      </BrandMark>
    )
    expect(screen.getByRole("img", { name: "DHL" }).style.backgroundColor).toBe(
      "rgb(255, 204, 0)"
    )
  })
})
