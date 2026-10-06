import { createPortal } from "react-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Order = { id: string; number: string }

const columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: "number", header: "Order" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <button type="button">Edit {row.original.number}</button>
        <a href={`#customer-${row.original.id}`}>Customer</a>
        <input aria-label={`Note ${row.original.number}`} />
      </>
    ),
  },
]
const data: Order[] = [
  { id: "1", number: "#1001" },
  { id: "2", number: "#1002" },
]

const rowOf = (text: string) => screen.getByText(text).closest("tr")!

afterEach(() => {
  window.location.hash = ""
})

describe("DataTable row activation", () => {
  it("leaves rows out of the tab order without onRowClick or getRowHref", () => {
    render(<DataTable columns={columns} data={data} />)
    expect(rowOf("#1001").hasAttribute("tabindex")).toBe(false)
  })

  it("focuses rows and opens them with Enter", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)
    const row = rowOf("#1001")
    expect(row.tabIndex).toBe(0)

    await user.tab()
    expect(document.activeElement).toBe(row)
    await user.keyboard(" ")
    expect(onRowClick).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it("ignores clicks and keys that start on interactive content", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        enableRowSelection
      />
    )
    await user.click(screen.getByRole("button", { name: "Edit #1001" }))
    await user.click(screen.getAllByRole("link", { name: "Customer" })[0])
    await user.click(screen.getByRole("textbox", { name: "Note #1001" }))
    await user.keyboard("{Enter}")
    await user.click(screen.getAllByRole("checkbox", { name: "Select row" })[0])
    screen.getByRole("button", { name: "Edit #1002" }).focus()
    await user.keyboard("{Enter}")
    expect(onRowClick).not.toHaveBeenCalled()

    await user.click(screen.getByText("#1002"))
    expect(onRowClick).toHaveBeenCalledWith(data[1])
  })

  it("ignores events from portaled content rendered inside a row", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const portalColumns: ColumnDef<Order, unknown>[] = [
      {
        accessorKey: "number",
        header: "Order",
        cell: ({ row }) => (
          <>
            {row.original.number}
            {createPortal(
              <span>Menu for {row.original.number}</span>,
              document.body
            )}
          </>
        ),
      },
    ]
    render(
      <DataTable columns={portalColumns} data={data} onRowClick={onRowClick} />
    )
    await user.click(screen.getByText("Menu for #1001"))
    expect(onRowClick).not.toHaveBeenCalled()
  })
})

describe("DataTable getRowHref", () => {
  const open = () =>
    vi.spyOn(window, "open").mockImplementation(() => null as Window | null)

  it("goes to the URL on click or Enter when there's no onRowClick", async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowHref={(row) => `#order-${row.id}`}
      />
    )
    await user.click(screen.getByText("#1001"))
    expect(window.location.hash).toBe("#order-1")

    rowOf("#1002").focus()
    await user.keyboard("{Enter}")
    expect(window.location.hash).toBe("#order-2")
  })

  it("prefers onRowClick for plain clicks and Enter", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const windowOpen = open()
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        getRowHref={(row) => `#order-${row.id}`}
      />
    )
    await user.click(screen.getByText("#1001"))
    rowOf("#1002").focus()
    await user.keyboard("{Enter}")
    expect(onRowClick.mock.calls).toEqual([[data[0]], [data[1]]])
    expect(window.location.hash).toBe("")
    expect(windowOpen).not.toHaveBeenCalled()
  })

  it.each([
    [
      "cmd-click",
      (row: HTMLElement) => fireEvent.click(row, { metaKey: true }),
    ],
    [
      "ctrl-click",
      (row: HTMLElement) => fireEvent.click(row, { ctrlKey: true }),
    ],
    [
      "middle-click",
      (row: HTMLElement) =>
        fireEvent(
          row,
          new MouseEvent("auxclick", { bubbles: true, button: 1 })
        ),
    ],
    [
      "cmd+Enter",
      (row: HTMLElement) =>
        fireEvent.keyDown(row, { key: "Enter", metaKey: true }),
    ],
    [
      "ctrl+Enter",
      (row: HTMLElement) =>
        fireEvent.keyDown(row, { key: "Enter", ctrlKey: true }),
    ],
  ])("opens the URL in a new tab on %s", (_name, trigger) => {
    const onRowClick = vi.fn()
    const windowOpen = open()
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        getRowHref={(row) => `#order-${row.id}`}
      />
    )
    trigger(rowOf("#1001"))
    expect(windowOpen).toHaveBeenCalledWith("#order-1", "_blank", "noopener")
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("leaves a middle-click on a link inside the row to the browser", () => {
    const windowOpen = open()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowHref={(row) => `#order-${row.id}`}
      />
    )
    fireEvent(
      screen.getAllByRole("link", { name: "Customer" })[0],
      new MouseEvent("auxclick", { bubbles: true, button: 1 })
    )
    expect(windowOpen).not.toHaveBeenCalled()
  })
})
