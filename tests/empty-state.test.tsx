import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button, EmptyState, Icon } from "@/index"

describe("EmptyState", () => {
  it("renders the icon tile, title, description and actions", () => {
    const { container } = render(
      <EmptyState
        icon={<Icon name="products" />}
        title="Upload your first product"
        description="Add products and start selling right away."
        actions={<Button>Add product</Button>}
      />
    )
    const tile = container.querySelector('[data-slot="empty-icon"]')
    expect(tile?.getAttribute("data-variant")).toBe("icon")
    expect(tile?.querySelector("svg")).toBeTruthy()
    expect(screen.getByText("Upload your first product")).toBeTruthy()
    expect(
      screen.getByText("Add products and start selling right away.")
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Add product" })).toBeTruthy()
  })

  it("leaves out the tile, description and actions when not given", () => {
    const { container } = render(
      <EmptyState title="Nothing here" description="" actions={false} />
    )
    expect(container.querySelector('[data-slot="empty-icon"]')).toBeNull()
    expect(
      container.querySelector('[data-slot="empty-description"]')
    ).toBeNull()
    expect(container.querySelector('[data-slot="empty-content"]')).toBeNull()
  })

  it("keeps a count of 0 as the description", () => {
    render(<EmptyState title="Orders" description={0} />)
    expect(screen.getByText("0")).toBeTruthy()
  })

  it("tints the tile red with tone destructive", () => {
    const { container } = render(
      <EmptyState
        tone="destructive"
        icon={<Icon name="error" />}
        title="Orders didn't load"
      />
    )
    const tile = container.querySelector('[data-slot="empty-icon"]')
    expect(tile?.getAttribute("data-tone")).toBe("destructive")
    expect(tile?.className).toContain("bg-destructive-subtle")
  })

  it("shows media as it is, without the tile, instead of the icon", () => {
    const { container } = render(
      <EmptyState
        media={<img alt="" src="/empty.svg" />}
        icon={<Icon name="products" />}
        title="No products"
      />
    )
    const media = container.querySelector('[data-slot="empty-icon"]')
    expect(media?.getAttribute("data-variant")).toBe("default")
    expect(media?.querySelector("img")).toBeTruthy()
    expect(media?.querySelector("svg")).toBeNull()
  })
})
