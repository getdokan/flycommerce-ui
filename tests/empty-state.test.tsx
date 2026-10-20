import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button, EmptyState } from "@/index"

describe("EmptyState", () => {
  it("shows an icon by name in the tile, the title, the description and the actions", () => {
    const { container } = render(
      <EmptyState
        icon="orders"
        title="No orders yet"
        description="Orders show here as soon as a shopper checks out."
        actions={<Button>Share your store</Button>}
      />
    )
    // Still the Empty slot underneath, so selectors written for Empty keep matching.
    const state = container.querySelector('[data-slot="empty"]')
    expect(state?.getAttribute("data-tone")).toBe("default")
    const tile = state?.querySelector('[data-slot="empty-icon"]')
    expect(tile?.getAttribute("data-variant")).toBe("icon")
    expect(
      tile?.querySelector('[data-slot="icon"]')?.getAttribute("data-icon-name")
    ).toBe("orders")
    expect(screen.getByText("No orders yet")).toBeTruthy()
    expect(
      screen.getByText("Orders show here as soon as a shopper checks out.")
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Share your store" })
    ).toBeTruthy()
  })

  it("leaves out the tile, description and actions it isn't given", () => {
    const { container } = render(<EmptyState title="No orders match" />)
    expect(container.querySelector('[data-slot="empty-icon"]')).toBeNull()
    expect(
      container.querySelector('[data-slot="empty-description"]')
    ).toBeNull()
    expect(container.querySelector('[data-slot="empty-content"]')).toBeNull()
    expect(screen.getByText("No orders match")).toBeTruthy()
  })

  it("tints the tile red in the destructive tone", () => {
    const { container } = render(
      <EmptyState
        tone="destructive"
        icon="warning"
        title="Orders could not be loaded"
      />
    )
    const tile = container.querySelector('[data-slot="empty-icon"]')
    expect(tile?.className).toContain("bg-destructive-subtle")
    expect(
      container.querySelector('[data-slot="empty"]')?.getAttribute("data-tone")
    ).toBe("destructive")
  })

  it("shows an illustration as it is, without the tile", () => {
    const { container } = render(
      <EmptyState
        icon="orders"
        media={<img src="/scene.svg" alt="" />}
        title="No orders yet"
      />
    )
    const media = container.querySelector('[data-slot="empty-icon"]')
    expect(media?.getAttribute("data-variant")).toBe("default")
    expect(media?.querySelector("img")).toBeTruthy()
    expect(media?.querySelector('[data-slot="icon"]')).toBeNull()
  })

  it("shows a description of 0 rather than dropping it", () => {
    const { container } = render(<EmptyState title="Orders" description={0} />)
    expect(
      container.querySelector('[data-slot="empty-description"]')?.textContent
    ).toBe("0")
  })
})
