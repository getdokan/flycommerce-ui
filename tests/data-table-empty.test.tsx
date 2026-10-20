import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataTable, EmptyState, IconProvider, type ColumnDef } from "@/index"

type Item = { id: string; name: string }

const columns: ColumnDef<Item, unknown>[] = [
  { accessorKey: "name", header: "Name" },
]

describe("DataTable empty and error states", () => {
  it("shows the empty state in place of the table, with no column names", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        toolbar={<input aria-label="Search" />}
      />
    )
    expect(screen.queryByRole("table")).toBeNull()
    expect(screen.queryByText("Name")).toBeNull()
    expect(screen.getByText("Nothing here yet")).toBeTruthy()
    expect(screen.getByRole("textbox", { name: "Search" })).toBeTruthy()
  })

  it("does the same for the error state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        error="The server didn't respond."
      />
    )
    expect(screen.queryByRole("table")).toBeNull()
    expect(screen.getByText("Couldn't load this list")).toBeTruthy()
    expect(screen.getByText("The server didn't respond.")).toBeTruthy()
  })

  it("keeps the header and skeleton rows while loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} loading skeletonRows={3} />
    )
    expect(screen.getByRole("table")).toBeTruthy()
    expect(screen.getByText("Name")).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
    expect(screen.queryByText("Nothing here yet")).toBeNull()
  })

  it("keeps the column names with showHeaderWhenEmpty", () => {
    render(<DataTable columns={columns} data={[]} showHeaderWhenEmpty />)
    expect(screen.getByRole("table")).toBeTruthy()
    expect(screen.getByText("Name")).toBeTruthy()
    expect(screen.getByText("Nothing here yet")).toBeTruthy()
  })

  it("shows a screen's own EmptyState passed as empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        empty={
          <EmptyState
            title="No orders match"
            description="Nothing fits these filters."
          />
        }
      />
    )
    expect(screen.getByText("No orders match")).toBeTruthy()
    expect(screen.queryByText("Nothing here yet")).toBeNull()
  })

  it("marks the state busy while an empty list refreshes, as the table would be", () => {
    render(<DataTable columns={columns} data={[]} refreshing />)
    expect(screen.queryByRole("table")).toBeNull()
    expect(
      document
        .querySelector('[data-slot="data-table-state"]')
        ?.getAttribute("aria-busy")
    ).toBe("true")
  })

  it("draws its tiles from the icon set, so an IconProvider swap reaches them", () => {
    const Swapped = () => <svg data-testid="swapped-empty" />
    render(
      <IconProvider glyphs={{ empty: Swapped }}>
        <DataTable columns={columns} data={[]} />
      </IconProvider>
    )
    expect(screen.getByTestId("swapped-empty")).toBeTruthy()
  })
})
