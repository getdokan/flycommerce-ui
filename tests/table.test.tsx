import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/index"

const row = (text: string) => screen.getByText(text).closest("tr")!

describe("Table", () => {
  it("is the default variant and size unless set", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>California</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole("table").getAttribute("data-variant")).toBe(
      "default"
    )
    expect(screen.getByRole("table").getAttribute("data-size")).toBe("default")
  })

  it("takes a variant and a size", () => {
    render(
      <Table variant="list" size="sm">
        <TableBody>
          <TableRow>
            <TableCell>California</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole("table").getAttribute("data-variant")).toBe("list")
    expect(screen.getByRole("table").getAttribute("data-size")).toBe("sm")
  })

  it("marks list rows with an onClick as clickable, and only those", () => {
    render(
      <Table variant="list">
        <TableBody>
          <TableRow onClick={() => {}}>
            <TableCell>Opens a sheet</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Read only</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(row("Opens a sheet").hasAttribute("data-clickable")).toBe(true)
    expect(row("Read only").hasAttribute("data-clickable")).toBe(false)
  })

  it("leaves rows of a default table unmarked", () => {
    render(
      <Table>
        <TableBody>
          <TableRow onClick={() => {}}>
            <TableCell>Order #1042</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(row("Order #1042").hasAttribute("data-clickable")).toBe(false)
  })

  it.each(["sm", "default", "lg"] as const)(
    "pads a list header 12px top and bottom, 41px with its border, at size %s",
    (size) => {
      render(
        <Table variant="list" size={size}>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )
      const head = screen.getByRole("columnheader", { name: "Product" })
      expect(head.classList.contains("py-3")).toBe(true)
      expect(head.classList.contains("py-2.5")).toBe(false)
    }
  )
})
