import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { ColumnDef } from "@/index"

type Brand = { id: string; name: string }

const columns: ColumnDef<Brand, unknown>[] = [
  { accessorKey: "name", header: "Brand" },
]
const brands: Brand[] = [
  { id: "a", name: "Yoga Mat" },
  { id: "b", name: "Abstract Art" },
  { id: "c", name: "Custom Dog Collar" },
]

const SORTABLE_ROWS = "@/components/data-table/sortable-rows"

const freshDataTable = async () =>
  (await import("@/components/data-table")).DataTable

const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)))

class Boundary extends React.Component<
  { onError: (error: unknown) => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

afterEach(() => {
  vi.doUnmock(SORTABLE_ROWS)
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("DataTable reorder module", () => {
  it("never imports it for a table without onReorder", async () => {
    const factory = vi.fn(() => ({ default: () => null }))
    vi.doMock(SORTABLE_ROWS, factory)
    const DataTable = await freshDataTable()

    render(
      <DataTable columns={columns} data={brands} getRowId={(row) => row.id} />
    )
    await settle()

    expect(factory).not.toHaveBeenCalled()
  })

  it("starts importing it while a reorderable table is still loading", async () => {
    const factory = vi.fn(async (importOriginal: () => Promise<unknown>) =>
      importOriginal()
    )
    vi.doMock(SORTABLE_ROWS, factory)
    const DataTable = await freshDataTable()

    render(
      <DataTable columns={columns} data={[]} loading onReorder={() => {}} />
    )
    await settle()

    expect(factory).toHaveBeenCalledTimes(1)
  })

  it("keeps the rows, without drag handles, when the import fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.doMock(SORTABLE_ROWS, () => {
      throw new TypeError("Failed to fetch dynamically imported module")
    })
    const DataTable = await freshDataTable()
    const onError = vi.fn()

    render(
      <Boundary onError={onError}>
        <DataTable
          columns={columns}
          data={brands}
          getRowId={(row) => row.id}
          onReorder={() => {}}
        />
      </Boundary>
    )
    await settle()

    expect(onError).not.toHaveBeenCalled()
    expect(screen.getAllByRole("row")).toHaveLength(4)
    expect(screen.getByText("Custom Dog Collar")).toBeTruthy()
    expect(
      screen.queryAllByRole("button", { name: /^Drag to reorder row/ })
    ).toHaveLength(0)
  })
})
