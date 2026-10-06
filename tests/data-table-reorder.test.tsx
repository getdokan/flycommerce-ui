import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Brand = { id: string; name: string }

const columns: ColumnDef<Brand, unknown>[] = [
  { accessorKey: "name", header: "Brand" },
]
const brands: Brand[] = [
  { id: "a", name: "Yoga Mat" },
  { id: "b", name: "Abstract Art" },
  { id: "c", name: "Custom Dog Collar" },
]

const handles = () =>
  screen.queryAllByRole("button", { name: /^Drag to reorder row/ })

// dnd-kit's keyboard sensor moves between measured rects; jsdom measures every box as 0×0.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const row = this.closest("tr")
      const index = row
        ? Array.from(row.parentElement!.children).indexOf(row)
        : 0
      const top = index * 48
      return DOMRect.fromRect({ x: 0, y: top, width: 600, height: 48 })
    }
  )
})
afterEach(() => vi.restoreAllMocks())

describe("DataTable reorder", () => {
  it("renders plain rows first, then drag handles once dnd-kit has loaded", async () => {
    render(
      <DataTable
        columns={columns}
        data={brands}
        getRowId={(row) => row.id}
        onReorder={() => {}}
      />
    )
    expect(screen.getAllByRole("row")).toHaveLength(4)
    expect(handles()).toHaveLength(0)

    expect(
      await screen.findAllByRole("button", { name: /^Drag to reorder row/ })
    ).toHaveLength(3)
    expect(screen.getAllByRole("row")).toHaveLength(4)
    const results = await axe.run(document.body, {
      rules: { region: { enabled: false } },
    })
    expect(results.violations.map((v) => v.id)).toEqual([])
  })

  it("never loads dnd-kit for a table without onReorder", async () => {
    render(
      <DataTable columns={columns} data={brands} getRowId={(row) => row.id} />
    )
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect(handles()).toHaveLength(0)
    expect(screen.queryByRole("columnheader", { name: "Reorder" })).toBeNull()
  })

  it("reorders from the keyboard and announces each step", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    const labels = {
      pickedUp: vi.fn(
        (label: string, position: number, total: number) =>
          `Picked up ${label}, position ${position} of ${total}.`
      ),
      movedTo: vi.fn(
        (label: string, position: number, total: number) =>
          `${label} moved to position ${position} of ${total}.`
      ),
      droppedAt: vi.fn(
        (label: string, position: number, total: number) =>
          `${label} dropped at position ${position} of ${total}.`
      ),
    }
    render(
      <DataTable
        columns={columns}
        data={brands}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        onReorder={onReorder}
        labels={labels}
      />
    )
    const [first] = await screen.findAllByRole("button", {
      name: /^Drag to reorder row/,
    })
    first.focus()
    await user.keyboard(" ")
    await user.keyboard("{ArrowDown}")
    await user.keyboard(" ")

    expect(labels.pickedUp).toHaveBeenCalledWith("Yoga Mat", 1, 3)
    expect(labels.movedTo).toHaveBeenLastCalledWith("Yoga Mat", 2, 3)
    expect(labels.droppedAt).toHaveBeenCalledWith("Yoga Mat", 2, 3)
    expect(
      screen
        .getAllByRole("status")
        .some(
          (region) =>
            region.textContent === "Yoga Mat dropped at position 2 of 3."
        )
    ).toBe(true)
    expect(onReorder).toHaveBeenCalledWith([brands[1], brands[0], brands[2]], {
      from: 0,
      to: 1,
    })
  })
})
