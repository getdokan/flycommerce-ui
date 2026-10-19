import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Field,
  FieldCount,
  FieldDescription,
  FieldLabel,
  Icon,
  Input,
} from "@/index"

const linkRules = (hint: Element) =>
  [hint, ...hint.querySelectorAll("*")].flatMap((el) =>
    [...el.classList].filter((name) => name.startsWith("[&>a"))
  )

describe("FieldDescription", () => {
  it("renders the hint as before without an icon", () => {
    const { container } = render(
      <FieldDescription>
        Shown on <a href="#invoices">invoices</a>.
      </FieldDescription>
    )
    const hint = container.querySelector("[data-slot=field-description]")!
    expect(hint.tagName).toBe("P")
    expect(hint.querySelector("[data-slot=field-description-icon]")).toBeNull()
    expect(hint.firstChild?.textContent).toBe("Shown on ")
    expect(hint.querySelector(":scope > a")).not.toBeNull()
    expect(linkRules(hint)).toContain("[&>a]:underline")
  })

  it("leaves a link in a hint with an icon to its own classes", () => {
    render(
      <FieldDescription icon={<Icon name="info" />}>
        Set by your base currency in{" "}
        <a
          href="#currencies"
          className="text-primary-ink underline-offset-2 hover:underline"
        >
          Currencies
        </a>
        .
      </FieldDescription>
    )
    const link = screen.getByRole("link", { name: "Currencies" })
    expect(linkRules(link.closest("[data-slot=field-description]")!)).toEqual(
      []
    )
    expect(link.getAttribute("class")).toBe(
      "text-primary-ink underline-offset-2 hover:underline"
    )
  })

  it("puts a decorative icon before the text", () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="title">Homepage title</FieldLabel>
        <Input id="title" />
        <FieldDescription icon={<Icon name="info" />}>
          Google shows about <a href="#limits">60 characters</a>.
        </FieldDescription>
      </Field>
    )
    const hint = container.querySelector("[data-slot=field-description]")!
    const icon = hint.querySelector("[data-slot=field-description-icon]")!
    expect(hint.firstElementChild).toBe(icon)
    expect(icon.getAttribute("aria-hidden")).toBe("true")
    expect(icon.querySelector("svg")).not.toBeNull()
    expect(hint.textContent).toBe("Google shows about 60 characters.")
    expect(screen.getByRole("link", { name: "60 characters" })).toBeTruthy()
  })
})

describe("FieldCount", () => {
  const shown = (count: Element) =>
    [...count.childNodes]
      .filter(
        (node) =>
          !(
            node instanceof Element &&
            node.matches("[data-slot=field-count-unit]")
          )
      )
      .map((node) => node.textContent)
      .join("")

  it("shows the count over the limit and warns only past it", () => {
    const { container, rerender } = render(<FieldCount count={52} limit={60} />)
    const count = container.querySelector("[data-slot=field-count]")!
    expect(shown(count)).toBe("52 / 60")
    expect(count.textContent).toBe("52 / 60 characters")
    expect(count.getAttribute("aria-live")).toBe("polite")
    expect(count.hasAttribute("data-over")).toBe(false)

    rerender(<FieldCount count={60} limit={60} />)
    expect(shown(count)).toBe("60 / 60")
    expect(count.hasAttribute("data-over")).toBe(false)

    rerender(<FieldCount count={61} limit={60} />)
    expect(shown(count)).toBe("61 / 60")
    expect(count.hasAttribute("data-over")).toBe(true)
  })

  it("takes the unit's words and span props", () => {
    const { container, rerender } = render(
      <FieldCount count={3} limit={70} unitLabel="karakter" id="title-count" />
    )
    const count = container.querySelector("[data-slot=field-count]")!
    expect(count.id).toBe("title-count")
    expect(count.textContent).toBe("3 / 70 karakter")

    rerender(<FieldCount count={3} limit={70} unitLabel={null} />)
    expect(count.querySelector("[data-slot=field-count-unit]")).toBeNull()
    expect(count.textContent).toBe("3 / 70")
  })

  it("sits in a label row beside the label", () => {
    render(
      <Field>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="share-title">Share title</FieldLabel>
          <FieldCount count={32} limit={60} />
        </div>
        <Input
          id="share-title"
          defaultValue="Maison Oriel: tailored outerwear"
        />
      </Field>
    )
    expect(screen.getByRole("textbox", { name: "Share title" })).toBeTruthy()
    const label = screen.getByText("Share title")
    expect(label.nextElementSibling?.getAttribute("data-slot")).toBe(
      "field-count"
    )
  })
})
