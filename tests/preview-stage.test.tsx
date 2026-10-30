import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import previewStageSource from "@/components/preview-stage.tsx?raw"
import {
  PreviewStage,
  PreviewStageDocument,
  PreviewStageImage,
  PreviewStageVideo,
} from "@/index"

describe("PreviewStage", () => {
  it("is a client module, since its parts take event handlers", () => {
    expect(previewStageSource.startsWith('"use client"')).toBe(true)
  })

  it("draws the dot-grid ground around any children", () => {
    const { container } = render(
      <PreviewStage className="rounded-lg">
        <div>Theme preview</div>
      </PreviewStage>
    )
    const stage = container.querySelector('[data-slot="preview-stage"]')!
    expect(stage.className).toContain("dot-grid")
    expect(stage.className).toContain("rounded-lg")
    expect(screen.getByText("Theme preview")).toBeTruthy()
  })

  it("shows an image with its alt text, at its own shape", () => {
    render(
      <PreviewStage>
        <PreviewStageImage
          src="https://example.com/sneaker.jpg"
          alt="Red sneaker"
          width={1600}
          height={1200}
        />
      </PreviewStage>
    )
    const image = screen.getByRole("img", { name: "Red sneaker" })
    expect(image.getAttribute("src")).toBe("https://example.com/sneaker.jpg")
    expect(image.getAttribute("width")).toBe("1600")
  })

  it("holds an image's space at its own shape before it loads, when its size is known", () => {
    render(
      <PreviewStageImage
        src="https://example.com/sneaker.jpg"
        alt="Red sneaker"
        width={1600}
        height={1200}
      />
    )
    const image = screen.getByRole("img", { name: "Red sneaker" })
    expect(image.style.width).toContain("min(100%, 1600px")
  })

  it("sizes a loaded image from the file itself, so a stale width and height can't shape its box", () => {
    const onLoad = vi.fn()
    render(
      <PreviewStageImage
        src="https://example.com/sneaker.jpg"
        alt="Red sneaker"
        width={1600}
        height={1200}
        onLoad={onLoad}
      />
    )
    const image = screen.getByRole("img", { name: "Red sneaker" })
    expect(image.style.width).not.toBe("")
    fireEvent.load(image)
    expect(onLoad).toHaveBeenCalledTimes(1)
    expect(image.style.width).toBe("")
    expect(image.style.aspectRatio).toBe("")
  })

  it("grows the image with the stage at md, staying phone-sized below it", () => {
    render(<PreviewStageImage src="https://example.com/a.jpg" alt="A" />)
    const classes = screen.getByRole("img", { name: "A" }).className.split(" ")
    expect(classes).toContain("md:[--preview-stage-media-h:--spacing(104)]")
    expect(classes.some((name) => name.startsWith("sm:[--preview"))).toBe(false)
  })

  it("keeps the loaded image's own ratio when the given size is stale, and never stretches it", () => {
    render(
      <PreviewStageImage
        src="https://example.com/sneaker.jpg"
        alt="Red sneaker"
        width={1600}
        height={1200}
      />
    )
    const image = screen.getByRole("img", { name: "Red sneaker" })
    expect(image.getAttribute("style")).toContain(
      "aspect-ratio: auto 1600 / 1200"
    )
    expect(image.className.split(" ")).toContain("object-contain")
  })

  it("opens a video's link in a new tab and reports the play", async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn((event: React.MouseEvent<HTMLElement>) =>
      event.preventDefault()
    )
    render(
      <PreviewStageVideo
        poster="https://example.com/poster.jpg"
        name="Unboxing"
        href="https://www.youtube.com/watch?v=abc"
        onPlay={onPlay}
      />
    )
    const link = screen.getByRole("link", {
      name: "Play Unboxing (opens in a new tab)",
    })
    expect(link.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=abc"
    )
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    await user.click(link)
    expect(onPlay).toHaveBeenCalledTimes(1)
    await user.pointer({ keys: "[MouseMiddle]", target: link })
    expect(onPlay).toHaveBeenCalledTimes(2)
  })

  it("keeps an aria-label the app gives the play control", () => {
    render(
      <PreviewStageVideo
        aria-label="Watch the unboxing on YouTube"
        poster="https://example.com/poster.jpg"
        name="Unboxing"
        href="https://www.youtube.com/watch?v=abc"
      />
    )
    expect(
      screen.getByRole("link", { name: "Watch the unboxing on YouTube" })
    ).toBeTruthy()
  })

  it("passes a ref and other attributes to the play control", () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <PreviewStageVideo
        ref={ref}
        id="play-video"
        data-testid="play"
        poster="https://example.com/poster.jpg"
        name="Unboxing"
        href="https://www.youtube.com/watch?v=abc"
      />
    )
    const link = screen.getByTestId("play")
    expect(link.id).toBe("play-video")
    expect(ref.current).toBe(link)
  })

  it("plays through onPlay as a button without a link, with a translated name", async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(
      <PreviewStageVideo
        poster="https://example.com/poster.jpg"
        name="Kutu açılışı"
        onPlay={onPlay}
        labels={{ play: (name) => `${name} oynat` }}
      />
    )
    const button = screen.getByRole("button", { name: "Kutu açılışı oynat" })
    button.focus()
    await user.keyboard("{Enter}")
    expect(onPlay).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("shows a document as its file-type glyph with the extension", () => {
    const { container } = render(<PreviewStageDocument name="size-guide.pdf" />)
    expect(screen.getByRole("img", { name: "size-guide.pdf" })).toBeTruthy()
    expect(container.textContent).toBe("PDF")
    expect(screen.getByText("PDF").className).toContain("text-xs")
  })
})
