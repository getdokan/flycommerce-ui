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
    const trigger = () => screen.getByRole("button", { name: /^Payment/ })
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
    // The name starts with what is on screen, so speech control can say "Payment, 2".
    expect(trigger().getAttribute("aria-label")).toBe(
      "Payment, 2: Paid, Unpaid"
    )
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

  it("stays open while ticking, by click, Enter and Space", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetFilter
        label="Payment"
        options={OPTIONS}
        value={[]}
        onValueChange={onValueChange}
      />
    )
    await user.click(screen.getByRole("button", { name: "Payment: all" }))
    await user.click(screen.getByRole("menuitemcheckbox", { name: /^Paid/ }))
    expect(screen.getByRole("menu")).toBeTruthy()

    screen.getByRole("menuitemcheckbox", { name: /^Unpaid/ }).focus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onValueChange).toHaveBeenCalledTimes(3)
    expect(screen.getByRole("menu")).toBeTruthy()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("keeps and counts a picked value that has no option, and Clear removes it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetFilter
        label="Vendor"
        options={OPTIONS}
        value={["ghost"]}
        onValueChange={onValueChange}
      />
    )
    const button = screen.getByRole("button", { name: "Vendor, 1" })
    expect(button.getAttribute("data-picked")).toBe("1")

    await user.click(button)
    await user.click(screen.getByRole("menuitemcheckbox", { name: /^Paid/ }))
    expect(onValueChange).toHaveBeenLastCalledWith(["paid", "ghost"])

    await user.click(screen.getByRole("menuitem", { name: "Clear" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("leaves a disabled pick to the app, and offers Clear only when it would change something", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const options = [
      { value: "paid", label: "Paid" },
      { value: "locked", label: "Locked", disabled: true },
    ]
    const { rerender } = render(
      <FacetFilter
        label="Payment"
        options={options}
        value={["locked"]}
        onValueChange={onValueChange}
        open
      />
    )
    expect(screen.queryByRole("menuitem", { name: "Clear" })).toBeNull()

    rerender(
      <FacetFilter
        label="Payment"
        options={options}
        value={["paid", "locked"]}
        onValueChange={onValueChange}
        open
      />
    )
    await user.click(screen.getByRole("menuitem", { name: "Clear" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["locked"])
  })
})

const TYPES = [
  { value: "images", label: "Images", count: 1204 },
  { value: "videos", label: "Videos", count: 3 },
  { value: "documents", label: "Documents" },
]

describe("FacetFilter mode=single", () => {
  it("reads the all label, then the pick, and names the filter", () => {
    const { rerender } = render(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value={null}
        onValueChange={() => {}}
      />
    )
    const trigger = () => screen.getByRole("button", { name: /^Type/ })
    expect(trigger().textContent).toBe("All types")
    expect(trigger().getAttribute("aria-label")).toBe("Type: All types")
    expect(trigger().getAttribute("data-picked")).toBeNull()

    rerender(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value="videos"
        onValueChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("Videos")
    expect(trigger().getAttribute("aria-label")).toBe("Type: Videos")
    expect(trigger().getAttribute("data-picked")).toBe("1")
  })

  it("lists the all row first, then the options as radio items with their counts, under the heading", () => {
    render(
      <FacetFilter
        mode="single"
        label="Date"
        heading="Uploaded"
        allLabel="All dates"
        allCount={1207}
        options={TYPES}
        value="images"
        onValueChange={() => {}}
        locale="en-US"
        open
      />
    )
    expect(screen.getByText("Uploaded")).toBeTruthy()
    expect(screen.queryByText("Date")).toBeNull()
    const items = screen.getAllByRole("menuitemradio")
    expect(items.map((item) => item.textContent)).toEqual([
      "All dates1,207",
      "Images1,204",
      "Videos3",
      "Documents—",
    ])
    expect(items[1]!.getAttribute("aria-checked")).toBe("true")
    expect(items[0]!.getAttribute("aria-checked")).toBe("false")
    expect(screen.queryByRole("menuitemcheckbox")).toBeNull()
    expect(screen.queryByRole("menuitem", { name: "Clear" })).toBeNull()
  })

  it("shows no count on the all row without allCount", () => {
    render(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value={null}
        onValueChange={() => {}}
        open
      />
    )
    const all = screen.getByRole("menuitemradio", { name: "All types" })
    expect(all.textContent).toBe("All types")
    expect(all.getAttribute("aria-checked")).toBe("true")
  })

  it("applies a pick at once, closes the menu and returns focus to the trigger", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value={null}
        onValueChange={onValueChange}
      />
    )
    const trigger = screen.getByRole("button", { name: "Type: All types" })
    await user.click(trigger)
    await user.click(screen.getByRole("menuitemradio", { name: /^Videos/ }))
    expect(onValueChange).toHaveBeenCalledWith("videos")
    expect(screen.queryByRole("menu")).toBeNull()
    expect(document.activeElement).toBe(trigger)

    await user.keyboard("{Enter}")
    screen.getByRole("menuitemradio", { name: /^Documents/ }).focus()
    await user.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("documents")
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("empties the pick from the all row, and ignores the row already picked", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value="images"
        onValueChange={onValueChange}
        open
      />
    )
    await user.click(screen.getByRole("menuitemradio", { name: /^Images/ }))
    expect(onValueChange).not.toHaveBeenCalled()

    rerender(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value="images"
        onValueChange={onValueChange}
        open
      />
    )
    await user.click(screen.getByRole("menuitemradio", { name: "All types" }))
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("reads the all label for a value with no option, and the all row clears it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FacetFilter
        mode="single"
        label="Date"
        allLabel="All dates"
        options={TYPES}
        value="2026-05"
        onValueChange={onValueChange}
      />
    )
    const trigger = screen.getByRole("button", { name: "Date: All dates" })
    expect(trigger.textContent).toBe("All dates")
    expect(trigger.getAttribute("data-picked")).toBeNull()

    await user.click(trigger)
    const all = screen.getByRole("menuitemradio", { name: "All dates" })
    expect(all.getAttribute("aria-checked")).toBe("true")
    await user.click(all)
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("reads the all label until the picked value's option arrives", () => {
    const { rerender } = render(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={[]}
        value="videos"
        onValueChange={() => {}}
      />
    )
    const trigger = () => screen.getByRole("button", { name: /^Type/ })
    expect(trigger().textContent).toBe("All types")

    rerender(
      <FacetFilter
        mode="single"
        label="Type"
        allLabel="All types"
        options={TYPES}
        value="videos"
        onValueChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("Videos")
    expect(trigger().getAttribute("aria-label")).toBe("Type: Videos")
  })

  it("heads the menu with heading in the default mode too", () => {
    render(
      <FacetFilter
        label="Payment"
        heading="Payment status"
        options={OPTIONS}
        value={[]}
        onValueChange={() => {}}
        open
      />
    )
    expect(screen.getByText("Payment status")).toBeTruthy()
  })
})
