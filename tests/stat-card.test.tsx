import { render, screen, within } from "@testing-library/react"
import axe from "axe-core"
import { describe, expect, it } from "vitest"

import {
  Progress,
  StatCard,
  StatGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/index"

const card = (label: string) => {
  const element = screen.getByText(label).closest("[data-slot=stat-card]")
  if (!element) throw new Error(`no stat card labelled ${label}`)
  return element as HTMLElement
}

const part = (element: HTMLElement, name: string) =>
  element.querySelector<HTMLElement>(`[data-slot=stat-card-${name}]`)

const comesBefore = (a: Node | null, b: Node | null) =>
  Boolean(
    a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
  )

describe("StatCard", () => {
  it("puts the value first by default", () => {
    render(<StatCard label="Orders" value="280" hero />)
    const element = card("Orders")
    expect(element.getAttribute("data-layout")).toBe("value-first")
    expect(element.hasAttribute("data-hero")).toBe(true)
    expect(comesBefore(part(element, "value"), part(element, "label"))).toBe(
      true
    )
  })

  it("puts the label first with layout label-first, where hero has no effect", () => {
    render(
      <StatCard layout="label-first" hero label="Extra orders" value="12" />
    )
    const element = card("Extra orders")
    expect(element.getAttribute("data-layout")).toBe("label-first")
    expect(element.hasAttribute("data-hero")).toBe(false)
    expect(comesBefore(part(element, "label"), part(element, "value"))).toBe(
      true
    )
  })

  it("keeps the action beside the label when label-first", () => {
    render(
      <StatCard
        layout="label-first"
        label="Upgrade point"
        value="1,200"
        action={
          <button type="button" aria-label="About upgrade point">
            i
          </button>
        }
      />
    )
    const element = card("Upgrade point")
    const action = within(element).getByRole("button", {
      name: "About upgrade point",
    })
    expect(action.parentElement).toBe(part(element, "label")?.parentElement)
    expect(comesBefore(action, part(element, "value"))).toBe(true)
  })

  it("renders the foot under the value, and nothing when it is not given", () => {
    render(
      <>
        <StatCard
          layout="label-first"
          label="Charge so far"
          value="$24.00"
          delta={12}
          foot="12 × $2.00"
        />
        <StatCard layout="label-first" label="Projected" value="$58.00" />
        <StatCard label="Orders" value="280" />
      </>
    )
    const element = card("Charge so far")
    const foot = part(element, "foot")
    expect(foot?.textContent).toBe("12 × $2.00")
    expect(comesBefore(part(element, "value"), foot)).toBe(true)
    expect(element.lastElementChild).toBe(foot)
    expect(part(card("Projected"), "foot")).toBeNull()
    expect(part(card("Orders"), "foot")).toBeNull()
  })

  it("takes a meter as its foot", () => {
    render(
      <StatCard
        layout="label-first"
        label="Vendors"
        value="64 of 100"
        foot={<Progress value={64} aria-label="Vendors used" />}
      />
    )
    const foot = part(card("Vendors"), "foot")
    expect(foot).not.toBeNull()
    expect(
      within(foot as HTMLElement).getByRole("progressbar", {
        name: "Vendors used",
      })
    ).toBeTruthy()
  })

  it("sets the label-first value size, which value-first ignores", () => {
    render(
      <>
        <StatCard layout="label-first" label="Extra orders" value="12" />
        <StatCard
          layout="label-first"
          valueSize="sm"
          label="Next payment"
          value="$49.00 on 15 November"
        />
        <StatCard valueSize="sm" label="Orders" value="280" />
      </>
    )
    expect(card("Extra orders").getAttribute("data-value-size")).toBe("default")
    expect(card("Next payment").getAttribute("data-value-size")).toBe("sm")
    expect(card("Orders").hasAttribute("data-value-size")).toBe(false)
  })

  it("is not a list item outside a group", () => {
    render(<StatCard label="Orders" value="280" />)
    expect(card("Orders").getAttribute("role")).toBeNull()
    expect(screen.queryByRole("listitem")).toBeNull()
  })
})

const items = (list: HTMLElement) => {
  const found = within(list).getAllByRole("listitem")
  expect(found.every((item) => item.parentElement === list)).toBe(true)
  expect(
    found.every((item) => item.getAttribute("data-slot") === "stat-group-item")
  ).toBe(true)
  return found
}

describe("StatGroup", () => {
  it("is a named list with one item per stat card, in order", () => {
    render(
      <StatGroup aria-label="Orders this period">
        <StatCard layout="label-first" label="Extra orders" value="12" />
        <StatCard layout="label-first" label="Charge so far" value="$24.00" />
        <StatCard label="Upgrade point" value="1,200" />
      </StatGroup>
    )
    const list = screen.getByRole("list", { name: "Orders this period" })
    expect(list.getAttribute("data-slot")).toBe("stat-group")
    expect(list.hasAttribute("data-flush")).toBe(false)

    const cards = items(list).map((item) => {
      expect(item.children).toHaveLength(1)
      return item.firstElementChild as HTMLElement
    })
    expect(cards.map((element) => element.getAttribute("data-slot"))).toEqual(
      ["stat-card", "stat-card", "stat-card"]
    )
    expect(cards.map((element) => element.getAttribute("role"))).toEqual([
      null,
      null,
      null,
    ])
    expect(cards.map((element) => part(element, "label")?.textContent)).toEqual(
      ["Extra orders", "Charge so far", "Upgrade point"]
    )
    expect(cards.map((element) => element.getAttribute("data-layout"))).toEqual(
      ["label-first", "label-first", "value-first"]
    )
  })

  it("keeps a card wrapped in a link or a tooltip trigger a list item", async () => {
    render(
      <TooltipProvider>
        <StatGroup aria-label="Orders this period">
          <a href="#orders">
            <StatCard layout="label-first" label="Extra orders" value="12" />
          </a>
          <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0}>
                <StatCard
                  layout="label-first"
                  label="Charge so far"
                  value="$24.00"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>12 extra orders at $2.00</TooltipContent>
          </Tooltip>
        </StatGroup>
      </TooltipProvider>
    )
    const list = screen.getByRole("list", { name: "Orders this period" })
    const [linked, tooltipped] = items(list)
    expect(
      within(linked).getByRole("link").contains(card("Extra orders"))
    ).toBe(true)
    expect(tooltipped.contains(card("Charge so far"))).toBe(true)
    expect(card("Extra orders").getAttribute("role")).toBeNull()
    expect(card("Charge so far").getAttribute("role")).toBeNull()

    const results = await axe.run(list)
    expect(results.violations.map((violation) => violation.id)).toEqual([])
  })

  it("makes a child that is not a stat card a list item too", () => {
    render(
      <StatGroup aria-label="Orders this period">
        <StatCard layout="label-first" label="Extra orders" value="12" />
        <p>Counts refresh every hour</p>
      </StatGroup>
    )
    const list = screen.getByRole("list", { name: "Orders this period" })
    expect(items(list).map((item) => item.textContent)).toEqual([
      "Extra orders12",
      "Counts refresh every hour",
    ])
  })

  it("adds no item for a child that renders nothing", () => {
    const showProjected = false
    render(
      <StatGroup aria-label="Orders this period">
        <StatCard layout="label-first" label="Extra orders" value="12" />
        {showProjected && (
          <StatCard layout="label-first" label="Projected" value="$58.00" />
        )}
        {null}
        <StatCard layout="label-first" label="Charge so far" value="$24.00" />
      </StatGroup>
    )
    const list = screen.getByRole("list", { name: "Orders this period" })
    expect(list.children).toHaveLength(2)
    expect(items(list).map((item) => part(item, "label")?.textContent)).toEqual(
      ["Extra orders", "Charge so far"]
    )
  })

  it("can be named by a visible title", () => {
    render(
      <>
        <h2 id="key-figures">Key figures</h2>
        <StatGroup flush aria-labelledby="key-figures">
          <StatCard layout="label-first" label="Recovery rate" value="18.4%" />
        </StatGroup>
      </>
    )
    const list = screen.getByRole("list", { name: "Key figures" })
    expect(list.getAttribute("data-flush")).toBe("true")
    expect(within(list).getByRole("listitem")).toBe(
      card("Recovery rate").parentElement
    )
  })
})
