import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button, PreviewTile } from "@/index"

const tile = (container: HTMLElement) =>
  container.querySelector("[data-slot=preview-tile]") as HTMLElement

describe("PreviewTile", () => {
  it("calls onOpen when the picture is clicked or Enter is pressed on it", async () => {
    const onOpen = vi.fn()
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        onOpen={onOpen}
      />
    )
    const open = screen.getByRole("button", { name: "Look inside Lumen" })
    fireEvent.click(open)
    expect(onOpen).toHaveBeenCalledTimes(1)

    open.focus()
    await userEvent.keyboard("{Enter}")
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it("does not call onOpen when a footer button is clicked", () => {
    const onOpen = vi.fn()
    const onInstall = vi.fn()
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        onOpen={onOpen}
      >
        <Button onClick={onInstall}>Install</Button>
      </PreviewTile>
    )
    fireEvent.click(screen.getByRole("button", { name: "Install" }))
    expect(onInstall).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it("renders the picture as a link named by openLabel with href", () => {
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        href="/themes/lumen"
      />
    )
    const link = screen.getByRole("link", { name: "Look inside Lumen" })
    expect(link.getAttribute("href")).toBe("/themes/lumen")
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("with href, hands a plain click to onOpen and leaves a modified click to the browser", () => {
    const onOpen = vi.fn()
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        href="/themes/lumen"
        onOpen={onOpen}
      />
    )
    const prevented: boolean[] = []
    // Records whether the tile let the browser follow the link, then stops jsdom's unimplemented navigation.
    const record = (event: Event) => {
      prevented.push(event.defaultPrevented)
      event.preventDefault()
    }
    window.addEventListener("click", record)
    const link = screen.getByRole("link", { name: "Look inside Lumen" })
    fireEvent.click(link, { metaKey: true })
    fireEvent.click(link, { ctrlKey: true })
    fireEvent.click(link, { shiftKey: true })
    fireEvent.click(link, { altKey: true })
    fireEvent.click(link, { button: 1 })
    expect(onOpen).not.toHaveBeenCalled()

    fireEvent.click(link)
    expect(onOpen).toHaveBeenCalledTimes(1)
    window.removeEventListener("click", record)
    expect(prevented).toEqual([false, false, false, false, false, true])
  })

  it("lets a plain click follow the link when there is no onOpen", () => {
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        href="/themes/lumen"
      />
    )
    let prevented: boolean | undefined
    const record = (event: Event) => {
      prevented = event.defaultPrevented
      event.preventDefault()
    }
    window.addEventListener("click", record)
    fireEvent.click(screen.getByRole("link", { name: "Look inside Lumen" }))
    window.removeEventListener("click", record)
    expect(prevented).toBe(false)
  })

  it("shows a label of 0 in the pill, not as stray text", () => {
    const { container } = render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        label={0}
        openLabel="Look inside Lumen"
        onOpen={() => {}}
      />
    )
    expect(
      container.querySelector("[data-slot=preview-tile-picture]")?.textContent
    ).toBe("0")
    expect(screen.getByText("0").tagName).toBe("SPAN")
  })

  it("shows no label pill when there is nothing to open", () => {
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        label="Look inside"
        openLabel="Look inside Lumen"
      />
    )
    expect(screen.queryByText("Look inside")).toBeNull()
  })

  it("leaves the footer empty, and so hidden, when its children render nothing", () => {
    const Nothing = () => null
    for (const children of [undefined, [false, null], <Nothing key="n" />]) {
      const { container, unmount } = render(
        <PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside">
          {children}
        </PreviewTile>
      )
      const footer = container.querySelector("[data-slot=preview-tile-footer]")
      expect(footer?.childNodes.length).toBe(0)
      expect(footer?.className).toContain("empty:hidden")
      unmount()
    }
  })

  it("rounds the open control's focus ring with the tile's corners, the bottom ones too when the footer is empty", () => {
    const { container } = render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        onOpen={() => {}}
      />
    )
    const open = screen.getByRole("button", { name: "Look inside Lumen" })
    expect(open.className.split(" ")).toEqual(
      expect.arrayContaining([
        "rounded-t-xl",
        "group-has-[+:empty]/picture:rounded-b-xl",
      ])
    )
    expect(open.className.split(" ")).not.toContain("rounded-b-xl")
    expect(
      container.querySelector("[data-slot=preview-tile-picture]")
        ?.nextElementSibling
    ).toBe(container.querySelector("[data-slot=preview-tile-footer]"))
  })

  it("has no open control without onOpen or href", () => {
    render(<PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside" />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("marks a highlighted tile and draws the brand ring", () => {
    const { container, rerender } = render(
      <PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside" />
    )
    expect(tile(container).hasAttribute("data-highlighted")).toBe(false)

    rerender(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside"
        highlighted
      />
    )
    expect(tile(container).getAttribute("data-highlighted")).toBe("true")
    expect(tile(container).className).toContain("data-highlighted:ring-2")
    expect(tile(container).className).toContain("data-highlighted:ring-primary")
  })

  it("renders the label pill only when given", () => {
    const { rerender } = render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        onOpen={() => {}}
      />
    )
    expect(screen.queryByText("Look inside")).toBeNull()

    rerender(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        label="Look inside"
        openLabel="Look inside Lumen"
        onOpen={() => {}}
      />
    )
    expect(screen.getByText("Look inside").className).toContain(
      "pointer-coarse:opacity-100"
    )
  })

  it("keeps the alt text on the picture and falls back when the image breaks", () => {
    const { container } = render(
      <PreviewTile
        src="/missing.png"
        alt="Meridian"
        openLabel="Look inside Meridian"
        fallback={<span>No preview</span>}
      />
    )
    const img = screen.getByAltText("Meridian")
    expect(img.getAttribute("src")).toBe("/missing.png")

    fireEvent.error(img)
    expect(screen.queryByAltText("Meridian")).toBeNull()
    expect(screen.getByText("No preview")).toBeTruthy()
    expect(
      container.querySelector("[data-slot=image]")?.hasAttribute("data-failed")
    ).toBe(true)
  })

  it("defaults the picture to 4 / 3 and takes another aspect ratio", () => {
    const { container, rerender } = render(
      <PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside" />
    )
    const picture = () =>
      container.querySelector("[data-slot=image]") as HTMLElement
    expect(picture().style.aspectRatio).toBe("4 / 3")

    rerender(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside"
        aspectRatio="16 / 9"
      />
    )
    expect(picture().style.aspectRatio).toBe("16 / 9")
  })

  it("renders the footer below the picture and passes props to the root", () => {
    const { container } = render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside"
        id="lumen"
        className="custom"
      >
        Lumen 2.4.0
      </PreviewTile>
    )
    expect(tile(container).id).toBe("lumen")
    expect(tile(container).className).toContain("custom")
    const footer = container.querySelector("[data-slot=preview-tile-footer]")
    expect(footer?.textContent).toBe("Lumen 2.4.0")
    expect(
      container.querySelector("[data-slot=preview-tile-picture]")?.nextSibling
    ).toBe(footer)
  })
})
