import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge, RadioCard, RadioCardGroup } from "@/index"

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
})
