import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Badge, Icon, PersonCell, personInitials } from "@/index"

const fallback = (container: HTMLElement) =>
  container.querySelector("[data-slot=avatar-fallback]") as HTMLElement

describe("personInitials", () => {
  it("takes the first letters of the first two words", () => {
    expect(personInitials("Hana Lindqvist")).toBe("HL")
    expect(personInitials("  mateo  ")).toBe("M")
    expect(personInitials("dana@example.com")).toBe("DE")
    expect(personInitials("Ana Maria Costa")).toBe("AM")
  })
})

describe("PersonCell", () => {
  it("shows the initials in the person colour, the name in full on hover, and the description", () => {
    const { container } = render(
      <PersonCell
        name="Hana Lindqvist"
        colorFrom={500}
        description="hana@example.com"
      />
    )
    expect(fallback(container).textContent).toBe("HL")
    expect(fallback(container).className).toMatch(/\bbg-person-[1-8]\b/)
    expect(screen.getByText("Hana Lindqvist").className).toContain("truncate")
    expect(screen.getByTitle("Hana Lindqvist")).toBeTruthy()
    expect(screen.getByText("hana@example.com")).toBeTruthy()
  })

  it("stays grey without colorFrom", () => {
    const { container } = render(<PersonCell name="Hana Lindqvist" />)
    expect(fallback(container).className).toContain("bg-muted")
    expect(fallback(container).className).not.toMatch(/\bbg-person-/)
  })

  it("draws the icon instead of the initials", () => {
    const { container } = render(
      <PersonCell name="Opaline Parfums" icon={<Icon name="vendors" />} />
    )
    expect(fallback(container).querySelector("svg")).toBeTruthy()
    expect(fallback(container).textContent).toBe("")
  })

  it("hides the avatar from assistive tech, since the name is beside it", () => {
    const { container } = render(<PersonCell name="Hana Lindqvist" />)
    expect(
      container.querySelector("[data-slot=avatar]")?.getAttribute("aria-hidden")
    ).toBe("true")
  })

  it("links the name with href, and hands a plain click to onNavigate", () => {
    const onNavigate = vi.fn()
    render(
      <PersonCell
        name="Hana Lindqvist"
        href="/customers/500"
        onNavigate={onNavigate}
      />
    )
    const link = screen.getByRole("link", { name: "Hana Lindqvist" })
    expect(link.getAttribute("href")).toBe("/customers/500")

    const plain = fireEvent.click(link)
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(plain).toBe(false)

    const modified = fireEvent.click(link, { metaKey: true })
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(modified).toBe(true)
  })

  it("keeps a plain link without onNavigate", () => {
    render(<PersonCell name="Hana Lindqvist" href="/customers/500" />)
    const link = screen.getByRole("link", { name: "Hana Lindqvist" })
    expect(fireEvent.click(link)).toBe(true)
  })

  it("renders the badge after the name", () => {
    render(
      <PersonCell
        name="Mateo Rossi"
        badge={<Badge variant="secondary">Guest</Badge>}
      />
    )
    const name = screen.getByText("Mateo Rossi")
    const badge = screen.getByText("Guest")
    expect(
      name.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("shows the placeholder when there is no name", () => {
    const { container, rerender } = render(<PersonCell name="" />)
    expect(container.textContent).toBe("—")
    expect(container.querySelector("[data-slot=avatar]")).toBeNull()

    rerender(<PersonCell name="  " placeholder="No customer" />)
    expect(container.textContent).toBe("No customer")
  })

  it("passes the size to the avatar", () => {
    const { container } = render(<PersonCell name="Hana Lindqvist" size="lg" />)
    expect(
      container.querySelector("[data-slot=avatar]")?.getAttribute("data-size")
    ).toBe("lg")
  })
})

describe("personInitials, beyond plain letters", () => {
  it("keeps a flag, a family emoji and an accent typed as two characters whole", () => {
    expect(personInitials("🇧🇩 Deshi Store")).toBe("🇧🇩D")
    expect(personInitials("👨‍👩‍👧 Family")).toBe("👨‍👩‍👧F")
    expect(personInitials("émile Zola")).toBe("ÉZ")
  })

  it("skips leading punctuation, and gives nothing for a name without letters", () => {
    expect(personInitials("(Guest) Bob")).toBe("GB")
    expect(personInitials("@")).toBe("")
  })
})

describe("PersonCell, more", () => {
  it("shows the placeholder for a missing name", () => {
    const { container, rerender } = render(<PersonCell name={null} />)
    expect(container.textContent).toBe("—")
    rerender(<PersonCell />)
    expect(container.textContent).toBe("—")
  })

  it("puts the full name on the name, not on the badge", () => {
    render(
      <PersonCell
        name="Mateo Rossi"
        badge={<Badge variant="secondary">Guest</Badge>}
      />
    )
    expect(screen.getByText("Mateo Rossi").getAttribute("title")).toBe(
      "Mateo Rossi"
    )
    expect(screen.getByText("Guest").closest("[title]")).toBeNull()
  })

  it("leaves ctrl, shift and alt clicks and other buttons to the browser", () => {
    const onNavigate = vi.fn()
    render(
      <PersonCell
        name="Hana Lindqvist"
        href="/customers/500"
        onNavigate={onNavigate}
      />
    )
    const link = screen.getByRole("link", { name: "Hana Lindqvist" })
    link.addEventListener("click", (event) => event.preventDefault())
    for (const modifier of [
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ])
      fireEvent.click(link, modifier)
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
