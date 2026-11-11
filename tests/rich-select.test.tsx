import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { RichSelect } from "@/index"

const OPTIONS = [
  { value: "a", label: "Café Noir" },
  { value: "b", label: "Bastide", disabled: true },
  { value: "c", label: "Margaux" },
  { value: "d", label: "Halden" },
]

function Single({
  initial = null,
  onValueChange,
}: {
  initial?: string | null
  onValueChange?: (value: string | null) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <RichSelect
      searchable
      options={OPTIONS}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("combobox"))
  return screen.getByRole("combobox", { name: "Search" })
}

const active = (search: HTMLElement) =>
  document.getElementById(search.getAttribute("aria-activedescendant") ?? "")
    ?.textContent

describe("RichSelect", () => {
  it("ignores accents in the search", async () => {
    const user = userEvent.setup()
    render(<Single />)
    await user.type(await open(user), "cafe")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Café Noir",
    ])
  })

  it("skips disabled options with the arrows", async () => {
    const user = userEvent.setup()
    render(<Single />)
    const search = await open(user)
    expect(active(search)).toBe("Café Noir")
    await user.keyboard("{ArrowDown}")
    expect(active(search)).toBe("Margaux")
    await user.keyboard("{ArrowUp}")
    expect(active(search)).toBe("Café Noir")
  })

  it("doesn't highlight a disabled option on hover", async () => {
    const user = userEvent.setup()
    render(<Single />)
    const search = await open(user)
    await user.hover(screen.getByRole("option", { name: "Bastide" }))
    expect(active(search)).toBe("Café Noir")
  })

  it("starts a search on its first option that can be picked", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Single onValueChange={onValueChange} />)
    const search = await open(user)
    await user.type(search, "a{Enter}")
    expect(onValueChange).toHaveBeenCalledWith("a")
  })

  it("starts on the pick and scrolls it into view when it opens", async () => {
    const scroll = vi.fn()
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scroll
    try {
      const user = userEvent.setup()
      render(<Single initial="d" />)
      const search = await open(user)
      expect(active(search)).toBe("Halden")
      const elements = scroll.mock.contexts as Element[]
      expect(elements.at(-1)?.textContent).toBe("Halden")
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })

  it("picks with the keyboard on a list without a search", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(
      <RichSelect
        options={OPTIONS}
        value={null}
        onValueChange={onValueChange}
      />
    )
    await user.click(screen.getByRole("combobox"))
    expect(document.activeElement).toBe(screen.getByRole("listbox"))
    await user.keyboard("{ArrowDown} ")
    expect(onValueChange).toHaveBeenCalledWith("c")
  })
})
