import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { tr } from "react-day-picker/locale"
import { describe, expect, it } from "vitest"

import { DATE_RANGE_PRESETS, DatePicker, DateRangePicker } from "@/index"

const noop = () => {}
const DAY = new Date(2024, 2, 4, 9, 30)
const RANGE = { from: new Date(2024, 2, 4), to: new Date(2024, 2, 12) }

describe("DatePicker", () => {
  it("shows the date and the calendar in English by default", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<DatePicker value={DAY} onValueChange={noop} />)
    await user.click(screen.getByRole("button", { name: "Mar 4, 2024" }))
    expect(
      screen.getByRole("button", { name: "Go to the Previous Month" })
    ).toBeTruthy()
    unmount()

    render(<DatePicker value={DAY} onValueChange={noop} withTime />)
    expect(
      screen.getByRole("button", { name: "Mar 4, 2024, 9:30 AM" })
    ).toBeTruthy()
  })

  it("formats the date and translates the calendar with locale", async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <DatePicker value={DAY} onValueChange={noop} locale={tr} />
    )
    await user.click(screen.getByRole("button", { name: "4 Mar 2024" }))
    expect(screen.getByRole("button", { name: "Önceki aya git" })).toBeTruthy()
    unmount()

    render(<DatePicker value={DAY} onValueChange={noop} locale={tr} withTime />)
    expect(
      screen.getByRole("button", { name: "4 Mar 2024, 09:30" })
    ).toBeTruthy()
  })
})

describe("DateRangePicker", () => {
  it("shows the range, presets and calendar in English by default", async () => {
    const user = userEvent.setup()
    render(<DateRangePicker value={RANGE} onValueChange={noop} />)
    await user.click(
      screen.getByRole("button", { name: "Mar 4, 2024 – Mar 12, 2024" })
    )
    expect(screen.getByRole("listbox", { name: "Presets" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "Last 7 days" })).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Go to the Previous Month" })
    ).toBeTruthy()
  })

  it("takes a locale, a presets label and translated presets", async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        value={RANGE}
        onValueChange={noop}
        locale={tr}
        presetsLabel="Hazır aralıklar"
        presets={DATE_RANGE_PRESETS.map((preset) => ({
          ...preset,
          label: preset.label === "Last 7 days" ? "Son 7 gün" : preset.label,
        }))}
      />
    )
    await user.click(
      screen.getByRole("button", { name: "4 Mar 2024 – 12 Mar 2024" })
    )
    expect(
      screen.getByRole("listbox", { name: "Hazır aralıklar" })
    ).toBeTruthy()
    expect(screen.getByRole("option", { name: "Son 7 gün" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Önceki aya git" })).toBeTruthy()
  })
})
