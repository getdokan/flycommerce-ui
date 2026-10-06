import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Item = { id: string; name: string }

const columns: ColumnDef<Item, unknown>[] = [
  { accessorKey: "name", header: "Name" },
]
const data: Item[] = [
  { id: "1", name: "Yoga Mat" },
  { id: "2", name: "Abstract Art" },
]
const toolbar = <input aria-label="Search" />

describe("DataTable refreshing", () => {
  it("keeps the rows, dims them and shows a progress bar", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} toolbar={toolbar} refreshing />
    )
    expect(screen.getByText("Yoga Mat")).toBeTruthy()
    expect(screen.getByText("Abstract Art")).toBeTruthy()
    expect(container.querySelector("[data-slot=skeleton]")).toBeNull()
    expect(screen.getByRole("progressbar", { name: "Loading…" })).toBeTruthy()
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true")
    expect(
      container.querySelector("[data-slot=table-body]")?.classList
    ).toContain("opacity-50")
  })

  it("keeps the toolbar mounted, so a focused search keeps focus", async () => {
    const { rerender } = render(
      <DataTable columns={columns} data={data} toolbar={toolbar} />
    )
    const search = screen.getByRole("textbox", { name: "Search" })
    await userEvent.type(search, "yo")
    rerender(
      <DataTable columns={columns} data={data} toolbar={toolbar} refreshing />
    )
    expect(screen.getByRole("textbox", { name: "Search" })).toBe(search)
    expect(document.activeElement).toBe(search)

    rerender(<DataTable columns={columns} data={data} toolbar={toolbar} />)
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false)
    expect(document.activeElement).toBe(search)
  })

  it("defers to loading, which shows skeleton rows", () => {
    const { container } = render(
      <DataTable columns={columns} data={data} loading refreshing />
    )
    expect(container.querySelector("[data-slot=skeleton]")).toBeTruthy()
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it("names the progress bar with labels.loading", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        refreshing
        labels={{ loading: "Cargando…" }}
      />
    )
    expect(screen.getByRole("progressbar", { name: "Cargando…" })).toBeTruthy()
  })
})
