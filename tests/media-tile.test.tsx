import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MediaGrid, MediaTile, type MediaItem } from "@/index"

const photo: MediaItem = {
  id: "1",
  name: "sneaker-red.jpg",
  url: "https://example.com/sneaker-red.jpg",
  mimeType: "image/jpeg",
  size: 1_258_291,
}
const video: MediaItem = {
  id: "2",
  name: "unboxing.mp4",
  url: "https://example.com/poster.jpg",
  mimeType: "image/jpeg",
  videoUrl: "https://www.youtube.com/watch?v=x",
}
const pdf: MediaItem = {
  id: "3",
  name: "size-guide.pdf",
  url: "https://example.com/size-guide.pdf",
  mimeType: "application/pdf",
  size: 86_016,
}

const chip = (checkbox: HTMLElement) => checkbox.parentElement as HTMLElement

describe("MediaTile with onOpen and onSelectedChange", () => {
  it("opens from the picture and selects from the checkbox", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <MediaTile
        item={photo}
        onOpen={onOpen}
        onSelectedChange={onSelectedChange}
      />
    )

    await user.click(
      screen.getByRole("button", { name: "Open sneaker-red.jpg" })
    )
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole("checkbox", { name: "Select sneaker-red.jpg" })
    )
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it("shows the checkbox and actions on hover, focus and touch, and the checkbox always while selecting", () => {
    const { rerender } = render(
      <MediaTile
        item={photo}
        onOpen={() => {}}
        onSelectedChange={() => {}}
        actions={<button type="button">More</button>}
      />
    )
    const reveal = [
      "opacity-0",
      "group-hover/tile:opacity-100",
      "group-focus-within/tile:opacity-100",
      "pointer-coarse:opacity-100",
    ]
    const checkboxChip = () => chip(screen.getByRole("checkbox")).className
    const actionsGroup = () =>
      chip(chip(screen.getByRole("button", { name: "More" }))).className
    for (const name of reveal) {
      expect(checkboxChip()).toContain(name)
      expect(actionsGroup()).toContain(name)
    }
    expect(actionsGroup()).toContain("has-data-[state=open]:opacity-100")

    rerender(
      <MediaTile
        item={photo}
        selecting
        onOpen={() => {}}
        onSelectedChange={() => {}}
        actions={<button type="button">More</button>}
      />
    )
    expect(checkboxChip()).not.toContain("opacity-0")
    expect(actionsGroup()).toContain("opacity-0")
  })

  it("marks a selected tile with a ring, a tint and a ticked checkbox, not the corner check", () => {
    const { container } = render(
      <MediaTile item={photo} selected onSelectedChange={() => {}} />
    )
    const tile = container.querySelector("[data-slot=media-tile]")!
    expect(tile.className).toContain("data-selected:ring-2")
    expect(tile.querySelector(".bg-primary\\/10")).toBeTruthy()
    expect(tile.querySelector(".rounded-full.bg-primary")).toBeNull()
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "true"
    )
  })

  it("keeps the picker tile as it was without the new props", () => {
    const { container } = render(
      <MediaTile item={photo} selected onClick={() => {}} />
    )
    const tile = container.querySelector("[data-slot=media-tile]")!
    expect(tile.className).toContain("aspect-[6/5]")
    expect(tile.className).not.toContain("data-selected:ring-2")
    expect(tile.querySelector(".rounded-full.bg-primary")).toBeTruthy()
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(
      screen
        .getByRole("button", { name: "Select sneaker-red.jpg" })
        .getAttribute("aria-pressed")
    ).toBe("true")
  })
})

describe("MediaTile caption", () => {
  it("shows the name in full on hover, then the type and size, or Video", () => {
    render(
      <>
        <MediaTile item={photo} caption aspect="square" />
        <MediaTile item={video} caption />
        <MediaTile item={pdf} caption />
      </>
    )
    expect(screen.getByTitle("sneaker-red.jpg").className).toContain("truncate")
    expect(screen.getByText("JPG · 1.2 MB")).toBeTruthy()
    expect(screen.getByText("Video")).toBeTruthy()
    expect(screen.getByText("PDF · 84 KB")).toBeTruthy()
    // The document's name shows once, in the caption, not again in the picture.
    expect(screen.getAllByText("size-guide.pdf")).toHaveLength(1)
    const square = screen
      .getByTitle("sneaker-red.jpg")
      .closest("[data-slot=media-tile]")!
    expect(
      square.querySelector("[data-slot=media-tile-picture]")!.className
    ).toContain("aspect-square")
  })

  it("takes a description, translations and a locale", () => {
    render(
      <>
        <MediaTile item={video} caption description="YouTube video" />
        <MediaTile
          item={photo}
          caption
          locale="de"
          labels={{
            fileCaption: (type, size) => `${type}-Datei, ${size}`,
            open: (name) => `${name} öffnen`,
          }}
          onOpen={() => {}}
        />
      </>
    )
    expect(screen.getByText("YouTube video")).toBeTruthy()
    expect(screen.getByText("JPG-Datei, 1,2 MB")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "sneaker-red.jpg öffnen" })
    ).toBeTruthy()
  })
})

