import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Input, Textarea } from "@/index"

const count = (container: HTMLElement, slot: string) =>
  container.querySelector(`[data-slot=${slot}]`) as HTMLElement | null

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
    expect(label.textContent).toBe("9/10 characters")
    expect(label.hasAttribute("data-over")).toBe(false)
    expect(field.hasAttribute("maxlength")).toBe(false)

    await user.type(field, "s on sale")
    expect(field.value).toBe("Wool coats on sale")
    expect(label.textContent).toBe("18/10 characters")
    expect(label.hasAttribute("data-over")).toBe(true)

    await user.clear(field)
    expect(label.textContent).toBe("0/10 characters")
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
    expect(count(container, "textarea-count")?.textContent).toBe("4 of 5")
    rerender(<Title value="Coats!" />)
    expect(count(container, "textarea-count")?.textContent).toBe("6 of 5")
    expect(count(container, "textarea-count")?.hasAttribute("data-over")).toBe(
      true
    )
  })
})

describe("Input count", () => {
  it("renders a bare input without a count", () => {
    const { container } = render(<Input aria-label="Store name" />)
    expect(container.firstElementChild?.tagName).toBe("INPUT")
    expect(count(container, "input-count")).toBeNull()
  })

  it("shows the count against maxLength", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Input aria-label="App name" maxLength={60} showCount />
    )
    const label = count(container, "input-count")!
    expect(label.textContent).toBe("0/60 characters")
    await user.type(screen.getByLabelText("App name"), "Oriel")
    expect(label.textContent).toBe("5/60 characters")
    expect(label.getAttribute("aria-live")).toBe("polite")
  })

  it("warns past a soft limit and still calls onChange", async () => {
    const user = userEvent.setup()
    const changes: string[] = []
    function Title() {
      const [value, setValue] = React.useState("")
      return (
        <Input
          aria-label="Homepage title"
          value={value}
          softLimit={4}
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
    expect(label.textContent).toBe("5/4 characters")
    expect(label.hasAttribute("data-over")).toBe(true)
    expect(changes.at(-1)).toBe("Coats")
  })
})
