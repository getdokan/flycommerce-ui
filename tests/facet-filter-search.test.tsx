import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { FacetFilter } from "@/index"

const VENDORS = [
  { value: "1", label: "Bastide Homme", count: 6 },
  { value: "2", label: "Café Noir", count: 3 },
  { value: "3", label: "Margaux Hale", count: 14 },
  { value: "4", label: "Hale & Hearty", count: 2, disabled: true },
  { value: "5", label: "Halden Studio", count: 1 },
]

function Single({
  onValueChange = () => {},
  initial = null,
}: {
  onValueChange?: (value: string | null) => void
  initial?: string | null
}) {
  const [value, setValue] = React.useState<string | null>(initial)
  return (
    <FacetFilter
      mode="single"
      searchable
      label="Vendor"
      heading="Sold by"
      allLabel="All vendors"
      allCount={26}
      options={VENDORS}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange(next)
      }}
      labels={{ search: "Search vendors", noResults: "No vendors found" }}
    />
  )
}

const trigger = () =>
  screen.getByRole("button", { name: /^Vendor/, hidden: true })

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(trigger())
  return screen.getByRole("combobox", {
    name: "Search vendors",
  }) as HTMLInputElement
}

const shown = () =>
  screen
    .getAllByRole("option")
    .map((option) => option.textContent?.replace(/\d+$/, ""))

const active = (search: HTMLElement) =>
  document
    .getElementById(search.getAttribute("aria-activedescendant") ?? "")
    ?.textContent?.replace(/\d+$/, "")

