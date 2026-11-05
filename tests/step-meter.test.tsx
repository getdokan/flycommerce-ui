import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StepMeter } from "@/index"

import { applyTailwind } from "./tailwind"

const STEPS = ["Upload", "Map columns", "Import"]

const step = (name: string) =>
  screen.getByText(name).closest("li") as HTMLLIElement

describe("StepMeter", () => {
  it("lists the steps in order, named by aria-label", () => {
    render(<StepMeter steps={STEPS} current={1} aria-label="Import steps" />)

    const list = screen.getByRole("list", { name: "Import steps" })
    expect(
      Array.from(list.querySelectorAll("li")).map((li) => li.textContent)
    ).toEqual(["Upload, completed", "Map columns", "Import, not completed"])
  })

  it("marks steps before the current one complete and the rest upcoming", () => {
    render(<StepMeter steps={STEPS} current={1} />)

    expect(step("Upload").getAttribute("data-state")).toBe("complete")
    expect(step("Map columns").getAttribute("data-state")).toBe("current")
    expect(step("Map columns").getAttribute("aria-current")).toBe("step")
    expect(step("Import").getAttribute("data-state")).toBe("upcoming")
    expect(step("Upload").hasAttribute("aria-current")).toBe(false)
    expect(step("Import").hasAttribute("aria-current")).toBe(false)
  })

  it("reads each step's state, in the app's words", () => {
    render(
      <StepMeter
        steps={STEPS}
        current={1}
        labels={{ complete: "abgeschlossen", upcoming: "offen" }}
      />
    )

    expect(step("Upload").textContent).toBe("Upload, abgeschlossen")
    expect(step("Map columns").textContent).toBe("Map columns")
    expect(step("Import").textContent).toBe("Import, offen")
  })

  it("marks every step complete past the last one, with none current", () => {
    render(<StepMeter steps={STEPS} current={3} />)

    for (const name of STEPS) {
      expect(step(name).getAttribute("data-state")).toBe("complete")
    }
    expect(document.querySelector("[aria-current]")).toBeNull()
  })

  it("marks none current or complete before the first step", () => {
    render(<StepMeter steps={STEPS} current={-1} />)

    for (const name of STEPS) {
      expect(step(name).getAttribute("data-state")).toBe("upcoming")
    }
  })

  it("marks the step a fraction falls in, all for Infinity and none for NaN", () => {
    const { rerender } = render(<StepMeter steps={STEPS} current={1.5} />)
    expect(step("Map columns").getAttribute("aria-current")).toBe("step")

    rerender(<StepMeter steps={STEPS} current={Number.POSITIVE_INFINITY} />)
    for (const name of STEPS) {
      expect(step(name).getAttribute("data-state")).toBe("complete")
    }

    rerender(<StepMeter steps={STEPS} current={Number.NaN} />)
    for (const name of STEPS) {
      expect(step(name).getAttribute("data-state")).toBe("upcoming")
    }
  })

  it("keeps its bars in forced colours, where a background alone is dropped", async () => {
    const { container } = render(
      <StepMeter steps={["Upload", "Map", "Import"]} current={1} />
    )
    await applyTailwind()
    const forced = [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .filter(
        (rule): rule is CSSMediaRule =>
          rule instanceof CSSMediaRule &&
          rule.media.mediaText.includes("forced-colors")
      )
      .flatMap((media) => [...media.cssRules] as CSSStyleRule[])
    const bars = container.querySelectorAll(
      "[data-slot=step-meter-step] > [aria-hidden]"
    )
    expect(bars).toHaveLength(3)
    const declares = (bar: Element, css: string) =>
      forced.some(
        (rule) => bar.matches(rule.selectorText) && rule.cssText.includes(css)
      )
    expect([...bars].every((bar) => declares(bar, "outline-style"))).toBe(true)
    expect([...bars].map((bar) => declares(bar, "CanvasText"))).toEqual([
      true,
      true,
      false,
    ])
  })
})
