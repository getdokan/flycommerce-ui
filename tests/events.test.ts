import type * as React from "react"
import { describe, expect, it } from "vitest"

import { isPlainClick } from "@/lib/events"

const click = (init: Partial<React.MouseEvent>) =>
  ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...init,
  }) as React.MouseEvent

describe("isPlainClick", () => {
  it("takes a left click with no modifier", () => {
    expect(isPlainClick(click({}))).toBe(true)
  })

  it.each([
    [{ button: 1 }],
    [{ button: 2 }],
    [{ metaKey: true }],
    [{ ctrlKey: true }],
    [{ shiftKey: true }],
    [{ altKey: true }],
  ])("leaves %o to the browser", (init) => {
    expect(isPlainClick(click(init))).toBe(false)
  })
})
