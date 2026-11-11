import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MediaGrid, MediaTile, type MediaItem } from "@/index"

import { applyTailwind } from "./tailwind"

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
const pictureOf = (root: ParentNode) =>
  root.querySelector("[data-slot=media-tile-picture]") as HTMLElement
const ring = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--tw-ring-shadow")

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

  it("hides the checkbox and actions until revealed, and keeps the checkbox while selecting", async () => {
    const tile = (selecting: boolean) => (
      <MediaTile
        item={photo}
        selecting={selecting}
        onOpen={() => {}}
        onSelectedChange={() => {}}
        actions={<button type="button">More</button>}
      />
    )
    const { rerender } = render(tile(false))
    await applyTailwind()
    const opacity = (element: Element) => getComputedStyle(element).opacity
    const checkboxChip = () => chip(screen.getByRole("checkbox"))
    const actionsGroup = () =>
      chip(chip(screen.getByRole("button", { name: "More" })))
    expect(opacity(checkboxChip())).toBe("0%")
    expect(opacity(actionsGroup())).toBe("0%")

    screen.getByRole("checkbox").focus()
    expect(opacity(checkboxChip())).toBe("100%")
    expect(opacity(actionsGroup())).toBe("100%")
    screen.getByRole("checkbox").blur()

    rerender(tile(true))
    await applyTailwind()
    expect(opacity(checkboxChip())).toBe("1")
    expect(opacity(actionsGroup())).toBe("0%")
  })

  it("marks a selected tile with a ring, a tint and a ticked checkbox, not the corner check", async () => {
    const { container } = render(
      <MediaTile item={photo} selected onSelectedChange={() => {}} />
    )
    await applyTailwind()
    expect(ring(pictureOf(container))).not.toBe("")
    expect(
      container.querySelector("[data-slot=media-tile-tint]")
    ).not.toBeNull()
    expect(container.querySelector("[data-slot=media-tile-check]")).toBeNull()
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "true"
    )
  })

  it("keeps the picker tile as it was without the new props", async () => {
    const { container } = render(
      <MediaTile item={photo} selected onClick={() => {}} />
    )
    await applyTailwind()
    expect(getComputedStyle(pictureOf(container)).aspectRatio).toBe("6/5")
    expect(ring(pictureOf(container))).toBe("")
    expect(
      container.querySelector("[data-slot=media-tile-check]")
    ).not.toBeNull()
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(
      screen
        .getByRole("button", { name: "Select sneaker-red.jpg" })
        .getAttribute("aria-pressed")
    ).toBe("true")
  })

  it.each([
    ["without a caption", false],
    ["with a caption", true],
  ])("puts data-slot and className on the same root %s", (_name, caption) => {
    const { container } = render(
      <MediaTile item={photo} caption={caption} className="own" />
    )
    const root = container.firstElementChild!
    expect(root.getAttribute("data-slot")).toBe("media-tile")
    expect(root.classList.contains("own")).toBe(true)
    expect(pictureOf(root).classList.contains("own")).toBe(false)
  })
})

