import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PreviewFrame } from "@/index"
import { applyTailwind } from "./tailwind"

const bar = (container: HTMLElement) =>
  container.querySelector('[data-slot="preview-frame-bar"]')

describe("PreviewFrame", () => {
  it("shows the address in the browser bar, truncating when narrow", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli on maisonoriel.com"
        address="maisonoriel.com"
      />
    )
    const address = screen.getByText("maisonoriel.com")
    expect(bar(container)!.contains(address)).toBe(true)
    expect(address.className).toContain("truncate")
    expect(address.getAttribute("translate")).toBe("no")
  })

  it("reads the address in its own direction but lines it up with the page's", () => {
    const { container } = render(
      <div dir="rtl">
        <PreviewFrame
          src="https://example.com/theme.png"
          alt="Ravelli"
          address="maisonoriel.com"
        />
      </div>
    )
    const field = container.querySelector(
      '[data-slot="preview-frame-address"]'
    )!
    const text = screen.getByText("maisonoriel.com")
    expect(text.getAttribute("dir")).toBe("auto")
    expect(field.hasAttribute("dir")).toBe(false)
    expect(field.contains(text)).toBe(true)
    expect(field.className).not.toMatch(/\brtl:/)
  })

  it("outlines the address field with a border, which forced colours keep", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli"
        address="maisonoriel.com"
      />
    )
    const field = container.querySelector(
      '[data-slot="preview-frame-address"]'
    )!
    expect(field.className).toMatch(/\bborder-border\b/)
    expect(field.className).not.toMatch(/\bring-/)
  })

  it("hides the window dots from screen readers", () => {
    const { container } = render(
      <PreviewFrame src="https://example.com/theme.png" alt="Ravelli" />
    )
    const dots = bar(container)!.firstElementChild!
    expect(dots.getAttribute("aria-hidden")).toBe("true")
    expect(dots.children).toHaveLength(3)
  })

  it("draws the bar with an empty, hidden address field when there is no address", () => {
    const { container } = render(
      <PreviewFrame src="https://example.com/theme.png" alt="Ravelli" />
    )
    const address = container.querySelector(
      '[data-slot="preview-frame-address"]'
    )!
    expect(bar(container)).not.toBeNull()
    expect(address.textContent).toBe("")
    expect(address.getAttribute("aria-hidden")).toBe("true")
  })

  it("shows just the picture without the bar when chrome is none", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="ChicNest"
        address="chicnest.com"
        chrome="none"
      />
    )
    expect(bar(container)).toBeNull()
    expect(screen.queryByText("chicnest.com")).toBeNull()
    expect(screen.getByRole("img", { name: "ChicNest" })).toBeTruthy()
  })

  it("keeps the alt text on the picture", () => {
    render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli on maisonoriel.com"
        address="maisonoriel.com"
      />
    )
    const image = screen.getByRole("img", {
      name: "Ravelli on maisonoriel.com",
    })
    expect(image.getAttribute("src")).toBe("https://example.com/theme.png")
  })

  it("shows the fallback when the picture fails to load, keeping the alt for screen readers", () => {
    render(
      <PreviewFrame
        src="https://example.com/broken.png"
        alt="Ravelli"
        fallback={<span>No preview yet</span>}
      />
    )
    fireEvent.error(screen.getByRole("img", { name: "Ravelli" }))
    expect(screen.getByText("No preview yet")).toBeTruthy()
    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.getByText("Ravelli").className).toContain("sr-only")
  })

  it("edges the picture on the card colour, so it stands out on any ground while loading or failed", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/broken.png"
        alt="Ravelli"
        chrome="none"
        data-testid="frame"
      />
    )
    const root = screen.getByTestId("frame")
    expect(root.className).toMatch(/\bborder-border\b/)
    const box = container.querySelector('[data-slot="image"]')!
    const onCard = (className: string) => {
      expect(className).toMatch(/(^|\s)bg-card(\s|$)/)
      expect(className).not.toMatch(/bg-muted/)
    }
    onCard(box.className)
    fireEvent.error(screen.getByRole("img", { name: "Ravelli" }))
    expect(box.hasAttribute("data-failed")).toBe(true)
    onCard(box.className)
    expect(box.className).toMatch(/\bdata-failed:aspect-video\b/)
  })

  it("fills the box and shows the top of a taller picture, and does not drag", async () => {
    render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli"
        aspectRatio="16 / 10"
      />
    )
    await applyTailwind()
    const image = screen.getByRole("img", { name: "Ravelli" })
    const style = getComputedStyle(image)
    expect(style.width).toBe("100%")
    expect(style.height).toBe("100%")
    expect(style.objectFit).toBe("cover")
    expect(style.objectPosition).toMatch(/^(top|center top|50% 0%)$/)
    expect(image.getAttribute("draggable")).toBe("false")
  })

  it("shows the fallback when there is no picture", () => {
    render(
      <PreviewFrame alt="Ravelli" fallback={<span>No preview yet</span>} />
    )
    expect(screen.getByText("No preview yet")).toBeTruthy()
  })

  it("passes the aspect ratio to the picture's box", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli"
        aspectRatio="16 / 10"
      />
    )
    const box = container.querySelector<HTMLElement>('[data-slot="image"]')!
    expect(box.style.aspectRatio).toBe("16 / 10")
  })

  it("puts className and other props on the root", () => {
    const { container } = render(
      <PreviewFrame
        src="https://example.com/theme.png"
        alt="Ravelli"
        className="max-w-2xl"
        id="live-theme"
        data-testid="frame"
        title="Live theme"
      />
    )
    const root = screen.getByTestId("frame")
    expect(root).toBe(container.firstElementChild)
    expect(root.getAttribute("data-slot")).toBe("preview-frame")
    expect(root.className).toContain("max-w-2xl")
    expect(root.id).toBe("live-theme")
    expect(root.getAttribute("title")).toBe("Live theme")
  })
})
