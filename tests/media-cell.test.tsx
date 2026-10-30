import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MediaCell, MediaFileGlyph } from "@/index"

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
    expect(box.className).toContain("rounded-md")
    expect(box.className).toContain("border-border-subtle")
    const frame = box.parentElement as HTMLElement
    expect(frame.style.width).toBe("40px")
    expect(frame.style.height).toBe("40px")
    expect(screen.getByText("size-guide.pdf")).toBeTruthy()
    expect(screen.getByText("PDF document")).toBeTruthy()
  })

  it("lets media place an overlay on a poster", () => {
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
    expect(box.className).toContain("relative")
    expect(box.className).toContain("overflow-hidden")
    expect(box.contains(screen.getByTestId("play"))).toBe(true)
  })
})

// jsdom has no Tailwind, so read the overflow a box would get from its own classes.
function overflowOf(box: Element) {
  const classes = box.className.split(/\s+/)
  const unclip = classes
    .map((name) => name.match(/^has-\[(.+)\]:overflow-visible$/)?.[1])
    .find(Boolean)
  if (classes.includes("overflow-visible")) return "visible"
  if (unclip && box.matches(`:has(${unclip})`)) return "visible"
  return classes.includes("overflow-hidden") ? "hidden" : "visible"
}

describe("MediaCell media clipping", () => {
  it("doesn't clip a file-type glyph, so its extension badge isn't cut", () => {
    const { container } = render(
      <MediaCell
        media={<MediaFileGlyph name="brief.docx" className="size-6" />}
        alt="Brief"
        title="brief.docx"
      />
    )
    const box = container.querySelector("[data-slot=media-cell-media]")!
    expect(overflowOf(box)).toBe("visible")
  })

  it("still clips a poster, or a glyph nested inside other media", () => {
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
    expect([...boxes].map(overflowOf)).toEqual(["hidden", "hidden"])
  })
})

describe("MediaCell media with alt", () => {
  it("keeps alt as screen-reader text, as the image fallback does", () => {
    render(
      <MediaCell
        media={<MediaFileGlyph name="size-guide.pdf" className="size-6" />}
        alt="Size guide PDF"
        title="size-guide.pdf"
      />
    )
    expect(screen.getByText("Size guide PDF").className).toContain("sr-only")
  })
})
