import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "@/index"

const SOLID_DOT =
  '<span aria-hidden="true" class="size-1.5 shrink-0 rounded-full bg-current"></span>'

describe("Badge", () => {
  it("draws the same static dot for dot and dot={true}", () => {
    const { container } = render(
      <>
        <Badge dot>Active</Badge>
        <Badge dot={true}>Active</Badge>
      </>
    )
    for (const badge of container.querySelectorAll("[data-slot=badge]")) {
      expect(badge.innerHTML).toBe(`${SOLID_DOT}Active`)
    }
  })

  it("draws no dot by default or with dot={false}", () => {
    const { container } = render(
      <>
        <Badge>Draft</Badge>
        <Badge dot={false}>Draft</Badge>
      </>
    )
    expect(container.querySelector("[aria-hidden]")).toBeNull()
  })

  it('draws a solid dot over a pinging ring that hides under reduced motion with dot="pulse"', () => {
    const { container } = render(
      <Badge variant="success" dot="pulse">
        Live on maisonoriel.com
      </Badge>
    )
    const badge = container.querySelector("[data-slot=badge]")!
    const dot = badge.firstElementChild!
    expect(dot.getAttribute("aria-hidden")).toBe("true")
    expect(dot.className).toContain("size-1.5")
    const [ring, solid] = Array.from(dot.children)
    expect(ring.className).toContain("animate-ping")
    expect(ring.className).toContain("motion-reduce:hidden")
    expect(ring.className).toContain("bg-current")
    expect(solid.className).toContain("bg-current")
    expect(solid.className).not.toContain("animate-ping")
    expect(badge.textContent).toBe("Live on maisonoriel.com")
  })
})
