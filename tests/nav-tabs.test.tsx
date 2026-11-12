import * as React from "react"
import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NavTabs, NavTabsLink } from "@/index"

const TABS = ["General", "Shipping", "Tax", "SEO"]

const rect = (left: number, right: number) =>
  ({ left, right, top: 0, bottom: 0, width: right - left }) as DOMRect

// The row is 300px wide; each tab's place in it is set per test.
let places: Record<string, DOMRect> = {}

function Tabs({
  active,
  linkRef,
  padding,
}: {
  active: string
  linkRef?: React.Ref<HTMLAnchorElement>
  padding?: number
}) {
  return (
    <NavTabs
      aria-label="Settings"
      style={{ paddingLeft: padding, paddingRight: padding }}
    >
      {TABS.map((tab) => (
        <NavTabsLink
          key={tab}
          href={`#${tab}`}
          active={tab === active}
          ref={tab === "SEO" ? linkRef : undefined}
        >
          {tab}
        </NavTabsLink>
      ))}
    </NavTabs>
  )
}

const row = () => screen.getByRole("navigation", { name: "Settings" })

describe("NavTabsLink keeps the active link in view", () => {
  let scrollBy: ReturnType<typeof vi.fn>
  let scrollIntoView: ReturnType<typeof vi.fn>

  beforeEach(() => {
    places = {}
    scrollBy = vi.fn()
    scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollBy =
      scrollBy as unknown as HTMLElement["scrollBy"]
    HTMLElement.prototype.scrollIntoView =
      scrollIntoView as unknown as HTMLElement["scrollIntoView"]
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.dataset.slot === "nav-tabs") return rect(0, 300)
        return places[this.textContent ?? ""] ?? rect(0, 50)
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollBy
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView
  })

  it("scrolls only the row, smoothly, when a link past the end becomes active", () => {
    const { rerender } = render(<Tabs active="General" />)
    places.SEO = rect(280, 380)

    rerender(<Tabs active="SEO" />)

    expect(scrollBy).toHaveBeenCalledOnce()
    expect(scrollBy.mock.contexts[0]).toBe(row())
    expect(scrollBy).toHaveBeenCalledWith({ left: 80, behavior: "smooth" })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it("scrolls back for a link before the start", () => {
    places.SEO = rect(280, 380)
    const { rerender } = render(<Tabs active="SEO" />)
    scrollBy.mockClear()
    places.General = rect(-50, 40)

    rerender(<Tabs active="General" />)

    expect(scrollBy).toHaveBeenCalledWith({ left: -50, behavior: "smooth" })
  })

  it("leaves the row alone when the link is already visible", () => {
    const { rerender } = render(<Tabs active="General" />)
    places.Tax = rect(100, 160)

    rerender(<Tabs active="Tax" />)

    expect(scrollBy).not.toHaveBeenCalled()
  })

  it("jumps without animation to a link that starts active out of view", () => {
    places.SEO = rect(280, 380)

    render(<Tabs active="SEO" />)

    expect(scrollBy).toHaveBeenCalledWith({ left: 80, behavior: "auto" })
  })

  it("doesn't animate when reduced motion is asked for", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
    }))
    const { rerender } = render(<Tabs active="General" />)
    places.SEO = rect(280, 380)

    rerender(<Tabs active="SEO" />)

    expect(scrollBy).toHaveBeenCalledWith({ left: 80, behavior: "auto" })
  })

  it("still hands the link to a ref, with or without asChild", () => {
    const objectRef = React.createRef<HTMLAnchorElement>()
    const callbackRef = vi.fn()
    render(
      <>
        <Tabs active="General" linkRef={objectRef} />
        <NavTabs aria-label="Routes">
          <NavTabsLink asChild ref={callbackRef}>
            <a href="#orders">Orders</a>
          </NavTabsLink>
        </NavTabs>
      </>
    )

    expect(objectRef.current).toBe(screen.getByRole("link", { name: "SEO" }))
    expect(callbackRef).toHaveBeenCalledWith(
      screen.getByRole("link", { name: "Orders" })
    )
  })

  it("keeps the row's padding beside the link it scrolls to", () => {
    const { rerender } = render(<Tabs active="General" padding={4} />)
    places.SEO = rect(280, 380)

    rerender(<Tabs active="SEO" padding={4} />)

    expect(scrollBy).toHaveBeenCalledWith({ left: 84, behavior: "smooth" })
  })

  it("clears refs on unmount, and runs a ref's own cleanup instead of calling it with null", () => {
    const objectRef = React.createRef<HTMLAnchorElement>()
    const cleanup = vi.fn()
    const callbackRef = vi.fn(() => cleanup)
    const { unmount } = render(
      <>
        <Tabs active="General" linkRef={objectRef} />
        <NavTabs aria-label="Routes">
          <NavTabsLink href="#orders" ref={callbackRef}>
            Orders
          </NavTabsLink>
        </NavTabs>
      </>
    )

    unmount()

    expect(objectRef.current).toBeNull()
    expect(cleanup).toHaveBeenCalledOnce()
    expect(callbackRef).toHaveBeenCalledOnce()
  })
})
