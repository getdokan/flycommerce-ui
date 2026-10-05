import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Item = { id: string; name: string }

const columns: ColumnDef<Item, unknown>[] = [
  { accessorKey: "name", header: "Name" },
]
const data: Item[] = [{ id: "1", name: "Yoga Mat" }]

describe("DataTable loading", () => {
  it("marks the table busy and announces the loading label", () => {
    const { rerender } = render(
      <DataTable columns={columns} data={data} loading />
    )
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true")
    const status = screen.getByText("Loading…")
    expect(status.getAttribute("role")).toBe("status")
    expect(status.closest("[aria-busy]")).toBeNull()

    rerender(<DataTable columns={columns} data={data} />)
    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false)
    expect(screen.queryByText("Loading…")).toBeNull()
    expect(screen.getByText("Yoga Mat")).toBeTruthy()
  })

  it("keeps the status region mounted so the change is announced", () => {
    const { rerender } = render(<DataTable columns={columns} data={data} />)
    const region = screen
      .getAllByRole("status")
      .find((element) => element.textContent === "")
    expect(region).toBeTruthy()

    rerender(<DataTable columns={columns} data={data} loading />)
    expect(region?.textContent).toBe("Loading…")
  })

  it("uses labels.loading", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        loading
        labels={{ loading: "Cargando…" }}
      />
    )
    expect(screen.getByRole("status").textContent).toBe("Cargando…")
  })

  it("isn't busy while showing an error", () => {
    render(
      <DataTable columns={columns} data={data} loading error="Server error" />
    )
    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false)
    expect(screen.queryByText("Loading…")).toBeNull()
  })
})
