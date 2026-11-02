import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Product = { id: string; title: string }

const columns: ColumnDef<Product, unknown>[] = [
  { accessorKey: "title", header: "Product" },
]
const data: Product[] = [
  { id: "1", title: "Silk twill scarf, ivory" },
  { id: "2", title: "Glass bud vase" },
]

const checkboxNames = () =>
  screen
    .getAllByRole("checkbox")
    .map((checkbox) => checkbox.getAttribute("aria-label"))

describe("DataTable row checkbox names", () => {
  it("names each row's checkbox after getRowLabel, and keeps the header's name", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.title}
        enableRowSelection
        labels={{ selectAll: "Select every product on this page" }}
      />
    )
    expect(checkboxNames()).toEqual([
      "Select every product on this page",
      "Select Silk twill scarf, ivory",
      "Select Glass bud vase",
    ])
  })

  it("lets a translation order the words", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowLabel={(row) => row.title}
        enableRowSelection
        labels={{ selectNamedRow: (name) => `${name} auswählen` }}
      />
    )
    expect(
      screen.getByRole("checkbox", { name: "Glass bud vase auswählen" })
    ).toBeTruthy()
  })

  it("keeps selectRow without getRowLabel, or when it gives an empty or blank name", () => {
    const { unmount } = render(
      <DataTable columns={columns} data={data} enableRowSelection />
    )
    expect(checkboxNames().slice(1)).toEqual(["Select row", "Select row"])
    unmount()

    render(
      <DataTable
        columns={columns}
        data={data}
        getRowLabel={(row) => (row.id === "1" ? "  " : row.title)}
        enableRowSelection
        labels={{ selectRow: "Pick", selectNamedRow: (name) => `Pick ${name}` }}
      />
    )
    expect(checkboxNames().slice(1)).toEqual(["Pick", "Pick Glass bud vase"])
  })

  it("reads a name that isn't a string at runtime as text instead of crashing", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        // An untyped API field, e.g. an order number sent as a number.
        getRowLabel={(row) => Number(row.id) as unknown as string}
        enableRowSelection
      />
    )
    expect(checkboxNames().slice(1)).toEqual(["Select 1", "Select 2"])
  })

  it("falls back to selectRow for an object name, or an empty selectNamedRow", () => {
    const { unmount } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowLabel={(row) =>
          (row.id === "1" ? { en: row.title } : row.title) as unknown as string
        }
        enableRowSelection
      />
    )
    expect(checkboxNames().slice(1)).toEqual([
      "Select row",
      "Select Glass bud vase",
    ])
    unmount()

    render(
      <DataTable
        columns={columns}
        data={data}
        getRowLabel={(row) => row.title}
        enableRowSelection
        labels={{ selectNamedRow: () => "" }}
      />
    )
    expect(checkboxNames().slice(1)).toEqual(["Select row", "Select row"])
  })

  it("keeps a translated selectRow until the app translates selectNamedRow", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowLabel={(row) => row.title}
        enableRowSelection
        labels={{ selectRow: "Satır seç" }}
      />
    )
    expect(checkboxNames().slice(1)).toEqual(["Satır seç", "Satır seç"])
  })

  it("follows a renamed row and a new inline getRowLabel without remounting the checkbox", () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.title}
        enableRowSelection
      />
    )
    const vase = screen.getByRole("checkbox", { name: "Select Glass bud vase" })
    vase.focus()

    rerender(
      <DataTable
        columns={columns}
        data={[data[0]!, { id: "2", title: "Glass bud vase, tall" }]}
        getRowId={(row) => row.id}
        getRowLabel={(row) => `${row.title} (${row.id})`}
        enableRowSelection
      />
    )
    expect(
      screen.getByRole("checkbox", { name: "Select Glass bud vase, tall (2)" })
    ).toBe(vase)
    expect(document.activeElement).toBe(vase)
  })
})

describe("DataTable row names on a reorderable table", () => {
  // dnd-kit's keyboard sensor moves between measured rects; jsdom measures every box as 0×0.
  beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        const row = this.closest("tr")
        const index = row
          ? Array.from(row.parentElement!.children).indexOf(row)
          : 0
        return DOMRect.fromRect({ x: 0, y: index * 48, width: 600, height: 48 })
      }
    )
  })
  afterEach(() => vi.restoreAllMocks())

  it("names the checkboxes once the sortable rows have loaded", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.title}
        enableRowSelection
        onReorder={() => {}}
      />
    )
    await screen.findAllByRole("button", { name: /^Drag to reorder row/ })
    expect(checkboxNames().slice(1)).toEqual([
      "Select Silk twill scarf, ivory",
      "Select Glass bud vase",
    ])
  })

  it("announces a row with a blank name as Row n, as its checkbox falls back too", async () => {
    const user = userEvent.setup()
    const pickedUp = vi.fn(
      (label: string, position: number, total: number) =>
        `Picked up ${label}, position ${position} of ${total}.`
    )
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        getRowLabel={(row) => (row.id === "1" ? " " : row.title)}
        enableRowSelection
        onReorder={() => {}}
        labels={{ pickedUp }}
      />
    )
    const [first] = await screen.findAllByRole("button", {
      name: /^Drag to reorder row/,
    })
    first!.focus()
    await user.keyboard(" ")
    expect(pickedUp).toHaveBeenCalledWith("Row 1", 1, 2)
    await user.keyboard("{Escape}")
  })
})
