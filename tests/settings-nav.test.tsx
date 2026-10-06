import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SettingsNav, type SettingsNavGroup } from "@/index"

const GROUPS: SettingsNavGroup[] = [
  {
    id: "store",
    label: "Store",
    items: [
      { id: "general", label: "General", href: "#general", icon: "storefront" },
      { id: "domains", label: "Domains", href: "#domains", keywords: ["dns"] },
    ],
  },
  {
    id: "money",
    label: "Money",
    items: [
      { id: "payments", label: "Payments", href: "#payments" },
      { id: "taxes", label: "Taxes", href: "#taxes", keywords: ["vat"] },
    ],
  },
]

const rail = () => screen.getByRole("navigation", { name: "Settings" })
const railLinks = () => within(rail()).queryAllByRole("link")
const filter = () => screen.getByRole("searchbox", { name: "Find a setting" })

afterEach(() => {
  window.location.hash = ""
})

describe("SettingsNav", () => {
  it("renders grouped links and marks the active one", () => {
    render(<SettingsNav groups={GROUPS} activeId="taxes" />)
    const money = screen.getByRole("list", { name: "Money" })
    expect(
      within(money)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["Payments", "Taxes"])
    const taxes = screen.getByRole("link", { name: "Taxes" })
    expect(taxes.getAttribute("aria-current")).toBe("page")
    expect(taxes.getAttribute("href")).toBe("#taxes")
    expect(
      screen.getByRole("link", { name: "General" }).getAttribute("aria-current")
    ).toBeNull()
  })

  it("renders the page beside the nav", () => {
    render(
      <SettingsNav groups={GROUPS}>
        <h1>Taxes</h1>
      </SettingsNav>
    )
    expect(screen.getByRole("heading", { name: "Taxes" })).toBeTruthy()
  })

  it("filters by label, group label and keywords, announcing the count", async () => {
    const user = userEvent.setup()
    render(<SettingsNav groups={GROUPS} />)
    const status = rail().querySelector("[aria-live]")

    await user.type(filter(), "vat")
    expect(railLinks().map((link) => link.textContent)).toEqual(["Taxes"])
    expect(status?.textContent).toBe("1 setting")

    await user.clear(filter())
    await user.type(filter(), "money")
    expect(railLinks().map((link) => link.textContent)).toEqual([
      "Payments",
      "Taxes",
    ])
    expect(status?.textContent).toBe("2 settings")

    await user.clear(filter())
    expect(railLinks()).toHaveLength(4)
    expect(status?.textContent).toBe("")
  })

  it("shows an empty state whose button clears the filter", async () => {
    const user = userEvent.setup()
    render(<SettingsNav groups={GROUPS} />)

    await user.type(filter(), "zzz")
    expect(railLinks()).toHaveLength(0)
    expect(screen.getByText("No setting matches “zzz”.")).toBeTruthy()

    await user.click(screen.getByText("Clear search", { selector: "button" }))
    expect(railLinks()).toHaveLength(4)
    expect(document.activeElement).toBe(filter())
  })

  it("has no shortcut key by default", async () => {
    const user = userEvent.setup()
    render(<SettingsNav groups={GROUPS} />)
    await user.keyboard("/")
    expect(document.activeElement).toBe(document.body)
  })

  it("focuses the filter on its shortcut key unless the user is typing in a field", async () => {
    const user = userEvent.setup()
    render(
      <>
        <input aria-label="Store name" />
        <SettingsNav groups={GROUPS} shortcutKey="/" />
      </>
    )

    await user.keyboard("/")
    expect(document.activeElement).toBe(filter())
    expect((filter() as HTMLInputElement).value).toBe("")

    await user.click(screen.getByRole("textbox", { name: "Store name" }))
    await user.keyboard("/")
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Store name" })
    )
  })

  it("takes another shortcut key, or none", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<SettingsNav groups={GROUPS} shortcutKey="k" />)
    await user.keyboard("/")
    expect(document.activeElement).toBe(document.body)
    await user.keyboard("k")
    expect(document.activeElement).toBe(filter())
    unmount()

    render(<SettingsNav groups={GROUPS} shortcutKey={false} />)
    await user.keyboard("/")
    expect(document.activeElement).toBe(document.body)
  })

  it("renders links through renderLink", () => {
    const renderLink = vi.fn((item, props) => (
      <a {...props} data-router-link={item.id} />
    ))
    render(
      <SettingsNav groups={GROUPS} activeId="general" renderLink={renderLink} />
    )
    expect(renderLink).toHaveBeenCalledWith(
      GROUPS[0].items[0],
      expect.objectContaining({ href: "#general", "aria-current": "page" })
    )
    expect(
      screen
        .getByRole("link", { name: "Domains" })
        .getAttribute("data-router-link")
    ).toBe("domains")
  })

  it("jumps to a section from the narrow-screen menu", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <SettingsNav groups={GROUPS} activeId="general" onNavigate={onNavigate} />
    )
    const jump = screen.getByRole("combobox", { name: "Jump to section" })
    expect(jump.textContent).toBe("General")

    await user.click(jump)
    const listbox = screen.getByRole("listbox")
    expect(
      within(listbox)
        .getAllByRole("group")
        .map((group) => within(group).getAllByRole("option")[0].textContent)
    ).toEqual(["General", "Payments"])
    expect(within(listbox).getByText("Store")).toBeTruthy()
    expect(within(listbox).getByText("Money")).toBeTruthy()

    await user.click(screen.getByRole("option", { name: "Taxes" }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith(GROUPS[1].items[1])
  })

  it("never navigates from keys on the closed jump menu", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <SettingsNav groups={GROUPS} activeId="general" onNavigate={onNavigate} />
    )
    const jump = screen.getByRole("combobox", { name: "Jump to section" })
    jump.focus()

    await user.keyboard("t")
    expect(onNavigate).not.toHaveBeenCalled()
    expect(jump.textContent).toBe("General")

    await user.keyboard("{ArrowDown}")
    expect(jump.getAttribute("aria-expanded")).toBe("true")
    expect(onNavigate).not.toHaveBeenCalled()

    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(onNavigate).not.toHaveBeenCalled()

    await user.keyboard("{Escape}")
    expect(jump.getAttribute("aria-expanded")).toBe("false")
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it("navigates once Enter picks a highlighted item", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <SettingsNav groups={GROUPS} activeId="general" onNavigate={onNavigate} />
    )
    screen.getByRole("combobox", { name: "Jump to section" }).focus()

    await user.keyboard("{Enter}")
    await user.keyboard("{ArrowDown}")
    expect(onNavigate).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith(GROUPS[0].items[1])
  })

  it("shows the nav label until an item is active, and follows the href by default", async () => {
    const user = userEvent.setup()
    render(<SettingsNav groups={GROUPS} />)
    const jump = screen.getByRole("combobox", { name: "Jump to section" })
    expect(jump.textContent).toBe("Settings")

    await user.click(jump)
    await user.click(screen.getByRole("option", { name: "Domains" }))
    expect(window.location.hash).toBe("#domains")
  })

  it("translates every string through labels", async () => {
    const user = userEvent.setup()
    render(
      <SettingsNav
        groups={GROUPS}
        labels={{
          nav: "Ajustes",
          filter: "Buscar un ajuste",
          clear: "Borrar",
          results: (count) => `${count} ajustes`,
          noMatch: (query) => `Nada coincide con «${query}».`,
          jump: "Ir a la sección",
        }}
      />
    )
    expect(screen.getByRole("navigation", { name: "Ajustes" })).toBeTruthy()
    expect(
      screen.getByRole("combobox", { name: "Ir a la sección" })
    ).toBeTruthy()

    await user.type(
      screen.getByRole("searchbox", { name: "Buscar un ajuste" }),
      "zzz"
    )
    expect(screen.getByText("Nada coincide con «zzz».")).toBeTruthy()
    expect(screen.getByText("0 ajustes")).toBeTruthy()
    expect(screen.getAllByRole("button", { name: "Borrar" })).toHaveLength(2)
  })
})
