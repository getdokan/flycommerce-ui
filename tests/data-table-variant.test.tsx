import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Category = { id: string; name: string; children?: Category[] }

const columns: ColumnDef<Category, unknown>[] = [
  { accessorKey: "name", header: "Category" },
]
const data: Category[] = [
  {
    id: "1",
    name: "Fashion",
    children: [{ id: "2", name: "Dresses" }],
  },
  { id: "3", name: "Beauty" },
]

const table = () => screen.getByRole("table")
const header = () => table().querySelector("thead") as HTMLElement
const head = () => screen.getByRole("columnheader", { name: "Category" })

describe("DataTable variant", () => {
  it("keeps the banded, uppercase header and roomy rows by default", () => {
    render(<DataTable columns={columns} data={data} />)

    expect(table().getAttribute("data-variant")).toBe("default")
    expect(header().classList.contains("bg-card-header")).toBe(true)
    expect(head().classList.contains("uppercase")).toBe(true)
    expect(
      screen.getByRole("cell", { name: "Beauty" }).classList.contains("py-5")
    ).toBe(true)
  })

  it("draws the light list: no band, a sentence-case header, 12px cells", () => {
    render(<DataTable variant="list" columns={columns} data={data} />)

    expect(table().getAttribute("data-variant")).toBe("list")
    expect(header().classList.contains("bg-card-header")).toBe(false)
    expect(head().classList.contains("uppercase")).toBe(false)
    expect(head().classList.contains("font-medium")).toBe(true)
    expect(
      screen.getByRole("cell", { name: "Beauty" }).classList.contains("py-3")
    ).toBe(true)
  })

  it("passes the row size through", () => {
    render(<DataTable variant="list" size="sm" columns={columns} data={data} />)

    expect(table().getAttribute("data-size")).toBe("sm")
    expect(
      screen.getByRole("cell", { name: "Beauty" }).classList.contains("py-2")
    ).toBe(true)
  })

  it("leaves an expanded tree row untinted in the list look", async () => {
    render(
      <DataTable
        variant="list"
        columns={columns}
        data={data}
        getSubRows={(row) => row.children}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "Expand row" }))

    const parent = screen.getByText("Fashion").closest("tr") as HTMLElement
    expect(parent.className).not.toMatch(/has-aria-expanded:bg-card-header/)
    expect(screen.getByText("Dresses")).toBeTruthy()
  })

  it("tints only clickable rows on hover in the list look", () => {
    const onRowClick = vi.fn()
    const { unmount } = render(
      <DataTable variant="list" columns={columns} data={data} />
    )
    expect(
      screen.getByText("Beauty").closest("tr")?.hasAttribute("data-clickable")
    ).toBe(false)
    unmount()

    render(
      <DataTable
        variant="list"
        columns={columns}
        data={data}
        onRowClick={onRowClick}
      />
    )
    expect(
      screen.getByText("Beauty").closest("tr")?.hasAttribute("data-clickable")
    ).toBe(true)
  })
})
