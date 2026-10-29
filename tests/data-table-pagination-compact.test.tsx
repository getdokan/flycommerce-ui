import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTable, DataTablePagination, type ColumnDef } from "@/index"

const noop = () => {}
const labels = {
  showing: (from: number, to: number, total: number) =>
    `${from}–${to} of ${total} files`,
  total: (total: number) => `${total} ${total === 1 ? "file" : "files"}`,
}

describe("DataTablePagination hideSinglePageControls", () => {
  it("shows only the count on a single page", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={24}
        total={1}
        onPageChange={noop}
        showPageNumbers
        hideSinglePageControls
        labels={labels}
      />
    )
    expect(screen.getByText("1 file")).toBeTruthy()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("keeps Previous on a page past the last one, so it isn't a dead end", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <DataTablePagination
        page={3}
        pageSize={24}
        total={3}
        onPageChange={onPageChange}
        hideSinglePageControls
        labels={labels}
      />
    )
    await user.click(screen.getByRole("button", { name: /Previous/ }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("keeps the rows-per-page select mounted when the controls go", () => {
    const props = {
      page: 1,
      total: 42,
      onPageChange: noop,
      onPageSizeChange: noop,
      hideSinglePageControls: true,
    }
    const { rerender } = render(
      <DataTablePagination {...props} pageSize={25} />
    )
    const select = screen.getByRole("combobox")
    rerender(<DataTablePagination {...props} pageSize={50} />)
    expect(screen.queryByRole("button", { name: /Next/ })).toBeNull()
    expect(screen.getByRole("combobox")).toBe(select)
  })

  it("defaults the count to results", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={24}
        total={20}
        onPageChange={noop}
        hideSinglePageControls
      />
    )
    expect(screen.getByText("20 results")).toBeTruthy()
  })

  it("keeps the rows-per-page select on a single page", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={50}
        total={42}
        onPageChange={noop}
        onPageSizeChange={noop}
        hideSinglePageControls
        labels={labels}
      />
    )
    expect(screen.getByText("42 files")).toBeTruthy()
    expect(screen.getByRole("combobox")).toBeTruthy()
  })

  it("shows the range and the controls with more than one page", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={24}
        total={42}
        onPageChange={noop}
        showPageNumbers
        hideSinglePageControls
        labels={labels}
      />
    )
    expect(screen.getByText("1–24 of 42 files")).toBeTruthy()
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Page 2" })).toBeTruthy()
  })

  it("keeps the controls on a single page without it", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={24}
        total={20}
        onPageChange={noop}
      />
    )
    expect(screen.getByText("Showing 1 to 20 of 20")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Next/ })).toBeTruthy()
  })
})

describe("DataTablePagination iconArrows", () => {
  it("names the icon-only arrows from labels and draws the mirrored prev and next icons", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <div dir="rtl">
        <DataTablePagination
          page={2}
          pageSize={24}
          total={72}
          onPageChange={onPageChange}
          iconArrows
          labels={{ previous: "Previous page", next: "Next page" }}
        />
      </div>
    )
    const previous = screen.getByRole("button", { name: "Previous page" })
    const next = screen.getByRole("button", { name: "Next page" })
    expect(previous.textContent).toBe("")
    expect(next.textContent).toBe("")
    expect(
      previous
        .querySelector("[data-icon-name=prev]")
        ?.hasAttribute("data-mirror")
    ).toBe(true)
    expect(next.querySelector("[data-icon-name=next]")).toBeTruthy()

    await user.click(previous)
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    await user.click(next)
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it("renders the arrows as links with getPageHref", () => {
    render(
      <DataTablePagination
        page={2}
        pageSize={24}
        total={72}
        onPageChange={noop}
        getPageHref={(page) => `?page=${page}`}
        iconArrows
      />
    )
    expect(
      screen.getByRole("link", { name: "Previous" }).getAttribute("href")
    ).toBe("?page=1")
    expect(
      screen.getByRole("link", { name: "Next" }).getAttribute("href")
    ).toBe("?page=3")
  })
})

describe("DataTable with a single page", () => {
  it("shows the count in place of the controls", () => {
    type File = { id: string; name: string }
    const columns: ColumnDef<File, unknown>[] = [
      { accessorKey: "name", header: "File" },
    ]
    render(
      <DataTable
        columns={columns}
        data={[{ id: "1", name: "logo.png" }]}
        getRowId={(file) => file.id}
        pagination={{
          page: 1,
          pageSize: 24,
          total: 1,
          onPageChange: noop,
          hideSinglePageControls: true,
          iconArrows: true,
        }}
        labels={labels}
      />
    )
    expect(screen.getByText("1 file")).toBeTruthy()
    expect(
      screen.getByRole("navigation", { name: "Pagination" }).textContent
    ).toBe("1 file")
  })
})
