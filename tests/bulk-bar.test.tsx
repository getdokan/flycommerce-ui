import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  BulkBar,
  Button,
  SearchInput,
  type BulkBarPageState,
  type BulkBarProps,
} from "@/index"

const renderBar = (props: Partial<BulkBarProps> = {}) => {
  const handlers = {
    onPageCheckedChange: vi.fn(),
    onClear: vi.fn(),
  }
  const view = render(
    <BulkBar
      selectedCount={2}
      pageState="some"
      {...handlers}
      actions={
        <>
          <Button size="sm" variant="outline">
            Download
          </Button>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </>
      }
      {...props}
    />
  )
  return { ...view, ...handlers }
}

const pageCheckbox = () =>
  screen.getByRole("checkbox", { name: "Select all on this page" })

describe("BulkBar", () => {
  it("reads in order: page checkbox, count, Select all on page, the actions, Clear", () => {
    const { container } = renderBar()
    const order = Array.from(
      container.querySelectorAll("[role=checkbox], [aria-live], button")
    ).map(
      (element) => element.getAttribute("aria-label") ?? element.textContent
    )
    expect(order).toEqual([
      "Select all on this page",
      "2 selected",
      "Select all on page",
      "Download",
      "Delete",
      "Clear",
    ])
  })

  it("ticks the page checkbox for the whole page, a dash for some, and leaves it empty for none", () => {
    const { rerender } = render(
      <BulkBar
        selectedCount={24}
        pageState="all"
        onPageCheckedChange={() => {}}
        onClear={() => {}}
      />
    )
    expect(pageCheckbox().getAttribute("aria-checked")).toBe("true")
    expect(
      screen.queryByRole("button", { name: "Select all on page" })
    ).toBeNull()

    rerender(
      <BulkBar
        selectedCount={3}
        pageState="some"
        onPageCheckedChange={() => {}}
        onClear={() => {}}
      />
    )
    expect(pageCheckbox().getAttribute("aria-checked")).toBe("mixed")
    expect(
      screen.getByRole("button", { name: "Select all on page" })
    ).toBeTruthy()

    // Everything selected is on other pages.
    rerender(
      <BulkBar
        selectedCount={3}
        pageState="none"
        onPageCheckedChange={() => {}}
        onClear={() => {}}
      />
    )
    expect(pageCheckbox().getAttribute("aria-checked")).toBe("false")
    expect(screen.getByText("3 selected")).toBeTruthy()
  })

  it("selects the page from a dash or empty, and clears it from a tick", async () => {
    const user = userEvent.setup()
    const { onPageCheckedChange, rerender, onClear } = renderBar({
      pageState: "some",
    })
    await user.click(pageCheckbox())
    expect(onPageCheckedChange).toHaveBeenLastCalledWith(true)

    rerender(
      <BulkBar
        selectedCount={2}
        pageState="none"
        onPageCheckedChange={onPageCheckedChange}
        onClear={onClear}
      />
    )
    await user.click(pageCheckbox())
    expect(onPageCheckedChange).toHaveBeenLastCalledWith(true)

    rerender(
      <BulkBar
        selectedCount={6}
        pageState="all"
        onPageCheckedChange={onPageCheckedChange}
        onClear={onClear}
      />
    )
    await user.click(pageCheckbox())
    expect(onPageCheckedChange).toHaveBeenLastCalledWith(false)
  })

  it("moves focus to the page checkbox once Select all on page goes away", async () => {
    const user = userEvent.setup()
    // The app selects the page later, e.g. after fetching its ids.
    const onSelectPage = vi.fn()
    const { rerender, onPageCheckedChange, onClear } = renderBar({
      onSelectPage,
    })
    const button = screen.getByRole("button", { name: "Select all on page" })
    await user.click(button)
    expect(onSelectPage).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(button)

    rerender(
      <BulkBar
        selectedCount={6}
        pageState="all"
        onPageCheckedChange={onPageCheckedChange}
        onSelectPage={onSelectPage}
        onClear={onClear}
      />
    )
    expect(
      screen.queryByRole("button", { name: "Select all on page" })
    ).toBeNull()
    expect(document.activeElement).toBe(pageCheckbox())
  })

  it("forgets a Select all on page that didn't fill the page once the page changes", async () => {
    const user = userEvent.setup()
    const onSelectPage = vi.fn()
    const props = (pageState: BulkBarPageState) => ({
      selectedCount: 2,
      pageState,
      onPageCheckedChange: () => {},
      onSelectPage,
      onClear: () => {},
    })
    const { rerender } = render(<BulkBar {...props("some")} />)
    await user.click(screen.getByRole("button", { name: "Select all on page" }))
    // The page changed another way before it ever filled.
    rerender(<BulkBar {...props("none")} />)
    ;(document.activeElement as HTMLElement).blur()
    rerender(<BulkBar {...props("all")} />)
    expect(document.activeElement).toBe(document.body)
  })

  it("returns focus to returnFocusTo when the bar goes away with focus in it", async () => {
    const user = userEvent.setup()
    function List() {
      const [selected, setSelected] = React.useState(2)
      const search = React.useRef<HTMLInputElement>(null)
      return selected > 0 ? (
        <BulkBar
          selectedCount={selected}
          pageState="some"
          onPageCheckedChange={() => {}}
          onClear={() => setSelected(0)}
          returnFocusTo={search}
        />
      ) : (
        <SearchInput ref={search} aria-label="Search files" />
      )
    }
    render(<List />)
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(document.activeElement).toBe(
      screen.getByRole("searchbox", { name: "Search files" })
    )
  })

  it("leaves focus alone when the bar goes away with focus elsewhere", () => {
    const outside = document.createElement("button")
    document.body.append(outside)
    const search = document.createElement("input")
    document.body.append(search)
    const { unmount } = renderBar({ returnFocusTo: search })
    outside.focus()
    unmount()
    expect(document.activeElement).toBe(outside)
    outside.remove()
    search.remove()
  })

  it("doesn't take focus that was never in the bar when it goes away", () => {
    const search = document.createElement("input")
    document.body.append(search)
    const { unmount } = renderBar({ returnFocusTo: search })
    ;(document.activeElement as HTMLElement | null)?.blur()
    unmount()
    expect(document.activeElement).toBe(document.body)
    search.remove()
  })

  it("leaves focus alone when StrictMode mounts the bar twice", () => {
    const search = document.createElement("input")
    document.body.append(search)
    ;(document.activeElement as HTMLElement | null)?.blur()
    render(
      <React.StrictMode>
        <BulkBar
          selectedCount={1}
          pageState="some"
          onPageCheckedChange={() => {}}
          onClear={() => {}}
          returnFocusTo={search}
        />
      </React.StrictMode>
    )
    expect(document.activeElement).toBe(document.body)
    search.remove()
  })

  it("moves focus to the page checkbox when a focus trap caught it on its container", async () => {
    const user = userEvent.setup()
    const props = (pageState: BulkBarPageState) => ({
      selectedCount: 2,
      pageState,
      onPageCheckedChange: () => {},
      onSelectPage: () => {},
      onClear: () => {},
    })
    const { rerender } = render(
      <div tabIndex={-1} data-testid="dialog">
        <BulkBar {...props("some")} />
      </div>
    )
    await user.click(screen.getByRole("button", { name: "Select all on page" }))
    // A dialog's focus scope moves focus to its container when the focused button is removed.
    screen.getByTestId("dialog").focus()
    rerender(
      <div tabIndex={-1} data-testid="dialog">
        <BulkBar {...props("all")} />
      </div>
    )
    expect(document.activeElement).toBe(pageCheckbox())
  })

  it("leaves focus alone when the page fills up from elsewhere", () => {
    const { rerender, onPageCheckedChange, onClear } = renderBar()
    const outside = document.createElement("button")
    document.body.append(outside)
    outside.focus()
    rerender(
      <BulkBar
        selectedCount={6}
        pageState="all"
        onPageCheckedChange={onPageCheckedChange}
        onClear={onClear}
      />
    )
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it("calls onSelectPage instead when it is given", async () => {
    const user = userEvent.setup()
    const onSelectPage = vi.fn()
    const { onPageCheckedChange } = renderBar({ onSelectPage })
    await user.click(screen.getByRole("button", { name: "Select all on page" }))
    expect(onSelectPage).toHaveBeenCalledTimes(1)
    expect(onPageCheckedChange).not.toHaveBeenCalled()
  })

  it("clears the selection from Clear", async () => {
    const user = userEvent.setup()
    const { onClear } = renderBar()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("formats the count in the locale and takes translated labels", () => {
    renderBar({
      selectedCount: 1280,
      locale: "de-DE",
      labels: {
        pageCheckbox: "Alle auf dieser Seite auswählen",
        selected: (count, formatted) =>
          count === 1 ? "1 ausgewählt" : `${formatted} ausgewählt`,
        selectPage: "Alle auf der Seite auswählen",
        clear: "Aufheben",
      },
    })
    expect(screen.getByText("1.280 ausgewählt")).toBeTruthy()
    expect(
      screen.getByRole("checkbox", { name: "Alle auf dieser Seite auswählen" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Alle auf der Seite auswählen" })
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Aufheben" })).toBeTruthy()
  })

  it("updates the count in place, in a live region that stays while the bar is shown", () => {
    const { rerender, onPageCheckedChange, onClear } = renderBar()
    const count = screen.getByText("2 selected")
    expect(count.getAttribute("aria-live")).toBe("polite")
    rerender(
      <BulkBar
        selectedCount={24}
        pageState="all"
        onPageCheckedChange={onPageCheckedChange}
        onClear={onClear}
      />
    )
    expect(count.isConnected).toBe(true)
    expect(count.textContent).toBe("24 selected")
  })
})
