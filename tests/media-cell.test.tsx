import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
