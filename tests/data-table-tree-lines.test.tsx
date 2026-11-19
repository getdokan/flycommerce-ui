import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataTable, type ColumnDef } from "@/index"

type Category = { id: string; name: string; children?: Category[] }

const columns: ColumnDef<Category, unknown>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
]
const data: Category[] = [
  {
    id: "fashion",
    name: "Fashion",
    children: [
      {
        id: "dresses",
        name: "Dresses",
        children: [{ id: "maxi", name: "Maxi" }],
      },
      { id: "shoes", name: "Shoes" },
    ],
  },
  { id: "beauty", name: "Beauty" },
]

const cellOf = (name: string) =>
  screen.getByText(name).closest("td") as HTMLElement
const rails = (name: string) =>
  Array.from(
    cellOf(name).querySelectorAll('[data-slot="data-table-tree-rail"]')
  )

const draw = (treeLines: boolean) =>
  render(
    <DataTable
      variant="list"
      columns={columns}
      data={data}
      getSubRows={(row) => row.children}
      defaultExpanded
      treeLines={treeLines}
    />
  )

describe("DataTable treeLines", () => {
  it("puts the expand button after the content, and no spacer before a top-level row", () => {
    draw(true)

    const fashion = cellOf("Fashion")
    const wrapper = screen.getByText("Fashion").parentElement as HTMLElement
    expect(wrapper.lastElementChild?.tagName).toBe("BUTTON")
    expect(wrapper.firstElementChild?.textContent).toBe("Fashion")
    expect(rails("Fashion")).toHaveLength(0)
    expect(fashion.classList.contains("relative")).toBe(true)

    // A top-level row without children has nothing before its content either.
    const beauty = screen.getByText("Beauty").parentElement as HTMLElement
    expect(beauty.firstElementChild?.textContent).toBe("Beauty")
  })

  it("draws one rail column per level, with an elbow for the row itself", () => {
    draw(true)

    expect(rails("Dresses")).toHaveLength(1)
    expect(rails("Maxi")).toHaveLength(2)
  })

  it("stops a last child's line at its middle and keeps rails for ancestors with siblings below", () => {
    draw(true)

    // Shoes is Fashion's last child: its elbow runs from the top to the middle.
    const shoesElbow = rails("Shoes")[0].querySelectorAll("span")
    expect(shoesElbow[0].classList.contains("h-1/2")).toBe(true)

    // Dresses has Shoes below it, so Maxi's first column carries a straight rail…
    const [ancestor, own] = rails("Maxi")
    expect(ancestor.querySelectorAll("span")).toHaveLength(1)
    // …and Maxi is Dresses' only child, so its own elbow stops at the middle.
    expect(own.querySelectorAll("span")[0].classList.contains("h-1/2")).toBe(
      true
    )
  })

  it("keeps the leading toggle and indentation without it", () => {
    draw(false)

    const wrapper = screen.getByText("Fashion").parentElement as HTMLElement
    expect(wrapper.firstElementChild?.tagName).toBe("BUTTON")
    expect(rails("Dresses")).toHaveLength(0)
    expect(
      (screen.getByText("Dresses").parentElement as HTMLElement).style
        .paddingInlineStart
    ).toBe("24px")
  })

  it("follows the drawn order when the tree is sorted, so the last child drawn gets the short elbow", async () => {
    const user = (await import("@testing-library/user-event")).default.setup()
    render(
      <DataTable
        variant="list"
        sortable
        columns={[{ accessorKey: "name", header: "Category" }]}
        data={[
          {
            id: "p",
            name: "Parent",
            children: [
              { id: "a", name: "Alpha" },
              { id: "z", name: "Zulu" },
            ],
          },
        ]}
        getSubRows={(row: Category) => row.children}
        defaultExpanded
        treeLines
      />
    )
    const elbowTop = (name: string) =>
      (
        cellOf(name).querySelector(
          '[data-slot="data-table-tree-rail"] span'
        ) as HTMLElement
      ).classList.contains("h-1/2")

    expect(elbowTop("Zulu")).toBe(true)
    expect(elbowTop("Alpha")).toBe(false)

    // Descending: Zulu is drawn first and Alpha last.
    await user.click(screen.getByRole("button", { name: /Category/ }))
    await user.click(screen.getByRole("button", { name: /Category/ }))
    const order = Array.from(document.querySelectorAll("tbody tr")).map(
      (row) => row.textContent
    )
    expect(order.indexOf("Zulu")).toBeLessThan(order.indexOf("Alpha"))
    expect(elbowTop("Alpha")).toBe(true)
    expect(elbowTop("Zulu")).toBe(false)
  })
})
