import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MediaFileGlyph, MediaThumb, MediaTile } from "@/index"

import { applyTailwind } from "./tailwind"

describe("MediaThumb", () => {
  it("clips what it holds to its corners", async () => {
    render(
      <MediaThumb data-testid="thumb">
        <img src="https://example.com/poster.jpg" alt="" />
      </MediaThumb>
    )
    await applyTailwind()
    expect(getComputedStyle(screen.getByTestId("thumb")).overflow).toBe(
      "hidden"
    )
  })

  it("doesn't clip a glyph passed directly, so its extension badge isn't cut", async () => {
    render(
      <MediaThumb data-testid="thumb">
        <MediaFileGlyph name="brief.docx" className="size-6" />
      </MediaThumb>
    )
    await applyTailwind()
    expect(getComputedStyle(screen.getByTestId("thumb")).overflow).toBe(
      "visible"
    )
  })

  it("still clips a glyph nested inside other media", async () => {
    render(
      <MediaThumb data-testid="thumb">
        <span>
          <MediaFileGlyph name="brief.docx" className="size-6" />
        </span>
      </MediaThumb>
    )
    await applyTailwind()
    expect(getComputedStyle(screen.getByTestId("thumb")).overflow).toBe(
      "hidden"
    )
  })

  it("lets the caller name its slot and label it", () => {
    render(<MediaThumb data-slot="own-slot" aria-label="Poster" role="img" />)
    expect(
      screen.getByRole("img", { name: "Poster" }).getAttribute("data-slot")
    ).toBe("own-slot")
  })
})

describe("MediaPlayMark", () => {
  it("is hidden from assistive tech; the video's name goes beside it", () => {
    const { container } = render(
      <MediaTile
        item={{
          id: "1",
          name: "unboxing.mp4",
          url: "https://example.com/poster.jpg",
          videoUrl: "https://www.youtube.com/watch?v=x",
        }}
      />
    )
    const mark = container.querySelector("[data-slot=media-play-mark]")!
    expect(mark.getAttribute("aria-hidden")).toBe("true")
    expect(mark.textContent).toBe("")
    expect(screen.getByText("Video")).toBeTruthy()
  })
})
