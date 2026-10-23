import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { tr } from "react-day-picker/locale"
import { describe, expect, it } from "vitest"

import { ActiveFilters, TableFilters, type FilterField } from "@/index"

const noop = () => {}

const FIELDS: FilterField[] = [
  {
    key: "status",
    label: "Status",
    type: "multi",
    options: [
      { value: "paid", label: "Paid" },
      { value: "pending", label: "Pending" },
      { value: "refunded", label: "Refunded" },
    ],
  },
  { key: "created", label: "Created", type: "date-range" },
  { key: "featured", label: "Featured", type: "boolean" },
]

const VALUE = {
  status: ["paid", "pending", "refunded"],
  created: { from: new Date(2026, 9, 20), to: new Date(2026, 9, 25) },
  featured: true,
}

describe("ActiveFilters", () => {
  it("describes chips in English by default", () => {
    render(<ActiveFilters fields={FIELDS} value={VALUE} onValueChange={noop} />)
    expect(screen.getByText("3 selected")).toBeTruthy()
    expect(screen.getByText("Oct 20 – Oct 25")).toBeTruthy()
    expect(screen.getByText("On")).toBeTruthy()
  })

  it("takes translated chip text and formats dates with locale", () => {
    render(
      <ActiveFilters
        fields={FIELDS}
        value={VALUE}
        onValueChange={noop}
        locale={tr}
        labels={{ selected: (count) => `${count} seçili`, on: "Açık" }}
      />
    )
    expect(screen.getByText("3 seçili")).toBeTruthy()
    expect(screen.getByText("20 Eki – 25 Eki")).toBeTruthy()
    expect(screen.getByText("Açık")).toBeTruthy()
  })
})

describe("TableFilters", () => {
  it("names the close button and the date range field in English by default", async () => {
    const user = userEvent.setup()
    render(<TableFilters fields={FIELDS} value={{}} onValueChange={noop} />)
    await user.click(screen.getByRole("button", { name: "Filters" }))
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.getByText("Pick a date range")).toBeTruthy()
  })

  it("translates the close button and the date range field", async () => {
    const user = userEvent.setup()
    render(
      <TableFilters
        fields={FIELDS}
        value={{}}
        onValueChange={noop}
        locale={tr}
        labels={{
          trigger: "Filtreler",
          close: "Kapat",
          dateRangePlaceholder: "Tarih aralığı seçin",
        }}
      />
    )
    await user.click(screen.getByRole("button", { name: "Filtreler" }))
    expect(screen.getByRole("button", { name: "Kapat" })).toBeTruthy()
    expect(screen.getByText("Tarih aralığı seçin")).toBeTruthy()
  })
})
