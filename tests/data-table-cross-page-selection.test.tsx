import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTable, type ColumnDef, type RowSelectionState } from "@/index"

type File = { id: string; name: string }

const FILES: File[] = Array.from({ length: 5 }, (_, index) => ({
  id: `f${index + 1}`,
  name: `file-${index + 1}.jpg`,
}))
const PAGE_SIZE = 2

const columns: ColumnDef<File, unknown>[] = [
  { accessorKey: "name", header: "File" },
]

type BulkActions = (selected: File[], clear: () => void, ids: string[]) => void

function Library({
  crossPageSelection = true,
  initialSelection = {},
  withRowId = true,
  controlled = true,
  onBulk,
}: {
  crossPageSelection?: boolean
  initialSelection?: RowSelectionState
  withRowId?: boolean
  controlled?: boolean
  onBulk: BulkActions
}) {
  const [page, setPage] = React.useState(1)
  const [rowSelection, setRowSelection] = React.useState(initialSelection)
  return (
    <DataTable
      columns={columns}
      data={FILES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
      getRowId={withRowId ? (file) => file.id : undefined}
      enableRowSelection
      rowSelection={controlled ? rowSelection : undefined}
      onRowSelectionChange={controlled ? setRowSelection : undefined}
      crossPageSelection={crossPageSelection}
      bulkActions={(selected, clear, ids) => {
        onBulk(selected, clear, ids)
        return <button type="button">Delete</button>
      }}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        total: FILES.length,
        onPageChange: setPage,
      }}
    />
  )
}

const tick = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(
    screen.getByText(name).closest("tr")!.querySelector("[role=checkbox]")!
  )
const selectAll = () =>
  screen.getByRole("checkbox", { name: "Select all rows" })
const lastCall = (onBulk: ReturnType<typeof vi.fn<BulkActions>>) =>
  onBulk.mock.calls.at(-1)!

describe("DataTable crossPageSelection", () => {
  it("counts and passes on ticks from every page", async () => {
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} />)

    await tick(user, "file-1.jpg")
    await tick(user, "file-2.jpg")
    await user.click(screen.getByRole("button", { name: /Next/ }))
    expect(screen.getByText("2 selected")).toBeTruthy()
    expect(selectAll().getAttribute("aria-checked")).toBe("false")

    await tick(user, "file-3.jpg")
    expect(screen.getByText("3 selected")).toBeTruthy()
    const [selected, , ids] = lastCall(onBulk)
    expect(ids).toEqual(["f1", "f2", "f3"])
    expect(selected.map((file) => file.name)).toEqual([
      "file-1.jpg",
      "file-2.jpg",
      "file-3.jpg",
    ])
  })

  it("ticks and clears only this page from the header checkbox", async () => {
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} />)

    await tick(user, "file-1.jpg")
    await user.click(screen.getByRole("button", { name: /Next/ }))
    await user.click(selectAll())
    expect(selectAll().getAttribute("aria-checked")).toBe("true")
    expect(lastCall(onBulk)[2]).toEqual(["f1", "f3", "f4"])

    await user.click(selectAll())
    expect(lastCall(onBulk)[2]).toEqual(["f1"])
    expect(screen.getByText("1 selected")).toBeTruthy()
  })

  it("empties every page with Clear", async () => {
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} />)

    await tick(user, "file-1.jpg")
    await user.click(screen.getByRole("button", { name: /Next/ }))
    await tick(user, "file-3.jpg")
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.queryByText(/selected$/)).toBeNull()
    await user.click(screen.getByRole("button", { name: /Previous/ }))
    expect(screen.queryByText(/selected$/)).toBeNull()
    expect(selectAll().getAttribute("aria-checked")).toBe("false")
  })

  it("counts ids whose rows were never loaded, without a row for them", () => {
    const onBulk = vi.fn<BulkActions>()
    render(
      <Library onBulk={onBulk} initialSelection={{ f1: true, f5: true }} />
    )

    expect(screen.getByText("2 selected")).toBeTruthy()
    const [selected, , ids] = lastCall(onBulk)
    expect(ids).toEqual(["f1", "f5"])
    expect(selected.map((file) => file.id)).toEqual(["f1"])
  })

  it("counts only this page's ticks without it", async () => {
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} crossPageSelection={false} />)

    await tick(user, "file-1.jpg")
    await tick(user, "file-2.jpg")
    expect(screen.getByText("2 selected")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: /Next/ }))
    expect(screen.queryByText(/selected$/)).toBeNull()

    await tick(user, "file-3.jpg")
    expect(screen.getByText("1 selected")).toBeTruthy()
    const [selected, , ids] = lastCall(onBulk)
    expect(ids).toEqual(["f3"])
    expect(selected.map((file) => file.id)).toEqual(["f3"])
  })

  it("stays per page without getRowId, whose index ids repeat on every page", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} withRowId={false} />)

    await tick(user, "file-1.jpg")
    await tick(user, "file-2.jpg")
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("1 selected")).toBeTruthy()
    expect(lastCall(onBulk)[2]).toEqual(["0"])
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("crossPageSelection")
    )
    warn.mockRestore()
  })

  it("stays per page with an uncontrolled selection, which the app can't reset", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const user = userEvent.setup()
    const onBulk = vi.fn<BulkActions>()
    render(<Library onBulk={onBulk} controlled={false} />)

    await tick(user, "file-1.jpg")
    await user.click(screen.getByRole("button", { name: /Next/ }))
    expect(screen.queryByText(/selected$/)).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it("keeps ticked sub-rows from other pages in selected", async () => {
    type Node = { id: string; name: string; children?: Node[] }
    const PAGES: Node[][] = [
      [{ id: "a", name: "Shoes", children: [{ id: "a1", name: "Boots" }] }],
      [{ id: "b", name: "Bags" }],
    ]
    const onBulk = vi.fn<(selected: Node[], ids: string[]) => void>()
    function Tree() {
      const [page, setPage] = React.useState(1)
      const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {}
      )
      return (
        <DataTable
          columns={[{ accessorKey: "name", header: "Name" }]}
          data={PAGES[page - 1]}
          getRowId={(node) => node.id}
          getSubRows={(node) => node.children}
          defaultExpanded={true}
          enableRowSelection
          crossPageSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          bulkActions={(selected, _, ids) => {
            onBulk(selected, ids)
            return null
          }}
          pagination={{
            page,
            pageSize: 1,
            total: 2,
            onPageChange: setPage,
          }}
        />
      )
    }
    const user = userEvent.setup()
    render(<Tree />)

    await tick(user, "Shoes")
    await user.click(screen.getByRole("button", { name: /Next/ }))
    const [selected, ids] = onBulk.mock.calls.at(-1)!
    expect(ids).toEqual(["a", "a1"])
    expect(selected.map((node) => node.name)).toEqual(["Shoes", "Boots"])
  })
})