describe("FacetFilter searchable", () => {
  it("focuses the search on open and filters by label, ignoring case", async () => {
    const user = userEvent.setup()
    render(<Single />)
    const search = await open(user)
    expect(document.activeElement).toBe(search)
    expect(screen.getByRole("listbox", { name: "Sold by" })).toBeTruthy()

    await user.type(search, "HALE")
    expect(shown()).toEqual(["All vendors", "Margaux Hale", "Hale & Hearty"])
  })

  it("ignores accents", async () => {
    const user = userEvent.setup()
    render(<Single />)
    await user.type(await open(user), "cafe")
    expect(shown()).toEqual(["All vendors", "Café Noir"])
  })

  it("keeps the all row and says so when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Single />)
    await user.type(await open(user), "zzz")
    expect(shown()).toEqual(["All vendors"])
    expect(screen.getByText("No vendors found")).toBeTruthy()
  })

  it("keeps typing in the field, so a letter never jumps to an option", async () => {
    const user = userEvent.setup()
    render(<Single />)
    const search = await open(user)
    await user.keyboard("m")
    await user.hover(screen.getByRole("option", { name: /^Margaux Hale/ }))
    await user.keyboard("a")
    expect(document.activeElement).toBe(search)
    expect(search.value).toBe("ma")
  })

  it("moves through the options with the arrows, skipping disabled ones, and picks with Enter", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Single onValueChange={onValueChange} />)
    const search = await open(user)
    await user.type(search, "hal")
    // A search starts on its first match, so Enter picks what was typed.
    expect(active(search)).toBe("Margaux Hale")
    await user.keyboard("{ArrowDown}")
    expect(active(search)).toBe("Halden Studio")
    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(active(search)).toBe("All vendors")
    await user.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenCalledWith("3")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger().textContent).toBe("Margaux Hale")
    expect(document.activeElement).toBe(trigger())
  })

  it("picks with a click, and picking the all row clears", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Single initial="1" onValueChange={onValueChange} />)
    await open(user)
    await user.click(screen.getByRole("option", { name: /^All vendors/ }))
    expect(onValueChange).toHaveBeenCalledWith(null)
    expect(trigger().textContent).toBe("All vendors")
  })

  it("marks the pick and keeps it when the search hides it", async () => {
    const user = userEvent.setup()
    render(<Single initial="1" />)
    const search = await open(user)
    expect(active(search)).toBe("Bastide Homme")
    expect(
      screen
        .getByRole("option", { name: /^Bastide Homme/ })
        .getAttribute("aria-selected")
    ).toBe("true")
    await user.type(search, "hale")
    expect(trigger().textContent).toBe("Bastide Homme")
    expect(
      screen
        .getByRole("option", { name: /^All vendors/ })
        .getAttribute("aria-selected")
    ).toBe("false")
  })

  it("Esc empties the search first, then closes the menu", async () => {
    const user = userEvent.setup()
    render(<Single />)
    const search = await open(user)
    await user.type(search, "hale")
    await user.keyboard("{Escape}")
    expect(search.value).toBe("")
    expect(shown()).toHaveLength(VENDORS.length + 1)

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("starts over with the full list each time it opens", async () => {
    const user = userEvent.setup()
    render(<Single />)
    await user.type(await open(user), "hale")
    await user.keyboard("{Escape}{Escape}")
    expect((await open(user)).value).toBe("")
    expect(shown()).toHaveLength(VENDORS.length + 1)
  })

  it("ticks several in multiple mode, stays open, and keeps Clear", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <FacetFilter
        searchable
        label="Vendor"
        options={VENDORS}
        value={[]}
        onValueChange={onValueChange}
      />
    )
    await user.click(trigger())
    const search = screen.getByRole("combobox", { name: "Search" })
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable")
    ).toBe("true")
    await user.type(search, "noir{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["2"])
    expect(screen.getByRole("listbox")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull()

    rerender(
      <FacetFilter
        searchable
        label="Vendor"
        options={VENDORS}
        value={["2"]}
        onValueChange={onValueChange}
      />
    )
    await user.clear(search)
    await user.type(search, "zzz")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("No matches")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("tells the app when it opens and closes", async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <FacetFilter
        searchable
        label="Vendor"
        options={VENDORS}
        value={[]}
        onValueChange={() => {}}
        onOpenChange={onOpenChange}
      />
    )
    await user.click(trigger())
    await user.keyboard("{Escape}")
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it("keeps the plain menu without searchable", async () => {
    const user = userEvent.setup()
    render(
      <FacetFilter
        label="Vendor"
        options={VENDORS}
        value={[]}
        onValueChange={() => {}}
      />
    )
    await user.click(trigger())
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(screen.getByRole("menu")).toBeTruthy()
  })

  it("has no axe violations while open", async () => {
    const user = userEvent.setup()
    render(<Single />)
    await open(user)
    const dialog = screen.getByRole("dialog", { name: "Sold by" })
    const check = async () =>
      (
        await axe.run(dialog, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.failureSummary).join(" | ")}`
      )
    expect(await check()).toEqual([])
    await user.type(screen.getByRole("combobox"), "zzz")
    expect(await check()).toEqual([])
  })

  describe("review fixes", () => {
    const Multi = ({
      options = VENDORS,
      onValueChange = () => {},
      initial = [],
    }: {
      options?: {
        value: string
        label: string
        count?: number
        disabled?: boolean
      }[]
      onValueChange?: (value: string[]) => void
      initial?: string[]
    }) => {
      const [value, setValue] = React.useState<string[]>(initial)
      return (
        <FacetFilter
          searchable
          label="Vendor"
          options={options}
          value={value}
          onValueChange={(next) => {
            setValue(next)
            onValueChange(next)
          }}
        />
      )
    }

    it("keeps the highlight where it was after Enter ticks an option", async () => {
      const user = userEvent.setup()
      render(<Multi />)
      await user.click(trigger())
      const search = screen.getByRole("combobox", { name: "Search" })
      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
      expect(active(search)).toBe("Margaux Hale")
    })

    it("highlights the pick on reopen after a filtered pick", async () => {
      const user = userEvent.setup()
      render(<Single />)
      await user.type(await open(user), "cafe{Enter}")
      const search = await open(user)
      expect(active(search)).toBe("Café Noir")
    })

    it("resets the search when a controlled parent reopens it", async () => {
      const user = userEvent.setup()
      const view = (isOpen: boolean) => (
        <FacetFilter
          searchable
          label="Vendor"
          options={VENDORS}
          value={[]}
          onValueChange={() => {}}
          open={isOpen}
          onOpenChange={() => {}}
        />
      )
      const { rerender } = render(view(true))
      await user.type(screen.getByRole("combobox"), "hale")
      rerender(view(false))
      rerender(view(true))
      expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("")
      expect(shown()).toHaveLength(VENDORS.length)
    })

    it("starts on the pick with defaultOpen", () => {
      render(
        <FacetFilter
          mode="single"
          searchable
          defaultOpen
          label="Vendor"
          allLabel="All vendors"
          options={VENDORS}
          value="5"
          onValueChange={() => {}}
        />
      )
      expect(active(screen.getByRole("combobox"))).toBe("Halden Studio")
    })

    it("keeps the arrows working when the options shrink while open", async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <FacetFilter
          searchable
          label="Vendor"
          options={VENDORS}
          value={[]}
          onValueChange={() => {}}
        />
      )
      await user.click(trigger())
      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}")
      rerender(
        <FacetFilter
          searchable
          label="Vendor"
          options={VENDORS.slice(0, 2)}
          value={[]}
          onValueChange={() => {}}
        />
      )
      // The highlighted option is gone, so the highlight starts over and the arrows still move.
      const search = screen.getByRole("combobox")
      expect(active(search)).toBe("Bastide Homme")
      await user.keyboard("{ArrowDown}")
      expect(active(search)).toBe("Café Noir")
    })

    it("keeps focus in the field after Clear", async () => {
      const user = userEvent.setup()
      render(<Multi initial={["1", "2"]} />)
      await user.click(trigger())
      await user.click(screen.getByRole("button", { name: "Clear" }))
      expect(document.activeElement).toBe(screen.getByRole("combobox"))
    })

    it("names the field's clear button apart from the field", async () => {
      const user = userEvent.setup()
      render(<Single />)
      await user.type(await open(user), "h")
      expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy()
    })

    it("ignores Enter while an IME is composing", async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(<Single onValueChange={onValueChange} />)
      const search = await open(user)
      await user.keyboard("{ArrowDown}")
      search.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          isComposing: true,
        })
      )
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it("never starts on a disabled option", async () => {
      const options = [
        { value: "a", label: "Alpha Closed", count: 1, disabled: true },
        { value: "b", label: "Alpha Open", count: 2 },
      ]
      const user = userEvent.setup()
      render(<Multi options={options} />)
      await user.click(trigger())
      const search = screen.getByRole("combobox")
      expect(active(search)).toBe("Alpha Open")
      await user.type(search, "alpha")
      expect(active(search)).toBe("Alpha Open")
    })

    it("keeps an option whose value is empty apart from the all row", async () => {
      const user = userEvent.setup()
      render(
        <FacetFilter
          mode="single"
          searchable
          label="Vendor"
          allLabel="All vendors"
          options={[{ value: "", label: "No vendor", count: 4 }, ...VENDORS]}
          value={null}
          onValueChange={() => {}}
        />
      )
      await user.click(trigger())
      expect(shown()).toEqual([
        "All vendors",
        "No vendor",
        ...VENDORS.map((v) => v.label),
      ])
    })

    it("points aria-controls only at a list that is there", async () => {
      const user = userEvent.setup()
      render(<Multi />)
      await user.click(trigger())
      const search = screen.getByRole("combobox")
      await user.type(search, "zzz")
      expect(search.getAttribute("aria-controls")).toBeNull()
    })
  })

  describe("review pass 2", () => {
    it("doesn't clear the pick when Enter meets a search with no match", async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(<Single initial="2" onValueChange={onValueChange} />)
      const search = await open(user)
      await user.type(search, "zzz{Enter}")
      expect(onValueChange).not.toHaveBeenCalled()
      expect(search.getAttribute("aria-activedescendant")).toBeNull()
    })

    it("keeps focus in the field after its clear button", async () => {
      const user = userEvent.setup()
      render(<Single />)
      const search = await open(user)
      await user.type(search, "ca")
      await user.click(screen.getByRole("button", { name: "Clear search" }))
      expect(search.value).toBe("")
      expect(document.activeElement).toBe(search)
    })

    it("names the highlighted option apart from the row it sits in", async () => {
      const user = userEvent.setup()
      render(
        <FacetFilter
          searchable
          label="Vendor"
          options={VENDORS}
          value={[]}
          onValueChange={() => {}}
        />
      )
      await user.click(trigger())
      const search = screen.getByRole("combobox")
      const before = search.getAttribute("aria-activedescendant")
      expect(active(search)).toBe("Bastide Homme")
      await user.type(search, "noir")
      expect(active(search)).toBe("Café Noir")
      expect(search.getAttribute("aria-activedescendant")).not.toBe(before)
    })

    it("keeps the highlight on its option when the options are re-sorted", async () => {
      const user = userEvent.setup()
      const view = (options: typeof VENDORS) => (
        <FacetFilter
          searchable
          label="Vendor"
          options={options}
          value={[]}
          onValueChange={() => {}}
        />
      )
      const { rerender } = render(view(VENDORS))
      await user.click(trigger())
      await user.keyboard("{ArrowDown}")
      const search = screen.getByRole("combobox")
      expect(active(search)).toBe("Café Noir")
      rerender(view([...VENDORS].reverse()))
      expect(active(search)).toBe("Café Noir")
    })

    it("scrolls the first match into view after filtering", async () => {
      const scroll = vi.fn()
      const original = Element.prototype.scrollIntoView
      Element.prototype.scrollIntoView = scroll
      try {
        const user = userEvent.setup()
        render(
          <FacetFilter
            searchable
            label="Vendor"
            options={VENDORS}
            value={[]}
            onValueChange={() => {}}
          />
        )
        await user.click(trigger())
        scroll.mockClear()
        await user.type(screen.getByRole("combobox"), "b")
        expect(scroll).toHaveBeenCalled()
      } finally {
        Element.prototype.scrollIntoView = original
      }
    })

    it("draws no separator under the all row when nothing matches", async () => {
      const user = userEvent.setup()
      render(<Single />)
      await user.type(await open(user), "zzz")
      const list = screen.getByRole("listbox")
      expect(list.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it("opens with ArrowDown on the trigger, as the other filter menus do", async () => {
      const user = userEvent.setup()
      render(<Single />)
      trigger().focus()
      await user.keyboard("{ArrowDown}")
      expect(
        screen.getByRole("combobox", { name: "Search vendors" })
      ).toBeTruthy()
    })

    it("closes on Esc when the search holds only spaces", async () => {
      const user = userEvent.setup()
      render(<Single />)
      await user.type(await open(user), "  ")
      await user.keyboard("{Escape}")
      expect(screen.queryByRole("listbox")).toBeNull()
    })
  })
})
