import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/index"

function CurrencySelect(props: React.ComponentProps<typeof SelectContent>) {
  return (
    <Select defaultValue="usd">
      <SelectTrigger aria-label="Currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent {...props}>
        <SelectItem value="usd">USD</SelectItem>
        <SelectItem value="eur">EUR</SelectItem>
      </SelectContent>
    </Select>
  )
}

const trigger = () => screen.getByRole("combobox", { name: "Currency" })
const viewport = () =>
  screen.getByRole("listbox").querySelector("[data-radix-select-viewport]")

describe("SelectContent", () => {
  it("opens below the trigger, aligned to its start", async () => {
    const user = userEvent.setup()
    render(<CurrencySelect />)
    const button = trigger()
    await user.click(button)

    const list = screen.getByRole("listbox")
    expect(list.getAttribute("data-slot")).toBe("select-content")
    expect(list.getAttribute("data-side")).toBe("bottom")
    expect(list.getAttribute("data-align")).toBe("start")
    expect(list.getAttribute("data-align-trigger")).toBe("false")
    expect(viewport()?.getAttribute("data-position")).toBe("popper")
    expect(button.getAttribute("data-state")).toBe("open")
  })

  it("puts the list over the trigger again with position item-aligned", async () => {
    const user = userEvent.setup()
    render(<CurrencySelect position="item-aligned" />)
    await user.click(trigger())

    const list = screen.getByRole("listbox")
    expect(list.getAttribute("data-align-trigger")).toBe("true")
    expect(list.hasAttribute("data-side")).toBe(false)
    expect(viewport()?.getAttribute("data-position")).toBe("item-aligned")
  })

  it("keeps an explicit side and alignment", async () => {
    const user = userEvent.setup()
    render(<CurrencySelect side="top" align="end" />)
    await user.click(trigger())

    const list = screen.getByRole("listbox")
    expect(list.getAttribute("data-side")).toBe("top")
    expect(list.getAttribute("data-align")).toBe("end")
  })

  it("marks the chosen item checked and selects another", async () => {
    const user = userEvent.setup()
    render(<CurrencySelect />)
    await user.click(trigger())

    expect(
      screen.getByRole("option", { name: "USD" }).getAttribute("data-state")
    ).toBe("checked")
    await user.click(screen.getByRole("option", { name: "EUR" }))
    expect(trigger().textContent).toBe("EUR")
    expect(trigger().getAttribute("data-state")).toBe("closed")
  })
})
