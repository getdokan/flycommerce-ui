import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Input, Textarea } from "@/index"

const count = (container: HTMLElement, slot: string) =>
  container.querySelector(`[data-slot=${slot}]`) as HTMLElement | null

const shown = (el: Element) =>
  [...el.childNodes]
    .filter(
      (node) =>
        !(node instanceof Element && node.matches("[data-slot$=status]"))
    )
    .map((node) => node.textContent)
    .join("")

const describedBy = (field: HTMLElement) =>
  (field.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)

describe("Textarea count", () => {
  it("measures against a soft limit and warns past it without truncating", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Textarea
        aria-label="Meta description"
        softLimit={10}
        defaultValue="Wool coat"
      />
    )
    const field = screen.getByLabelText(
      "Meta description"
    ) as HTMLTextAreaElement
    const label = count(container, "textarea-count")!
    expect(shown(label)).toBe("9/10 characters")
    expect(label.hasAttribute("data-over")).toBe(false)
    expect(field.hasAttribute("maxlength")).toBe(false)

    await user.type(field, "s on sale")
    expect(field.value).toBe("Wool coats on sale")
    expect(shown(label)).toBe("18/10 characters")
    expect(label.hasAttribute("data-over")).toBe(true)

    await user.clear(field)
    expect(shown(label)).toBe("0/10 characters")
    expect(label.hasAttribute("data-over")).toBe(false)
  })

  it("prefers the soft limit over maxLength and follows a controlled value", () => {
    function Title({ value }: { value: string }) {
      return (
        <Textarea
          aria-label="Title"
          value={value}
          onChange={() => {}}
          maxLength={100}
          softLimit={5}
          countLabel={(n, max) => `${n} of ${max}`}
        />
      )
    }
    const { container, rerender } = render(<Title value="Coat" />)
    expect(shown(count(container, "textarea-count")!)).toBe("4 of 5")
    rerender(<Title value="Coats!" />)
    expect(shown(count(container, "textarea-count")!)).toBe("6 of 5")
    expect(count(container, "textarea-count")?.hasAttribute("data-over")).toBe(
      true
    )
  })

  it("describes the field with its count instead of announcing each key press", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <>
        <span id="summary-hint">Shown under the product name.</span>
        <Textarea
          aria-label="Summary"
          aria-describedby="summary-hint"
          maxLength={500}
          showCount
        />
      </>
    )
    const field = screen.getByLabelText("Summary")
    await user.type(field, "Wool")
    expect(describedBy(field)).toEqual([
      "Shown under the product name.",
      "4/500 characters",
    ])
    expect(container.querySelector("[aria-live]")).toBeNull()
  })

  it("announces once when the text goes past the soft limit", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Textarea
        aria-label="Meta description"
        softLimit={10}
        defaultValue="Wool coat"
      />
    )
    const field = screen.getByLabelText("Meta description")
    const label = count(container, "textarea-count")!
    const status = count(container, "textarea-count-status")!
    expect(label.hasAttribute("aria-live")).toBe(false)
    expect(status.getAttribute("aria-live")).toBe("polite")
    expect(status.textContent).toBe("")

    let mutations = 0
    const observer = new MutationObserver((records) => {
      mutations += records.length
    })
    const mutated = () => {
      const seen = mutations + observer.takeRecords().length
      mutations = 0
      return seen > 0
    }
    observer.observe(status, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    const changed: boolean[] = []
    for (const key of ["s", "!", "!", "!"]) {
      await user.type(field, key)
      changed.push(mutated())
    }
    observer.disconnect()
    expect(changed).toEqual([false, true, false, false])
    expect(status.textContent).toBe(" Over the 10 character limit")
    expect(describedBy(field)).toEqual([
      "13/10 characters Over the 10 character limit",
    ])

    await user.clear(field)
    expect(status.textContent).toBe("")
  })
})

describe("Input count", () => {
  it("renders a bare input without a count", () => {
    const { container } = render(<Input aria-label="Store name" />)
    expect(container.firstElementChild?.tagName).toBe("INPUT")
    expect(count(container, "input-count")).toBeNull()
    expect(container.firstElementChild?.hasAttribute("aria-describedby")).toBe(
      false
    )
  })

  it("shows the count against maxLength and describes the field with it", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Input aria-label="App name" maxLength={60} showCount />
    )
    const label = count(container, "input-count")!
    expect(label.textContent).toBe("0/60 characters")
    const field = screen.getByLabelText("App name")
    await user.type(field, "Oriel")
    expect(label.textContent).toBe("5/60 characters")
    expect(describedBy(field)).toEqual(["5/60 characters"])
    expect(container.querySelector("[aria-live]")).toBeNull()
  })

  it("warns past a soft limit, announces it once and still calls onChange", async () => {
    const user = userEvent.setup()
    const changes: string[] = []
    function Title() {
      const [value, setValue] = React.useState("")
      return (
        <Input
          aria-label="Homepage title"
          value={value}
          softLimit={4}
          overLimitLabel={(limit) => `Más de ${limit} caracteres`}
          onChange={(event) => {
            changes.push(event.target.value)
            setValue(event.target.value)
          }}
        />
      )
    }
    const { container } = render(<Title />)
    await user.type(screen.getByLabelText("Homepage title"), "Coats")
    const label = count(container, "input-count")!
    expect(shown(label)).toBe("5/4 characters")
    expect(label.hasAttribute("data-over")).toBe(true)
    expect(count(container, "input-count-status")?.textContent).toBe(
      " Más de 4 caracteres"
    )
    expect(changes.at(-1)).toBe("Coats")
  })
})
