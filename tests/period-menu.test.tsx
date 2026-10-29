import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { PeriodMenu, type PeriodMenuProps, type PeriodRange } from "@/index"

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "month", label: "This month" },
]

function DateFilter({
  value: initial = "all",
  range: initialRange,
  onRangeChange,
  ...props
}: Partial<PeriodMenuProps>) {
  const [value, setValue] = React.useState(initial)
  const [range, setRange] = React.useState<PeriodRange | undefined>(
    initialRange
  )
  return (
    <>
      <PeriodMenu
        label="Date"
        presets={PRESETS}
        allLabel="All time"
        {...props}
        value={value}
        onValueChange={setValue}
        range={range}
        onRangeChange={(next) => {
          setRange(next)
          setValue("custom")
          onRangeChange?.(next)
        }}
      />
      <span data-testid="value">{value}</span>
    </>
  )
}

/** The calendar's day buttons that can be picked; read again after each click, as the calendar re-renders them. */
const pickableDays = (calendar: HTMLElement) =>
  within(calendar)
    .getAllByRole("button")
    .filter((day) => day.closest("[data-day]") && !day.hasAttribute("disabled"))

const trigger = () => screen.getByRole("button", { name: /^Date:/ })

describe("PeriodMenu", () => {
  it("reads the period on the trigger and in its name", () => {
    const { unmount } = render(<DateFilter />)
    expect(trigger().textContent).toBe("All time")
    expect(trigger().getAttribute("aria-label")).toBe("Date: All time")
    unmount()

    render(
      <PeriodMenu
        label="Date"
        presets={PRESETS}
        value="month"
        onValueChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("This month")
  })

  it("reads the custom range, with the year when it isn't this year", () => {
    render(
      <PeriodMenu
        label="Date"
        presets={PRESETS}
        value="custom"
        onValueChange={() => {}}
        range={{ from: new Date(2024, 8, 1), to: new Date(2024, 8, 30) }}
        onRangeChange={() => {}}
      />
    )
    expect(trigger().textContent).toBe("Sep 1, 2024 – Sep 30, 2024")
  })

  it("picks a preset or All time from the menu", async () => {
    const user = userEvent.setup()
    render(<DateFilter />)
    await user.click(trigger())
    await user.click(screen.getByRole("menuitemradio", { name: "This month" }))
    expect(screen.getByTestId("value").textContent).toBe("month")
    expect(trigger().textContent).toBe("This month")

    await user.click(trigger())
    expect(
      screen
        .getByRole("menuitemradio", { name: "This month" })
        .getAttribute("aria-checked")
    ).toBe("true")
    await user.click(screen.getByRole("menuitemradio", { name: "All time" }))
    expect(screen.getByTestId("value").textContent).toBe("all")
  })

  it("leaves out All time and Custom range when not asked for", async () => {
    const user = userEvent.setup()
    render(
      <PeriodMenu
        label="Date"
        presets={PRESETS}
        value="today"
        onValueChange={() => {}}
      />
    )
    await user.click(trigger())
    expect(screen.queryByRole("menuitemradio", { name: "All time" })).toBeNull()
    expect(screen.queryByRole("menuitem", { name: /Custom range/ })).toBeNull()
  })

  it("picks a custom range on the calendar and applies it", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    const max = new Date()
    render(<DateFilter onRangeChange={onRangeChange} maxDate={max} />)
    await user.click(trigger())
    await user.click(screen.getByRole("menuitem", { name: /Custom range/ }))

    const calendar = await screen.findByRole("dialog", { name: "Custom range" })
    const apply = within(calendar).getByRole("button", { name: "Apply" })
    expect((apply as HTMLButtonElement).disabled).toBe(true)

    await user.click(pickableDays(calendar)[2]!)
    await user.click(pickableDays(calendar)[5]!)
    await user.click(apply)

    expect(onRangeChange).toHaveBeenCalledTimes(1)
    const picked = onRangeChange.mock.calls[0]![0] as PeriodRange
    expect(picked.from < picked.to).toBe(true)
    expect(screen.getByTestId("value").textContent).toBe("custom")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it("applies one day as a one-day range", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    render(<DateFilter onRangeChange={onRangeChange} />)
    await user.click(trigger())
    await user.click(screen.getByRole("menuitem", { name: /Custom range/ }))
    const calendar = await screen.findByRole("dialog", { name: "Custom range" })
    await user.click(pickableDays(calendar)[0]!)
    await user.click(within(calendar).getByRole("button", { name: "Apply" }))
    const picked = onRangeChange.mock.calls[0]![0] as PeriodRange
    expect(picked.from.getTime()).toBe(picked.to.getTime())
  })

  it("keeps the period on Cancel and returns focus to the trigger", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()
    render(<DateFilter value="month" onRangeChange={onRangeChange} />)
    await user.click(trigger())
    await user.click(screen.getByRole("menuitem", { name: /Custom range/ }))
    const calendar = await screen.findByRole("dialog", { name: "Custom range" })
    await user.click(within(calendar).getByRole("button", { name: "Cancel" }))
    expect(onRangeChange).not.toHaveBeenCalled()
    expect(trigger().textContent).toBe("This month")
    expect(document.activeElement).toBe(trigger())
  })

  it("can't pick a day after maxDate", async () => {
    const user = userEvent.setup()
    const max = new Date(2026, 9, 15)
    render(<DateFilter maxDate={max} />)
    await user.click(trigger())
    await user.click(screen.getByRole("menuitem", { name: /Custom range/ }))
    const calendar = await screen.findByRole("dialog", { name: "Custom range" })
    const day = (name: string) =>
      within(calendar).getByRole("button", { name: new RegExp(`^${name}`) })
    expect(day("Thursday, October 15th, 2026").hasAttribute("disabled")).toBe(
      false
    )
    const sixteenth = day("Friday, October 16th, 2026")
    expect(sixteenth?.hasAttribute("disabled")).toBe(true)
  })
})
