import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FacetFilter, Icon } from "@/index"

const OPTIONS = [
  { value: "paid", label: "Paid", count: 1280 },
  { value: "unpaid", label: "Unpaid", count: 9 },
  { value: "refunded", label: "Refunded" },
]

describe("FacetFilter", () => {
  it("reads the label, then the one pick, then the label with the count", () => {
    const { rerender } = render(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
      />
    )
    const trigger = () => screen.getByRole("button", { name: /^Payment:/ })
    expect(trigger().textContent).toBe("Payment")
    expect(trigger().getAttribute("aria-label")).toBe("Payment: all")

    rerender(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={["unpaid"]}
        onValueChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("Unpaid")
    expect(trigger().getAttribute("aria-label")).toBe("Payment: Unpaid")

    rerender(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={["paid", "unpaid"]}
        onValueChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("Payment, 2")
    expect(trigger().getAttribute("aria-label")).toBe("Payment: Paid, Unpaid")
    expect(trigger().getAttribute("data-picked")).toBe("2")
  })

  it("lists each option with its count, or — until it is known", () => {
    render(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
        locale="en-US"
        open
      />
    )
    const paid = screen.getByRole("menuitemcheckbox", { name: /^Paid/ })
    expect(paid.textContent).toContain("1,280")
    const refunded = screen.getByRole("menuitemcheckbox", { name: "Refunded" })
    expect(refunded.textContent).toContain("—")
  })

  it("ticks an option at once, keeps the options' order, and stays open", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={["unpaid"]}
        onValueChange={onValueChange}
        open
      />
    )
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Paid/ }))
    expect(onValueChange).toHaveBeenCalledWith(["paid", "unpaid"])
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Unpaid/ })
    ).toBeTruthy()

    await user.click(screen.getByRole("menuitemcheckbox", { name: /Unpaid/ }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("offers Clear only once something is picked, and it empties the pick", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={[]}
        onValueChange={onValueChange}
        open
      />
    )
    expect(screen.queryByRole("menuitem", { name: "Clear" })).toBeNull()

    rerender(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={["paid"]}
        onValueChange={onValueChange}
        open
        labels={{ clear: "Clear payment" }}
      />
    )
    await user.click(screen.getByRole("menuitem", { name: "Clear payment" }))
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it("tells the app when the menu opens and closes", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <FacetFilter
        label="Payment"
        icon={<Icon name="cash" />}
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
        onOpenChange={onOpenChange}
      />
    )
    const trigger = screen.getByRole("button", { name: "Payment: all" })
    expect(trigger.querySelector("svg[data-icon=inline-start]")).toBeTruthy()
    await user.click(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("draws an option's media before its label", () => {
    render(
      <FacetFilter
        label="Vendor"
        options={[
          {
            value: "opaline",
            label: "Opaline Parfums",
            count: 3,
            media: <img alt="" src="/opaline.png" data-testid="media" />,
          },
        ]}
        value={[]}
        onValueChange={() => {}}
        open
      />
    )
    const item = screen.getByRole("menuitemcheckbox", { name: /Opaline/ })
    expect(item.querySelector("[data-testid=media]")).toBeTruthy()
  })
})
