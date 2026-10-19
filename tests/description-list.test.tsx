import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DescriptionItem, DescriptionList } from "@/index"

describe("DescriptionList", () => {
  it("pairs each label with its value in a description list", () => {
    render(
      <DescriptionList>
        <DescriptionItem label="Region">California</DescriptionItem>
        <DescriptionItem label="Certificate">CA-EX-2026-00193</DescriptionItem>
      </DescriptionList>
    )
    const terms = screen.getAllByRole("term")
    const values = screen.getAllByRole("definition")

    expect(terms.map((term) => term.tagName)).toEqual(["DT", "DT"])
    expect(terms.map((term) => term.textContent)).toEqual([
      "Region",
      "Certificate",
    ])
    expect(values.map((value) => value.tagName)).toEqual(["DD", "DD"])
    expect(values.map((value) => value.textContent)).toEqual([
      "California",
      "CA-EX-2026-00193",
    ])
    expect(terms[0].closest("dl")?.getAttribute("data-slot")).toBe(
      "description-list"
    )
    expect(terms[0].parentElement?.getAttribute("data-slot")).toBe(
      "description-item"
    )
  })
})
