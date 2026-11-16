import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import * as React from "react"
import { FiChevronDown } from "react-icons/fi"
import { describe, expect, it, vi } from "vitest"

import { TreeSelect, type TreeSelectOption } from "@/index"

const OPTIONS: TreeSelectOption[] = [
  {
    value: "shoes",
    label: "Shoes",
    children: [{ value: "sneakers", label: "Sneakers" }],
  },
  { value: "bags", label: "Bags" },
]

function Picker({
  options = OPTIONS,
  onAdd,
  onValueChange,
  ...props
}: Partial<React.ComponentProps<typeof TreeSelect>> & {
  onAdd?: () => void
}) {
  const [value, setValue] = React.useState<string | null>("bags")
  return (
    <TreeSelect
      options={options}
      value={value}
      onValueChange={(next, path) => {
        setValue(next)
        onValueChange?.(next, path)
      }}
      confirm={false}
      placeholder="Choose a category"
      footerAction={
        onAdd ? { label: "Add category", onSelect: onAdd } : undefined
      }
      {...props}
    />
  )
}

const trigger = () =>
  document.querySelector<HTMLButtonElement>('button[role="combobox"]')!

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(trigger())
  return screen.getByRole("combobox", { name: "Search" })
}

const action = () =>
  document.querySelector<HTMLElement>('[data-slot="tree-select-footer-action"]')

describe("TreeSelect", () => {
  it("shows the same chevron-down as Select, turned while open", async () => {
    const user = userEvent.setup()
    render(<Picker />)
    const icon = trigger().querySelector('[data-slot="tree-select-icon"]')!
    const chevron = render(<FiChevronDown />).container.querySelector("svg")!
    expect(icon.innerHTML).toBe(chevron.innerHTML)
    expect(icon.getAttribute("class")).toContain(
      "group-data-[state=open]/tree-select-trigger:rotate-180"
    )
    await open(user)
    expect(trigger().getAttribute("data-state")).toBe("open")
  })

  it("has no footer action by default", async () => {
    const user = userEvent.setup()
    render(<Picker />)
    await open(user)
    expect(action()).toBeNull()
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Shoes",
      "Bags",
    ])
  })

  it("puts the footer action last in the list, after a separator", async () => {
    const user = userEvent.setup()
    render(<Picker onAdd={() => {}} />)
    await open(user)
    const list = screen.getByRole("listbox")
    const last = list.lastElementChild as HTMLElement
    expect(last).toBe(action())
    expect(last.textContent).toBe("Add category")
    expect(last.getAttribute("role")).toBe("option")
    expect(last.hasAttribute("aria-selected")).toBe(false)
    expect(last.querySelector('[data-icon-name="add"]')).not.toBeNull()
    expect(last.classList.contains("text-primary-ink")).toBe(true)
    const separator = last.previousElementSibling as HTMLElement
    expect(separator.getAttribute("aria-hidden")).toBe("true")
    expect(separator.getAttribute("role")).toBeNull()
  })

  it("adds no accessibility violations to the open list", async () => {
    const audit = async (onAdd?: () => void) => {
      const user = userEvent.setup()
      const { unmount } = render(<Picker onAdd={onAdd} />)
      await open(user)
      const results = await axe.run(screen.getByRole("listbox"), {
        rules: { "color-contrast": { enabled: false } },
      })
      unmount()
      return results.violations.map((v) =>
        v.nodes.map((n) => `${v.id}: ${n.failureSummary}`)
      )
    }
    expect(await audit(() => {})).toEqual(await audit())
  })

  it("reaches the action with the arrows and runs it on Enter without changing the value", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onValueChange = vi.fn()
    render(<Picker onAdd={onAdd} onValueChange={onValueChange} />)
    const search = await open(user)
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}")
    expect(search.getAttribute("aria-activedescendant")).toBe(action()!.id)
    expect(action()!.hasAttribute("data-active")).toBe(true)
    await user.keyboard("{Enter}")
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
    expect(trigger().textContent).toBe("Bags")
  })

  it("runs the action on click and leaves a pending Confirm draft alone", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onValueChange = vi.fn()
    render(<Picker confirm onAdd={onAdd} onValueChange={onValueChange} />)
    await open(user)
    await user.click(screen.getByRole("option", { name: "Shoes" }))
    await user.click(action()!)
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger().textContent).toBe("Bags")
  })

  it("keeps the action when the search matches nothing", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Picker onAdd={onAdd} />)
    const search = await open(user)
    await user.type(search, "zzz")
    expect(screen.getByRole("listbox").textContent).toContain("No results")
    expect(action()).not.toBeNull()
    expect(search.getAttribute("aria-activedescendant")).toBe(action()!.id)
    await user.keyboard("{Enter}")
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it("shows the action under `empty` when there are no options, focused", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Picker options={[]} empty="No categories yet." onAdd={onAdd} />)
    await user.click(trigger())
    const button = action()!
    expect(button.tagName).toBe("BUTTON")
    expect(button.parentElement?.previousElementSibling?.textContent).toBe(
      "No categories yet."
    )
    expect(document.activeElement).toBe(button)
    await user.keyboard("{Enter}")
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
  })

  it("runs the action only once the list has closed, so focus isn't pulled back to the trigger after it", async () => {
    const user = userEvent.setup()
    let listOpenWhenRun: boolean | null = null
    const onAdd = vi.fn(() => {
      listOpenWhenRun = screen.queryByRole("listbox") !== null
    })
    render(<Picker onAdd={onAdd} />)
    await open(user)
    await user.click(action()!)

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(listOpenWhenRun).toBe(false)
  })

  it("keeps the action highlighted when options arrive while the list is open", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Picker options={[]} onAdd={onAdd} onValueChange={onValueChange} />
    )
    await user.click(trigger())
    rerender(
      <Picker options={OPTIONS} onAdd={onAdd} onValueChange={onValueChange} />
    )
    const search = screen.getByRole("combobox", { name: "Search" })
    await user.hover(action()!)
    rerender(
      <Picker
        options={[...OPTIONS, { value: "late", label: "Late arrival" }]}
        onAdd={onAdd}
        onValueChange={onValueChange}
      />
    )

    expect(action()!.hasAttribute("data-active")).toBe(true)
    search.focus()
    await user.keyboard("{Enter}")
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
