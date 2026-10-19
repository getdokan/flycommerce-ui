import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "@/index"

const bar = (name: string) => screen.getByRole("progressbar", { name })

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
})
