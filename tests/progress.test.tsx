import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Progress } from "@/index"

const bar = (name: string) => screen.getByRole("progressbar", { name })

const filled = (name: string) => {
  const indicator = bar(name).querySelector<HTMLElement>(
    "[data-slot=progress-indicator]"
  )
  const offset = indicator?.style.transform.replace("translateX(", "") ?? ""
  return 100 + Number.parseFloat(offset)
}

afterEach(() => vi.restoreAllMocks())

describe("Progress", () => {
  it("exposes its value to assistive technology", () => {
    render(<Progress value={62} aria-label="Setup progress" />)
    expect(bar("Setup progress").getAttribute("aria-valuenow")).toBe("62")
    expect(bar("Setup progress").getAttribute("aria-valuetext")).toBe("62%")
    expect(bar("Setup progress").getAttribute("data-state")).toBe("loading")
  })

  it("is complete at 100 and indeterminate without a value", () => {
    render(
      <>
        <Progress value={100} aria-label="Import" />
        <Progress aria-label="Loading" />
      </>
    )
    expect(bar("Import").getAttribute("data-state")).toBe("complete")
    expect(bar("Loading").hasAttribute("aria-valuenow")).toBe(false)
    expect(bar("Loading").getAttribute("data-state")).toBe("indeterminate")
  })

  it("names its value with getValueLabel", () => {
    render(
      <Progress
        value={60}
        aria-label="Seats used"
        getValueLabel={() => "3 of 5"}
      />
    )
    expect(bar("Seats used").getAttribute("aria-valuetext")).toBe("3 of 5")
  })

  it("uses the default tone unless one is set", () => {
    render(
      <>
        <Progress value={40} aria-label="Storage" />
        <Progress value={100} tone="warning" aria-label="Seats" />
      </>
    )
    expect(bar("Storage").getAttribute("data-tone")).toBe("default")
    expect(bar("Seats").getAttribute("data-tone")).toBe("warning")
  })

  it("keeps the value between 0 and max, drawn and announced alike", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <>
        <Progress value={120} aria-label="Seats used" />
        <Progress value={-5} aria-label="Refunds" />
      </>
    )
    expect(bar("Seats used").getAttribute("aria-valuenow")).toBe("100")
    expect(bar("Seats used").getAttribute("aria-valuetext")).toBe("100%")
    expect(bar("Seats used").getAttribute("data-state")).toBe("complete")
    expect(filled("Seats used")).toBe(100)
    expect(bar("Refunds").getAttribute("aria-valuenow")).toBe("0")
    expect(filled("Refunds")).toBe(0)
    expect(error).not.toHaveBeenCalled()
  })

  it("counts a value that is not finite as 0, as a usage meter with a limit of 0 gives", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <>
        <Progress value={(0 / 0) * 100} aria-label="NaN" />
        <Progress value={(2 / 0) * 100} aria-label="Infinity" />
      </>
    )
    for (const name of ["NaN", "Infinity"]) {
      expect(bar(name).getAttribute("aria-valuenow")).toBe("0")
      expect(bar(name).getAttribute("data-state")).toBe("loading")
      expect(filled(name)).toBe(0)
    }
    expect(error).not.toHaveBeenCalled()
  })

  it("fills against max", () => {
    render(
      <>
        <Progress value={3} max={5} aria-label="Seats" />
        <Progress value={7} max={5} aria-label="Vendors" />
      </>
    )
    expect(bar("Seats").getAttribute("aria-valuenow")).toBe("3")
    expect(bar("Seats").getAttribute("aria-valuemax")).toBe("5")
    expect(bar("Seats").getAttribute("aria-valuetext")).toBe("60%")
    expect(filled("Seats")).toBe(60)
    expect(bar("Vendors").getAttribute("aria-valuenow")).toBe("5")
    expect(bar("Vendors").getAttribute("data-state")).toBe("complete")
    expect(filled("Vendors")).toBe(100)
  })
})
