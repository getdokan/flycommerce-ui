import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MediaCell, MediaFileGlyph } from "@/index"

import { applyTailwind } from "./tailwind"

describe("MediaCell", () => {
  it("draws the image from src, as before", () => {
    const { container } = render(
      <MediaCell src="https://example.com/a.jpg" title="sneaker-red.jpg" />
    )
    expect(container.querySelector("img")!.getAttribute("src")).toBe(
      "https://example.com/a.jpg"
    )
    expect(container.querySelector("[data-slot=media-cell-media]")).toBeNull()
  })

  it("draws media in the same box instead of the image", () => {
    const { container } = render(
      <MediaCell
        src="https://example.com/a.jpg"
        size={40}
        media={<MediaFileGlyph name="size-guide.pdf" className="size-6" />}
        title="size-guide.pdf"
        description="PDF document"
      />
    )
    expect(container.querySelector("img")).toBeNull()
    const box = container.querySelector("[data-slot=media-cell-media]")!
    expect(box.textContent).toBe("PDF")
    const frame = box.parentElement as HTMLElement
    expect(frame.style.width).toBe("40px")
    expect(frame.style.height).toBe("40px")
    expect(screen.getByText("size-guide.pdf")).toBeTruthy()
    expect(screen.getByText("PDF document")).toBeTruthy()
  })

  it("lets media place an overlay on a poster", async () => {
    const { container } = render(
      <MediaCell
        media={
          <>
            <img src="https://example.com/poster.jpg" alt="" />
            <span data-testid="play" className="absolute inset-0" />
          </>
        }
        title="unboxing.mp4"
      />
    )
    const box = container.querySelector("[data-slot=media-cell-media]")!
    await applyTailwind()
    expect(getComputedStyle(box).position).toBe("relative")
    expect(getComputedStyle(box).overflow).toBe("hidden")
    expect(box.contains(screen.getByTestId("play"))).toBe(true)
  })
})

describe("MediaCell media clipping", () => {
  it("doesn't clip a file-type glyph, so its extension badge isn't cut", async () => {
    const { container } = render(
      <MediaCell
        media={<MediaFileGlyph name="brief.docx" className="size-6" />}
        alt="Brief"
        title="brief.docx"
      />
    )
    const box = container.querySelector("[data-slot=media-cell-media]")!
    await applyTailwind()
    expect(getComputedStyle(box).overflow).toBe("visible")
  })

  it("still clips a poster, or a glyph nested inside other media", async () => {
    const { container } = render(
      <>
        <MediaCell
          media={<img src="https://example.com/poster.jpg" alt="" />}
          title="unboxing.mp4"
        />
        <MediaCell
          media={
            <span>
              <MediaFileGlyph name="brief.docx" className="size-6" />
            </span>
          }
          title="brief.docx"
        />
      </>
    )
    const boxes = container.querySelectorAll("[data-slot=media-cell-media]")
    await applyTailwind()
    expect([...boxes].map((box) => getComputedStyle(box).overflow)).toEqual([
      "hidden",
      "hidden",
    ])
  })
})

describe("MediaCell media with alt", () => {
  it("keeps alt as screen-reader text, as the image fallback does", async () => {
    render(
      <MediaCell
        media={<MediaFileGlyph name="size-guide.pdf" className="size-6" />}
        alt="Size guide PDF"
        title="size-guide.pdf"
      />
    )
    await applyTailwind()
    expect(getComputedStyle(screen.getByText("Size guide PDF")).position).toBe(
      "absolute"
    )
  })
})

describe("MediaCell title link", () => {
  it("makes the title a link with href, and hands a plain click to onNavigate", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <MediaCell
        title="Silk twill scarf, ivory"
        href="#products/101/edit"
        onNavigate={onNavigate}
        description="MO-AC-SCRF-IVR"
      />
    )
    const link = screen.getByRole("link", { name: "Silk twill scarf, ivory" })
    expect(link.getAttribute("href")).toBe("#products/101/edit")
    expect(link.getAttribute("title")).toBe("Silk twill scarf, ivory")
    expect(link.className).toContain("truncate")

    await user.click(link)
    expect(onNavigate).toHaveBeenCalledTimes(1)

    // A modified click is left to the browser: no preventDefault, no onNavigate.
    for (const modifier of ["ctrlKey", "metaKey", "shiftKey", "altKey"]) {
      expect(fireEvent.click(link, { [modifier]: true })).toBe(true)
    }
    expect(onNavigate).toHaveBeenCalledTimes(1)

    link.focus()
    await user.keyboard("{Enter}")
    expect(onNavigate).toHaveBeenCalledTimes(2)
  })

  it("keeps a blank title plain, so there is no empty link", () => {
    const { container } = render(
      <MediaCell title="" href="/admin/products/9/edit" />
    )
    expect(container.querySelector("a")).toBeNull()
  })

  it("shows a plain-text title in full on hover, and takes any node as the title", () => {
    const { rerender } = render(<MediaCell title="Glass bud vase" />)
    expect(screen.getByText("Glass bud vase").getAttribute("title")).toBe(
      "Glass bud vase"
    )

    rerender(<MediaCell title={<em>Glass bud vase</em>} />)
    const emphasised = screen.getByText("Glass bud vase")
    expect(emphasised.tagName).toBe("EM")
    expect(emphasised.parentElement!.getAttribute("title")).toBeNull()
  })

  it("shows a numeric title in full on hover", () => {
    render(<MediaCell title={1048576} />)
    expect(screen.getByText("1048576").getAttribute("title")).toBe("1048576")
  })

  it("leaves a click to the browser when there is no onNavigate", () => {
    render(<MediaCell title="Glass bud vase" href="#product-101" />)
    const link = screen.getByRole("link", { name: "Glass bud vase" })
    // fireEvent returns false only when a handler called preventDefault.
    expect(fireEvent.click(link)).toBe(true)
  })
})
