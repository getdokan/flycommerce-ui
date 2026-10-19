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

  it("underlines a link in a hint with an icon like one in a plain hint", () => {
    const { container } = render(
      <>
        <FieldDescription>
          Shown on <a href="#invoices">invoices</a>.
        </FieldDescription>
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
      </>
    )
    const [plain, withIcon] = container.querySelectorAll(
      "[data-slot=field-description]"
    )
    const link = screen.getByRole("link", { name: "Currencies" })
    expect(link.parentElement?.closest("[data-slot=field-description]")).toBe(
      withIcon
    )
    expect(linkRules(link.parentElement!)).toEqual(linkRules(plain))
    expect(linkRules(plain)).toContain("[&>a]:underline")
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
            node instanceof Element && node.matches("[data-slot^=field-count-]")
          )
      )
      .map((node) => node.textContent)
      .join("")

  it("shows the count over the limit and warns only past it", () => {
    const { container, rerender } = render(<FieldCount count={52} limit={60} />)
    const count = container.querySelector("[data-slot=field-count]")!
    expect(shown(count)).toBe("52 / 60")
    expect(count.textContent).toBe("52 / 60 characters")
    expect(count.hasAttribute("data-over")).toBe(false)

    rerender(<FieldCount count={60} limit={60} />)
    expect(shown(count)).toBe("60 / 60")
    expect(count.hasAttribute("data-over")).toBe(false)

    rerender(<FieldCount count={61} limit={60} />)
    expect(shown(count)).toBe("61 / 60")
    expect(count.hasAttribute("data-over")).toBe(true)
  })

  it("announces only when the count crosses the limit", () => {
    const { container, rerender } = render(<FieldCount count={59} limit={60} />)
    const count = container.querySelector("[data-slot=field-count]")!
    const status = count.querySelector("[data-slot=field-count-status]")!
    expect(count.hasAttribute("aria-live")).toBe(false)
    expect(status.getAttribute("aria-live")).toBe("polite")

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
    const heard: [string, boolean][] = []
    for (const n of [60, 61, 62, 75, 59]) {
      rerender(<FieldCount count={n} limit={60} />)
      heard.push([status.textContent ?? "", mutated()])
    }
    observer.disconnect()
    expect(heard).toEqual([
      ["", false],
      [" Over the 60 character limit", true],
      [" Over the 60 character limit", false],
      [" Over the 60 character limit", false],
      ["", true],
    ])
  })

  it("takes its words, an id and span props", () => {
    const { container, rerender } = render(
      <FieldCount
        count={73}
        limit={70}
        unitLabel="karakter"
        overLimitLabel={(limit) => `${limit} karakter sınırı aşıldı`}
        id="title-count"
      />
    )
    const count = container.querySelector("[data-slot=field-count]")!
    expect(count.id).toBe("title-count")
    expect(count.textContent).toBe("73 / 70 karakter 70 karakter sınırı aşıldı")

    rerender(<FieldCount count={3} limit={70} unitLabel={null} />)
    expect(count.querySelector("[data-slot=field-count-unit]")).toBeNull()
    expect(count.textContent).toBe("3 / 70")
    expect(count.id).not.toBe("")
  })

  it("sits in a label row beside the label and describes the field", () => {
    render(
      <Field>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="share-title">Share title</FieldLabel>
          <FieldCount id="share-title-count" count={32} limit={60} />
        </div>
        <Input
          id="share-title"
          aria-describedby="share-title-count"
          defaultValue="Maison Oriel: tailored outerwear"
        />
      </Field>
    )
    const field = screen.getByRole("textbox", { name: "Share title" })
    const label = screen.getByText("Share title")
    expect(label.nextElementSibling?.getAttribute("data-slot")).toBe(
      "field-count"
    )
    expect(
      document.getElementById(field.getAttribute("aria-describedby")!)
        ?.textContent
    ).toBe("32 / 60 characters")
  })
})
