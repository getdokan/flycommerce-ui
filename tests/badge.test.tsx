import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "@/index"

import { applyTailwind } from "./tailwind"

describe("Badge", () => {
  it("draws a static dot, hidden from assistive tech, for dot and dot={true}", () => {
    const { container } = render(
      <>
        <Badge dot>Active</Badge>
        <Badge dot={true}>Active</Badge>
      </>
    )
    for (const badge of container.querySelectorAll("[data-slot=badge]")) {
      const dot = badge.querySelector("[data-slot=badge-dot]")!
      expect(dot.getAttribute("aria-hidden")).toBe("true")
      expect(dot.querySelector("[data-slot=badge-dot-ping]")).toBeNull()
      expect(badge.textContent).toBe("Active")
    }
  })

  it("draws no dot by default or with dot={false}", () => {
    const { container } = render(
      <>
        <Badge>Draft</Badge>
        <Badge dot={false}>Draft</Badge>
      </>
    )
    expect(container.querySelector("[data-slot=badge-dot]")).toBeNull()
  })

  it('adds a ping inside the dot with dot="pulse", which reads nothing and hides under reduced motion', async () => {
    const { container } = render(
      <Badge variant="success" dot="pulse">
        Live on maisonoriel.com
      </Badge>
    )
    await applyTailwind()
    const badge = container.querySelector("[data-slot=badge]")!
    const dot = badge.querySelector("[data-slot=badge-dot]")!
    expect(dot.getAttribute("aria-hidden")).toBe("true")
    const ping = dot.querySelector("[data-slot=badge-dot-ping]")!
    expect(getComputedStyle(ping).position).toBe("absolute")
    expect(badge.textContent).toBe("Live on maisonoriel.com")
  })
})