describe("MediaTile caption", () => {
  it("shows the name in full on hover, then the type and size, or Video", async () => {
    render(
      <>
        <MediaTile item={photo} caption aspect="square" />
        <MediaTile item={video} caption />
        <MediaTile item={pdf} caption />
      </>
    )
    await applyTailwind()
    expect(
      getComputedStyle(screen.getByTitle("sneaker-red.jpg")).textOverflow
    ).toBe("ellipsis")
    expect(screen.getByText("JPG · 1.2 MB")).toBeTruthy()
    expect(screen.getAllByText("Video").length).toBeGreaterThan(0)
    expect(screen.getByText("PDF · 84 KB")).toBeTruthy()
    // The document's name shows once, in the caption, not again in the picture.
    expect(screen.getAllByText("size-guide.pdf")).toHaveLength(1)
    const square = screen
      .getByTitle("sneaker-red.jpg")
      .closest("[data-slot=media-tile]")!
    expect(getComputedStyle(pictureOf(square)).aspectRatio).toBe("1 / 1")
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
    await applyTailwind()
    for (const checkbox of screen.getAllByRole("checkbox"))
      expect(getComputedStyle(chip(checkbox)).opacity).toBe("1")
    expect(
      screen.getByRole("button", { name: "Actions for size-guide.pdf" })
    ).toBeTruthy()
  })

  it("lays out by its own width with columns=responsive, and starts at 2 columns", async () => {
    const { container } = render(
      <MediaGrid items={[photo]} columns="responsive" className="p-5" />
    )
    await applyTailwind()
    const root = container.firstElementChild!
    expect(getComputedStyle(root).containerType).toBe("inline-size")
    expect(root.classList.contains("p-5")).toBe(true)
    expect(getComputedStyle(root.firstElementChild!).gridTemplateColumns).toBe(
      "repeat(2, minmax(0, 1fr))"
    )
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
  it("dims a tile that can't be picked, but not an openable one", () => {
    const { container: picker } = render(
      <MediaTile item={photo} disabled onClick={() => {}} />
    )
    expect(picker.querySelector("[data-slot=media-tile-dim]")).not.toBeNull()

    const { container } = render(
      <MediaTile
        item={photo}
        disabled
        onOpen={() => {}}
        onSelectedChange={() => {}}
      />
    )
    expect(container.querySelector("[data-slot=media-tile-dim]")).toBeNull()
    expect((screen.getByRole("checkbox") as HTMLButtonElement).disabled).toBe(
      true
    )
  })

  it("keeps the video name for screen readers when description replaces the caption line", async () => {
    render(<MediaTile item={video} caption description="2:34" />)
    await applyTailwind()
    expect(getComputedStyle(screen.getByText("Video")).position).toBe(
      "absolute"
    )
  })

  it("has one selection control when onClick and onSelectedChange are both given", () => {
    render(
      // @ts-expect-error The two modes don't mix; a plain-JS caller still gets one control.
      <MediaTile item={photo} onClick={() => {}} onSelectedChange={() => {}} />
    )
    expect(screen.getAllByRole("checkbox")).toHaveLength(1)
    expect(
      screen.queryByRole("button", { name: "Select sneaker-red.jpg" })
    ).toBeNull()
  })

  it("marks the captioned tile selected", () => {
    const { container } = render(
      <MediaTile item={photo} caption selected onSelectedChange={() => {}} />
    )
    const root = container.querySelector("[data-slot=media-tile]")!
    expect(root.getAttribute("data-selected")).toBe("true")
  })
})

describe("MediaGrid active tile", () => {
  const library = (selected: string[], onSelectedChange = vi.fn()) => (
    <MediaGrid
      items={[photo, pdf]}
      multiple
      selected={selected}
      onSelectedChange={onSelectedChange}
      onOpen={() => {}}
    />
  )
  const active = (container: Element) =>
    container.querySelectorAll("[data-slot=media-tile-picture][data-active]")

  it("doesn't keep a ring after the selection is cleared from outside the grid", async () => {
    const user = userEvent.setup()
    const { container, rerender } = render(library([]))
    await user.click(
      screen.getByRole("checkbox", { name: "Select sneaker-red.jpg" })
    )
    expect(active(container)).toHaveLength(0)

    rerender(library(["1"]))
    expect(active(container)).toHaveLength(0)
    rerender(library([]))
    await applyTailwind()
    expect(active(container)).toHaveLength(0)
    for (const picture of container.querySelectorAll(
      "[data-slot=media-tile-picture]"
    ))
      expect(ring(picture)).toBe("")
  })

  it("takes the active tile only from activeId with onOpen, and doesn't report a checkbox as a move", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    const { container } = render(
      <MediaGrid
        items={[photo, pdf]}
        multiple
        selected={[]}
        onSelectedChange={() => {}}
        onOpen={() => {}}
        activeId="3"
        onActiveChange={onActiveChange}
      />
    )
    await user.click(
      screen.getByRole("checkbox", { name: "Select sneaker-red.jpg" })
    )
    expect(onActiveChange).not.toHaveBeenCalled()
    expect(active(container)).toHaveLength(1)
    expect(
      active(container)[0]!.closest("[data-slot=media-tile]")!.textContent
    ).toContain("size-guide.pdf")
  })

  it("still tracks the last one clicked without onOpen", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    const { container } = render(
      <MediaGrid
        items={[photo, pdf]}
        selected={[]}
        onSelectedChange={() => {}}
        onActiveChange={onActiveChange}
      />
    )
    await user.click(
      screen.getByRole("button", { name: "Select size-guide.pdf" })
    )
    expect(onActiveChange).toHaveBeenCalledWith("3")
    expect(active(container)).toHaveLength(1)
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
  it.each([
    ["with items", { items: [photo] }],
    ["loading", { items: [], loading: true }],
    ["empty", { items: [] }],
  ])(
    "takes the full width with columns=responsive %s, so a flex parent can't collapse it",
    async (_name, props) => {
      const { container } = render(
        <MediaGrid {...props} columns="responsive" />
      )
      await applyTailwind()
      expect(getComputedStyle(container.firstElementChild!).width).toBe("100%")
    }
  )

  it("reads Video once when description returns null", () => {
    render(<MediaGrid items={[video]} caption description={() => null} />)
    const read = screen
      .getAllByText("Video")
      .filter((label) => !label.closest("[aria-hidden]"))
    expect(read).toHaveLength(1)
  })
})
