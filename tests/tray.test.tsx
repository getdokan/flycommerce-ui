import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Tray } from "@/index"

describe("Tray", () => {
  it("holds its children on a plate, in the primary tone by default", () => {
    const { container } = render(
      <Tray className="lead-tray" contentClassName="lead-plate">
        <p>Recommended plan</p>
      </Tray>
    )
    const tray = container.querySelector('[data-slot="tray"]')
    const plate = tray?.querySelector('[data-slot="tray-content"]')
    expect(tray?.getAttribute("data-tone")).toBe("primary")
    expect(tray?.classList.contains("lead-tray")).toBe(true)
    expect(plate?.classList.contains("lead-plate")).toBe(true)
    expect(plate?.textContent).toBe("Recommended plan")
    expect(tray?.querySelector('[data-slot="tray-header"]')).toBeNull()
  })

  it.each(["neutral", "warning", "destructive"] as const)(
    "takes the %s tone",
    (tone) => {
      const { container } = render(<Tray tone={tone}>Body</Tray>)
      expect(
        container.querySelector('[data-slot="tray"]')?.getAttribute("data-tone")
      ).toBe(tone)
    }
  )

  it("sets a header on the tray, above the plate", () => {
    render(
      <Tray
        tone="destructive"
        role="region"
        aria-label="Stores that need your attention"
        header={<h2>2 stores need your attention</h2>}
      >
        <ul>
          <li>Maison Oriel</li>
        </ul>
      </Tray>
    )
    const tray = screen.getByRole("region", {
      name: "Stores that need your attention",
    })
    const header = tray.querySelector('[data-slot="tray-header"]')
    const plate = tray.querySelector('[data-slot="tray-content"]')
    expect(header?.textContent).toBe("2 stores need your attention")
    expect(plate?.contains(header ?? null)).toBe(false)
    expect(header?.nextElementSibling).toBe(plate)
  })
})
