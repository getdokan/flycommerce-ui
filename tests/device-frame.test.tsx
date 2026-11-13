import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { compile } from "tailwindcss"
import { afterEach, describe, expect, it, vi } from "vitest"

import componentsCss from "@/styles/components.css?raw"
import themeCss from "@/styles/theme.css?raw"
import { DeviceFrame } from "@/index"

const part = (container: HTMLElement, slot: string) =>
  container.querySelector(`[data-slot="device-frame-${slot}"]`)!

async function css(classes: string[]) {
  const { build } = await compile(`${componentsCss}\n@tailwind utilities;`)
  return build(classes)
}

describe("DeviceFrame", () => {
  it("is a figure named by its label", () => {
    render(
      <DeviceFrame label="Phone preview">
        <p>Thanks for your order</p>
      </DeviceFrame>
    )
    const figure = screen.getByRole("figure", { name: "Phone preview" })
    expect(figure.getAttribute("data-device")).toBe("phone")
    expect(figure.contains(screen.getByText("Thanks for your order"))).toBe(
      true
    )
  })

  it("is a plain box without a label", () => {
    const { container } = render(<DeviceFrame>Preview</DeviceFrame>)
    expect(screen.queryByRole("figure")).toBeNull()
    expect(container.firstElementChild!.tagName).toBe("DIV")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("puts the content in a screen that scrolls, with no tab stop while it fits", () => {
    const { container } = render(
      <DeviceFrame>
        <p>Short email</p>
      </DeviceFrame>
    )
    const content = part(container, "content")
    expect(part(container, "screen").contains(content)).toBe(true)
    expect(content.contains(screen.getByText("Short email"))).toBe(true)
    expect(content.hasAttribute("tabindex")).toBe(false)
    expect(content.className).toContain("overflow-y-auto")
    expect(content.className).toContain("no-scrollbar")
  })

  it("takes keyboard focus once its content overflows, so it can be scrolled", () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(900)
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600)
    const { container } = render(
      <DeviceFrame>
        <p>Long email</p>
      </DeviceFrame>
    )
    expect(part(container, "content").getAttribute("tabindex")).toBe("0")
  })

  it("re-checks for overflow when the content resizes", () => {
    let resize = () => {}
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      }
    )
    const scrollHeight = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockReturnValue(500)
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600)
    const { container } = render(
      <DeviceFrame label="Phone preview">
        <p>Email</p>
      </DeviceFrame>
    )
    const content = part(container, "content")
    expect(content.hasAttribute("tabindex")).toBe(false)

    scrollHeight.mockReturnValue(900)
    act(() => resize())
    expect(content.getAttribute("tabindex")).toBe("0")
    expect(screen.getByRole("group", { name: "Phone preview" })).toBe(content)

    scrollHeight.mockReturnValue(500)
    act(() => resize())
    expect(content.hasAttribute("tabindex")).toBe(false)
  })

  it("keeps its tab stop while focused, even once the content fits", () => {
    let resize = () => {}
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe() {}
        disconnect() {}
      }
    )
    const scrollHeight = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockReturnValue(900)
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600)
    const { container } = render(
      <div>
        <DeviceFrame aria-labelledby="heading">
          <p>Email</p>
        </DeviceFrame>
        <h2 id="heading">Phone preview</h2>
      </div>
    )
    const content = part(container, "content") as HTMLElement
    expect(screen.getByRole("group", { name: "Phone preview" })).toBe(content)

    act(() => content.focus())
    scrollHeight.mockReturnValue(500)
    act(() => resize())
    expect(document.activeElement).toBe(content)
    expect(content.getAttribute("tabindex")).toBe("0")

    act(() => content.blur())
    expect(content.hasAttribute("tabindex")).toBe(false)
  })

  it("is a plain box when the label is empty", () => {
    const { container } = render(<DeviceFrame label="">Preview</DeviceFrame>)
    expect(container.firstElementChild!.tagName).toBe("DIV")
    expect(container.firstElementChild!.hasAttribute("aria-label")).toBe(false)
  })

  it("keeps fixed-position content inside the screen", () => {
    const { container } = render(<DeviceFrame>Preview</DeviceFrame>)
    expect(part(container, "screen").className).toContain("contain-layout")
  })

  it("is a figure when named with aria-label", () => {
    render(<DeviceFrame aria-label="Phone preview">Preview</DeviceFrame>)
    expect(screen.getByRole("figure", { name: "Phone preview" })).toBeTruthy()
  })

  it("hides the home bar from screen readers", () => {
    const { container } = render(<DeviceFrame>Preview</DeviceFrame>)
    const bar = part(container, "home-bar")
    expect(bar.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("follows the theme on a card screen and stays white on a white one", () => {
    const { container, rerender } = render(<DeviceFrame>Preview</DeviceFrame>)
    expect(container.firstElementChild!.getAttribute("data-screen")).toBe(
      "card"
    )
    expect(part(container, "screen").className).toContain("bg-card")

    rerender(<DeviceFrame screen="white">Preview</DeviceFrame>)
    expect(container.firstElementChild!.getAttribute("data-screen")).toBe(
      "white"
    )
    expect(part(container, "screen").className).toContain("bg-white")
    expect(part(container, "screen").className).toContain("scheme-light")
    expect(part(container, "home-bar").className).toContain(
      "bg-device-home-bar"
    )
  })

  it("passes className, style, attributes and ref to the root", () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <DeviceFrame
        ref={ref}
        id="phone"
        className="mt-4"
        screenClassName="bg-muted"
        style={{ "--device-frame-width": "16rem" } as React.CSSProperties}
      >
        Preview
      </DeviceFrame>
    )
    const root = container.firstElementChild as HTMLElement
    expect(ref.current).toBe(root)
    expect(root.id).toBe("phone")
    expect(root.className).toContain("device-frame")
    expect(root.className).toContain("mt-4")
    expect(root.style.getPropertyValue("--device-frame-width")).toBe("16rem")
    expect(part(container, "screen").className).toContain("bg-muted")
  })

  it("sizes the frame from --device-frame-width and scales the bezel with it", async () => {
    const built = await css(["device-frame"])
    expect(built).toContain("max-width: var(--device-frame-width, 20rem)")
    expect(built).toContain("container-type: inline-size")
    expect(built).toMatch(/--device-frame-bezel: [\d.]+cqi/)
    expect(built).toMatch(/--device-frame-radius: [\d.]+cqi/)
  })

  it("defines the bezel, home bar and shadow tokens for light and dark", () => {
    const start = themeCss.indexOf("{", themeCss.indexOf(".dark {"))
    const dark = themeCss.slice(start, themeCss.indexOf("}", start))
    for (const token of [
      "--device-bezel",
      "--device-home-bar",
      "--elevation-device",
    ]) {
      expect(themeCss.indexOf(token)).toBeLessThan(themeCss.indexOf(".dark"))
    }
    expect(dark).toContain("--device-bezel:")
    expect(dark).toContain("--elevation-device:")
  })
})
