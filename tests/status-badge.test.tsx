import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatusBadge } from "@/index"

const badge = (text: string) => {
  const element = screen.getByText(text).closest("[data-slot=badge]")
  return {
    status: element?.getAttribute("data-status"),
    variant: element?.getAttribute("data-variant"),
  }
}

describe("StatusBadge", () => {
  it.each([
    ["on_hold", "on hold", "warning"],
    ["PARTIALLY_REFUNDED", "partially refunded", "warning"],
    ["out-of-stock", "out of stock", "destructive"],
    ["  In   stock ", "in stock", "success"],
    ["coming_-soon", "coming soon", "soon"],
  ])("matches %j as %j", (status, key, variant) => {
    render(<StatusBadge status={status}>Label</StatusBadge>)
    expect(badge("Label").status).toBe(key)
    expect(badge("Label").variant).toBe(variant)
  })

  it.each([
    ["partially_paid", "warning"],
    ["ready-for-pickup", "warning"],
    ["Partial", "default"],
  ])("knows %j", (status, variant) => {
    render(<StatusBadge status={status}>Label</StatusBadge>)
    expect(badge("Label").variant).toBe(variant)
  })

  it("shows the raw status when there are no children", () => {
    render(<StatusBadge status="on_hold" />)
    expect(badge("on_hold").status).toBe("on hold")
  })

  it.each([
    [{ on_hold: "destructive" }, "on hold"],
    [{ "On Hold": "destructive" }, "on_hold"],
    [{ "awaiting-shipment": "destructive" }, "awaiting_shipment"],
  ] as const)("normalises tones keys: %j matches %j", (tones, status) => {
    render(
      <StatusBadge status={status} tones={tones}>
        Label
      </StatusBadge>
    )
    expect(badge("Label").variant).toBe("destructive")
  })

  it("falls back to secondary, and tone wins over everything", () => {
    render(
      <>
        <StatusBadge status="some_new_status">Unknown</StatusBadge>
        <StatusBadge
          status="on_hold"
          tone="success"
          tones={{ on_hold: "soon" }}
        >
          Forced
        </StatusBadge>
      </>
    )
    expect(badge("Unknown").variant).toBe("secondary")
    expect(badge("Forced").variant).toBe("success")
  })
})
