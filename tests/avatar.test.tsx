import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback } from "@/index"

const fallback = (colorFrom?: string | number) => {
  const { container } = render(
    <Avatar>
      <AvatarFallback colorFrom={colorFrom}>DW</AvatarFallback>
    </Avatar>
  )
  return container.querySelector("[data-slot=avatar-fallback]") as HTMLElement
}

const personClass = (element: HTMLElement) =>
  element.className.match(/\bbg-person-[1-8]\b/)?.[0]

describe("AvatarFallback colorFrom", () => {
  it("keeps the grey fallback without it", () => {
    const element = fallback()
    expect(element.className).toContain("bg-muted")
    expect(personClass(element)).toBeUndefined()
  })

  it("gives the same person the same colour every time, with light initials", () => {
    const first = fallback("dana@example.com")
    const again = fallback("dana@example.com")
    expect(personClass(first)).toBeDefined()
    expect(personClass(again)).toBe(personClass(first))
    expect(first.className).toContain("text-on-dark")
    expect(first.className).not.toContain("bg-muted")
  })

  it("spreads different people across the eight colours", () => {
    const used = new Set(
      Array.from({ length: 64 }, (_, i) =>
        personClass(fallback(`shopper-${i}@example.com`))
      )
    )
    expect(used.size).toBe(8)
  })

  it("doesn't give reversed keys the same colour by construction", () => {
    const pairs = Array.from({ length: 60 }, (_, i) => String(120 + i * 7))
    const same = pairs.filter(
      (key) =>
        personClass(fallback(key)) ===
        personClass(fallback([...key].reverse().join("")))
    ).length
    // A fair pick matches about one pair in eight; a weak hash matches them all.
    expect(same).toBeLessThan(20)
  })

  it("takes a numeric id as the same key as its string", () => {
    expect(personClass(fallback(482))).toBe(personClass(fallback("482")))
  })

  it("stays grey for an empty key, and changes only the colour, not the weight", () => {
    expect(personClass(fallback(""))).toBeUndefined()
    expect(fallback("dana@example.com").className).not.toContain("font-medium")
  })
})

describe("Avatar sizes", () => {
  it("adds xl (48px) and 2xl (64px) for profile headers, with initials to match", () => {
    for (const [size, box, text] of [
      ["xl", "data-[size=xl]:size-12", "group-data-[size=xl]/avatar:text-base"],
      [
        "2xl",
        "data-[size=2xl]:size-16",
        "group-data-[size=2xl]/avatar:text-xl",
      ],
    ] as const) {
      const { container, unmount } = render(
        <Avatar size={size}>
          <AvatarFallback>DW</AvatarFallback>
        </Avatar>
      )
      const avatar = container.querySelector(
        "[data-slot=avatar]"
      ) as HTMLElement
      expect(avatar.dataset.size).toBe(size)
      expect(avatar.className).toContain(box)
      expect(
        container.querySelector("[data-slot=avatar-fallback]")?.className
      ).toContain(text)
      unmount()
    }
  })
})
