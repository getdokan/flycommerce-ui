import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  DataTablePagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/index"

const noop = () => {}

describe("DataTablePagination", () => {
  it("names the landmark Pagination by default", () => {
    render(
      <DataTablePagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={noop}
      />
    )
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy()
  })

  it("uses labels.pagination for offset and cursor pagination", () => {
    const { unmount } = render(
      <DataTablePagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={noop}
        labels={{ pagination: "Paginación" }}
      />
    )
    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeTruthy()
    unmount()

    render(
      <DataTablePagination
        mode="cursor"
        hasPrevious
        hasNext
        onPrevious={noop}
        onNext={noop}
        labels={{ pagination: "Paginación" }}
      />
    )
    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeTruthy()
  })
})

describe("Pagination", () => {
  it("lets every label be translated", () => {
    render(
      <Pagination aria-label="Paginación">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#1"
              text="Anterior"
              aria-label="Ir a la página anterior"
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis label="Más páginas" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#2"
              text="Siguiente"
              aria-label="Ir a la página siguiente"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Ir a la página anterior" })
    ).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Ir a la página siguiente" })
    ).toBeTruthy()
    expect(screen.getByText("Anterior")).toBeTruthy()
    expect(screen.getByText("Siguiente")).toBeTruthy()
    expect(screen.getByText("Más páginas").closest("[aria-hidden]")).toBeNull()
  })

  it("keeps the English defaults", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#2" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Go to previous page" })
    ).toBeTruthy()
    expect(screen.getByRole("link", { name: "Go to next page" })).toBeTruthy()
    expect(screen.getByText("More pages")).toBeTruthy()
  })
})
