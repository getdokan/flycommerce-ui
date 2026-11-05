import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button, PreviewTile } from "@/index"

import { applyTailwind } from "./tailwind"

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

  it("with href, hands a plain click to onNavigate and leaves a modified click to the browser", () => {
    const onNavigate = vi.fn()
    render(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        openLabel="Look inside Lumen"
        href="/themes/lumen"
        onNavigate={onNavigate}
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
    expect(onNavigate).not.toHaveBeenCalled()

    fireEvent.click(link)
    expect(onNavigate).toHaveBeenCalledTimes(1)
    window.removeEventListener("click", record)
    expect(prevented).toEqual([false, false, false, false, false, true])
  })

  it("lets a plain click follow the link when there is no onNavigate", () => {
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

  it("shows no pill for an empty label, and an icon alone or before the label", () => {
    const { container, rerender } = render(
      <PreviewTile src="/lumen.png" alt="Lumen" label="" onOpen={() => {}} />
    )
    const pill = () => container.querySelector("[data-slot=media-pill]")
    expect(pill()).toBeNull()

    rerender(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        labelIcon={<svg data-testid="icon" />}
        onOpen={() => {}}
      />
    )
    expect(pill()!.contains(screen.getByTestId("icon"))).toBe(true)

    rerender(
      <PreviewTile
        src="/lumen.png"
        alt="Lumen"
        label="Look inside"
        labelIcon={<svg data-testid="icon" />}
        onOpen={() => {}}
      />
    )
    expect(pill()!.textContent).toBe("Look inside")
    expect(pill()!.firstElementChild).toBe(screen.getByTestId("icon"))
  })

  it.each([
    ["button", { onOpen: () => {} }],
    ["link", { href: "/themes/lumen" }],
  ])("names its %s from alt without an openLabel", (role, open) => {
    render(<PreviewTile src="/lumen.png" alt="Lumen" {...open} />)
    expect(screen.getByRole(role, { name: "Lumen" })).toBeTruthy()
  })

  it("needs no openLabel with nothing to open", () => {
    const { container } = render(<PreviewTile src="/lumen.png" alt="Lumen" />)
    expect(container.querySelector("a, button")).toBeNull()
  })

  it("keeps a scaled picture's layers inside the tile", async () => {
    const { container } = render(
      <PreviewTile src="/lumen.png" alt="Lumen" onOpen={() => {}} />
    )
    await applyTailwind()
    expect(getComputedStyle(tile(container)).isolation).toBe("isolate")
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

  it("leaves the footer empty, and so hidden, when its children render nothing", async () => {
    const Nothing = () => null
    for (const children of [undefined, [false, null], <Nothing key="n" />]) {
      const { container, unmount } = render(
        <PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside">
          {children}
        </PreviewTile>
      )
      const footer = container.querySelector("[data-slot=preview-tile-footer]")
      expect(footer?.childNodes.length).toBe(0)
      await applyTailwind()
      expect(getComputedStyle(footer!).display).toBe("none")
      unmount()
    }
  })

  it("has no open control without onOpen or href", () => {
    render(<PreviewTile src="/lumen.png" alt="Lumen" openLabel="Look inside" />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("marks a highlighted tile and draws the brand ring", async () => {
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
    await applyTailwind()
    expect(
      getComputedStyle(tile(container)).getPropertyValue("--tw-ring-shadow")
    ).not.toBe("")
  })

  it("hides the label pill until it's revealed, and reads nothing from it", async () => {
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
    await applyTailwind()
    const pill = screen.getByText("Look inside")
    expect(pill.getAttribute("aria-hidden")).toBe("true")
    expect(getComputedStyle(pill).opacity).toBe("0%")
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
    expect(tile(container).classList.contains("custom")).toBe(true)
    const footer = container.querySelector("[data-slot=preview-tile-footer]")
    expect(footer?.textContent).toBe("Lumen 2.4.0")
    expect(
      container.querySelector("[data-slot=preview-tile-picture]")?.nextSibling
    ).toBe(footer)
  })
})