describe("MediaGrid with onOpen", () => {
  it("opens a file while others are selected, and selects through the checkboxes", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <MediaGrid
        items={[photo, video, pdf]}
        multiple
        selected={["2"]}
        onSelectedChange={onSelectedChange}
        onOpen={onOpen}
        actions={(item) => (
          <button type="button" aria-label={`Actions for ${item.name}`} />
        )}
        caption
      />
    )

    await user.click(
      screen.getByRole("button", { name: "Open sneaker-red.jpg" })
    )
    expect(onOpen).toHaveBeenCalledWith(photo)
    expect(onSelectedChange).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole("checkbox", { name: "Select sneaker-red.jpg" })
    )
    expect(onSelectedChange).toHaveBeenCalledWith(["2", "1"])

    // One file is selected, so every checkbox shows.
    for (const checkbox of screen.getAllByRole("checkbox"))
      expect(chip(checkbox).className).not.toContain("opacity-0")
    expect(
      screen.getByRole("button", { name: "Actions for size-guide.pdf" })
    ).toBeTruthy()
  })

  it("lays out 2 to 6 columns by its own width with columns=responsive", () => {
    const { container } = render(
      <MediaGrid items={[photo]} columns="responsive" className="p-5" />
    )
    const root = container.firstElementChild!
    expect(root.className).toContain("@container/media-grid")
    expect(root.className).toContain("p-5")
    const grid = root.firstElementChild!
    expect(grid.className).toContain("grid-cols-2")
    expect(grid.className).toContain("@5xl/media-grid:grid-cols-6")
  })

  it("still toggles from the picture without onOpen", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(
      <MediaGrid
        items={[photo, pdf]}
        selected={[]}
        onSelectedChange={onSelectedChange}
      />
    )
    expect(screen.queryByRole("checkbox")).toBeNull()
    await user.click(
      screen.getByRole("button", { name: "Select size-guide.pdf" })
    )
    expect(onSelectedChange).toHaveBeenCalledWith(["3"])
  })
})

describe("MediaTile edge cases", () => {
  it("doesn't dim an openable tile that can't be selected", () => {
    const { container } = render(
      <MediaTile
        item={photo}
        disabled
        onOpen={() => {}}
        onSelectedChange={() => {}}
      />
    )
    expect(container.querySelector(".bg-background\\/50")).toBeNull()
    expect((screen.getByRole("checkbox") as HTMLButtonElement).disabled).toBe(
      true
    )
  })

  it("keeps the video name for screen readers when description replaces the caption line", () => {
    render(<MediaTile item={video} caption description="2:34" />)
    expect(screen.getByText("Video").className).toContain("sr-only")
  })

  it("has one selection control when onClick and onSelectedChange are both given", () => {
    render(
      <MediaTile item={photo} onClick={() => {}} onSelectedChange={() => {}} />
    )
    expect(screen.getAllByRole("checkbox")).toHaveLength(1)
    expect(
      screen.queryByRole("button", { name: "Select sneaker-red.jpg" })
    ).toBeNull()
  })

  it("reveals the controls from the caption too, and marks the captioned tile selected", () => {
    const { container } = render(
      <MediaTile item={photo} caption selected onSelectedChange={() => {}} />
    )
    const root = container.querySelector("[data-slot=media-tile]")!
    expect(root.className).toContain("group/tile")
    expect(root.getAttribute("data-selected")).toBe("true")
  })
})

describe("MediaGrid loading with caption", () => {
  it("draws the caption lines under each skeleton", () => {
    const { container } = render(
      <MediaGrid items={[]} loading skeletonCount={2} caption />
    )
    expect(container.querySelectorAll("[data-slot=skeleton]").length).toBe(6)
  })
})

describe("MediaGrid width and video caption", () => {
  it("takes the full width with columns=responsive in every state, so a flex parent can't collapse it", () => {
    const { container, rerender } = render(
      <MediaGrid items={[photo]} columns="responsive" />
    )
    expect(container.firstElementChild!.className).toContain("w-full")
    rerender(<MediaGrid items={[]} loading columns="responsive" />)
    expect(container.firstElementChild!.className).toContain("w-full")
    rerender(<MediaGrid items={[]} columns="responsive" />)
    expect(container.firstElementChild!.className).toContain("w-full")
  })

  it("reads Video once when description returns null", () => {
    render(<MediaGrid items={[video]} caption description={() => null} />)
    expect(screen.getAllByText("Video")).toHaveLength(1)
  })
})
