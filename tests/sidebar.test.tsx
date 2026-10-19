import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import themeCss from "@/styles/theme.css?raw"
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/index"

const LIGHT_RAIL = themeCss
  .split("}")
  .find((block) => /--sidebar:\s*#ffffff;/.test(block))!
  .split("{")[0]
  .trim()

const rail = () => document.querySelector<HTMLElement>('[data-slot="sidebar"]')!
const pressShortcut = (target: Element, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(target, { key: "b", ctrlKey: true, ...init })

function Shell(props: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider {...props}>
      <Sidebar collapsible="icon">Navigation</Sidebar>
      <SidebarInset>
        <input aria-label="Title" />
        <textarea aria-label="Notes" />
        <select aria-label="Unit">
          <option>kg</option>
        </select>
        <div role="textbox" aria-label="Description" contentEditable />
        <div onKeyDown={(event) => event.preventDefault()}>
          <button type="button">Bold</button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

afterEach(() => {
  delete document.documentElement.dataset.sidebarTheme
  vi.restoreAllMocks()
})

describe("Sidebar shortcut", () => {
  it("toggles on Ctrl+B and Cmd+B outside fields", () => {
    render(<Shell />)
    expect(rail().dataset.state).toBe("expanded")

    expect(pressShortcut(document.body)).toBe(false)
    expect(rail().dataset.state).toBe("collapsed")

    pressShortcut(document.body, { ctrlKey: false, metaKey: true })
    expect(rail().dataset.state).toBe("expanded")
  })

  it.each([
    ["an input", () => screen.getByRole("textbox", { name: "Title" })],
    ["a textarea", () => screen.getByRole("textbox", { name: "Notes" })],
    ["a select", () => screen.getByRole("combobox", { name: "Unit" })],
    [
      "a contenteditable",
      () => screen.getByRole("textbox", { name: "Description" }),
    ],
  ])("leaves the key to %s", (_name, field) => {
    render(<Shell />)
    expect(pressShortcut(field())).toBe(true)
    expect(rail().dataset.state).toBe("expanded")
  })

  it("ignores a key another handler already took", () => {
    render(<Shell />)
    pressShortcut(screen.getByRole("button", { name: "Bold" }))
    expect(rail().dataset.state).toBe("expanded")
  })

  it("follows shortcutKey, and false turns the shortcut off", () => {
    const { unmount } = render(<Shell shortcutKey="k" />)
    expect(pressShortcut(document.body)).toBe(true)
    expect(rail().dataset.state).toBe("expanded")
    pressShortcut(document.body, { key: "k" })
    expect(rail().dataset.state).toBe("collapsed")
    unmount()

    render(<Shell shortcutKey={false} />)
    expect(pressShortcut(document.body)).toBe(true)
    expect(rail().dataset.state).toBe("expanded")
  })
})

describe("Sidebar theme", () => {
  function Rail(props: React.ComponentProps<typeof Sidebar>) {
    return (
      <TooltipProvider>
        <SidebarProvider>
          <Sidebar collapsible="icon" {...props}>
            <SidebarTrigger />
          </Sidebar>
          <Tooltip open>
            <TooltipTrigger>Help</TooltipTrigger>
            <TooltipContent>Gross sales</TooltipContent>
          </Tooltip>
        </SidebarProvider>
      </TooltipProvider>
    )
  }

  const outsideTheRail = () => [
    document.documentElement,
    document.body,
    document.querySelector('[data-slot="sidebar-wrapper"]')!,
    document.querySelector('[data-slot="tooltip-content"]')!,
  ]

  it("sets the light rail colours on the rail only", () => {
    render(<Rail theme="light" />)
    expect(rail().dataset.sidebarTheme).toBe("light")
    expect(rail().matches(LIGHT_RAIL)).toBe(true)
    for (const element of outsideTheRail()) {
      expect(element.matches(LIGHT_RAIL)).toBe(false)
    }
  })

  it("follows data-sidebar-theme on an ancestor without reaching popups", () => {
    document.documentElement.dataset.sidebarTheme = "light"
    render(<Rail />)
    expect(rail().matches(LIGHT_RAIL)).toBe(true)
    for (const element of outsideTheRail()) {
      expect(element.matches(LIGHT_RAIL)).toBe(false)
    }
  })

  it('keeps theme="dark" dark inside a light ancestor', () => {
    document.documentElement.dataset.sidebarTheme = "light"
    render(<Rail theme="dark" />)
    expect(rail().matches(LIGHT_RAIL)).toBe(false)
  })

  it("is dark by default", () => {
    render(<Rail />)
    expect(rail().dataset.sidebarTheme).toBeUndefined()
    expect(rail().matches(LIGHT_RAIL)).toBe(false)
  })

  it("gives the mobile sheet the light colours too", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query.includes("max-width"),
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent: () => false,
        }) as MediaQueryList
    )
    const user = userEvent.setup()
    render(
      <SidebarProvider>
        <Sidebar theme="light">Navigation</Sidebar>
        <SidebarTrigger />
      </SidebarProvider>
    )
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }))
    const sheet = document.querySelector<HTMLElement>(
      '[data-slot="sidebar"][data-mobile="true"]'
    )!
    expect(sheet.dataset.sidebarTheme).toBe("light")
    expect(sheet.matches(LIGHT_RAIL)).toBe(true)
    expect(
      document.querySelector('[data-slot="sheet-overlay"]')!.matches(LIGHT_RAIL)
    ).toBe(false)
  })
})
