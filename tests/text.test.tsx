import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Text, TEXT_VARIANTS, TEXT_WEIGHTS } from "@/index"

const ELEMENTS = {
  display: "P",
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
  "body-l": "P",
  "body-m": "P",
  "body-s": "P",
  "caption-l": "SPAN",
  "caption-m": "SPAN",
  "caption-s": "SPAN",
}

describe("Text", () => {
  it("is body-s in a paragraph by default", () => {
    render(<Text>Store name</Text>)
    const text = screen.getByText("Store name")
    expect(text.tagName).toBe("P")
    expect(text.getAttribute("data-slot")).toBe("text")
    expect(text.getAttribute("data-variant")).toBe("body-s")
  })

  it("lists the 13 sizes largest first and the 7 weights lightest first", () => {
    expect(TEXT_VARIANTS).toEqual(Object.keys(ELEMENTS))
    expect(TEXT_WEIGHTS).toEqual([
      "light",
      "regular",
      "medium",
      "semibold",
      "bold",
      "extrabold",
      "black",
    ])
  })

  it.each(
    TEXT_VARIANTS.map((variant) => [variant, ELEMENTS[variant]] as const)
  )("renders %s as <%s>", (variant, tag) => {
    render(<Text variant={variant}>Sample</Text>)
    const text = screen.getByText("Sample")
    expect(text.tagName).toBe(tag)
    expect(text.getAttribute("data-variant")).toBe(variant)
  })

  it("renders the element given in `as` and passes props and ref through", () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Text as="span" variant="h6" id="total" title="Total" ref={ref}>
        $4,820.50
      </Text>
    )
    const text = screen.getByText("$4,820.50")
    expect(text.tagName).toBe("SPAN")
    expect(text.getAttribute("data-variant")).toBe("h6")
    expect(text.id).toBe("total")
    expect(text.title).toBe("Total")
    expect(ref.current).toBe(text)
  })

  it("passes the props of the element given in `as`", () => {
    render(
      <>
        <Text as="label" htmlFor="store-name">
          Store name
        </Text>
        <Text as="a" href="/settings/billing">
          Billing
        </Text>
        <Text as="time" dateTime="2026-10-20">
          20 Oct
        </Text>
      </>
    )
    expect(screen.getByText("Store name").getAttribute("for")).toBe(
      "store-name"
    )
    expect(screen.getByText("Billing").getAttribute("href")).toBe(
      "/settings/billing"
    )
    expect(screen.getByText("20 Oct").getAttribute("datetime")).toBe(
      "2026-10-20"
    )
  })

  it("keeps its size when the tone or className sets a colour", () => {
    render(
      <>
        <Text variant="caption-l" tone="muted">
          Updated 2:00 PM
        </Text>
        <Text variant="caption-l" tone="muted" className="text-primary-ink">
          View all
        </Text>
      </>
    )
    const muted = screen.getByText("Updated 2:00 PM").classList
    expect(muted).toContain("type-caption-l")
    expect(muted).toContain("text-muted-foreground")

    const overridden = screen.getByText("View all").classList
    expect(overridden).toContain("type-caption-l")
    expect(overridden).toContain("text-primary-ink")
    expect(overridden).not.toContain("text-muted-foreground")
  })
})
