import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DataTablePagination } from "@/index"

const pageNames = () =>
  screen
    .getAllByRole("button", { name: /^Page \d+$/ })
    .map((button) => button.textContent)

describe("DataTablePagination page numbers", () => {
  it("shows only Previous and Next by default", () => {
    render(
      <DataTablePagination
        page={2}
        pageSize={10}
        total={120}
        onPageChange={() => {}}
      />
    )
    expect(screen.queryByRole("button", { name: "Page 2" })).toBeNull()
    expect(screen.getByRole("button", { name: /Previous/ })).toBeTruthy()
    expect(screen.getByRole("button", { name: /Next/ })).toBeTruthy()
  })

  it.each([
    [1, 1, ["1", "2", "3", "4", "5", "12"], 1],
    [4, 1, ["1", "2", "3", "4", "5", "12"], 1],
    [6, 1, ["1", "5", "6", "7", "12"], 2],
    [12, 1, ["1", "8", "9", "10", "11", "12"], 1],
    [6, 0, ["1", "6", "12"], 2],
    [6, 2, ["1", "4", "5", "6", "7", "8", "12"], 2],
  ])(
    "page %i with siblingCount %i shows the first, last and nearby pages",
    (page, siblingCount, expected, ellipses) => {
      render(
        <DataTablePagination
          page={page}
          pageSize={10}
          total={120}
          onPageChange={() => {}}
          showPageNumbers
          siblingCount={siblingCount}
        />
      )
      expect(pageNames()).toEqual(expected)
      expect(
        screen.getByRole("button", { name: `Page ${page}` }).ariaCurrent
      ).toBe("page")
      expect(screen.getAllByText("More pages")).toHaveLength(ellipses)
    }
  )

  it("lists every page when they fit", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={10}
        total={42}
        onPageChange={() => {}}
        showPageNumbers
      />
    )
    expect(pageNames()).toEqual(["1", "2", "3", "4", "5"])
    expect(screen.queryByText("More pages")).toBeNull()
  })

  it("calls onPageChange with the clicked page", async () => {
    const onPageChange = vi.fn()
    render(
      <DataTablePagination
        page={1}
        pageSize={10}
        total={120}
        onPageChange={onPageChange}
        showPageNumbers
        labels={{ page: (page) => `Página ${page}` }}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Página 3" }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    await userEvent.click(screen.getByRole("button", { name: "Página 1" }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
  })
})

describe("DataTablePagination getPageHref", () => {
  const renderLinks = (onPageChange = vi.fn()) => {
    render(
      <DataTablePagination
        page={1}
        pageSize={10}
        total={120}
        onPageChange={onPageChange}
        showPageNumbers
        getPageHref={(page) => `#page-${page}`}
      />
    )
    return onPageChange
  }

  it("renders page controls as links", () => {
    renderLinks()
    expect(
      screen.getByRole("link", { name: "Page 3" }).getAttribute("href")
    ).toBe("#page-3")
    expect(
      screen.getByRole("link", { name: /Next/ }).getAttribute("href")
    ).toBe("#page-2")
    const current = screen.getByRole("link", { name: "Page 1" })
    expect(current.getAttribute("aria-current")).toBe("page")
    const previous = screen.getByRole("button", { name: /Previous/ })
    expect((previous as HTMLButtonElement).disabled).toBe(true)
  })

  it("handles a plain click in the app", () => {
    const onPageChange = renderLinks()
    const link = screen.getByRole("link", { name: "Page 3" })
    const notPrevented = fireEvent.click(link)
    expect(notPrevented).toBe(false)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it.each([
    ["ctrl", { ctrlKey: true }],
    ["cmd", { metaKey: true }],
    ["shift", { shiftKey: true }],
    ["middle", { button: 1 }],
  ])("leaves a %s click to the browser", (_name, init) => {
    const onPageChange = renderLinks()
    const link = screen.getByRole("link", { name: /Next/ })
    const notPrevented = fireEvent.click(link, init)
    expect(notPrevented).toBe(true)
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
