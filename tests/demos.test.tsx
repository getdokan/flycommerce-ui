import { render } from "@testing-library/react"
import axe from "axe-core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@/index"
import { demos } from "../playground/demos"

// jsdom can't compute colour or layout, so those axe rules are checked in the browser instead.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
  },
}

let errors: unknown[][]
beforeEach(() => {
  errors = []
  vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args)
  })
})
afterEach(() => vi.restoreAllMocks())

describe("every gallery demo", () => {
  it.each(demos.map((demo) => [demo.id, demo] as const))(
    "%s renders without React errors or axe violations",
    async (_id, demo) => {
      const { container } = render(
        <TooltipProvider>{demo.render()}</TooltipProvider>
      )
      expect(container.childElementCount).toBeGreaterThan(0)

      const results = await axe.run(container, AXE_OPTIONS)
      const violations = results.violations.map(
        (v) =>
          `${v.id}: ${v.help} (${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(", ")})`
      )
      if (violations.length) throw new Error(`axe:\n${violations.join("\n")}`)
      const reactErrors = errors.map((args) =>
        args.map(String).join(" ").slice(0, 400)
      )
      if (reactErrors.length)
        throw new Error(`console.error:\n${reactErrors.join("\n")}`)
    }
  )
})
