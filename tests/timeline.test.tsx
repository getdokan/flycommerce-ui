import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/index"

const slot = (element: Element | null) => element?.getAttribute("data-slot")

function renderSteps() {
  return render(
    <Timeline>
      <TimelineItem tone="primary">
        <TimelineHeader>
          <TimelineTitle>Reminder sent</TimelineTitle>
          <TimelineTime dateTime="2026-10-11T09:00">
            Oct 11, 9:00 AM
          </TimelineTime>
        </TimelineHeader>
        <TimelineDescription>keira@example.com</TimelineDescription>
      </TimelineItem>
      <TimelineItem upcoming>
        <TimelineTitle>Second reminder due</TimelineTitle>
      </TimelineItem>
    </Timeline>
  )
}

describe("Timeline", () => {
  it("is an ordered list with one item per event", () => {
    renderSteps()
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("OL")
    expect(list.getAttribute("role")).toBe("list")
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
  })

  it("keeps the marker out of the accessibility tree and the text in reading order", () => {
    renderSteps()
    const [first] = screen.getAllByRole("listitem")
    const [marker, body] = first.children
    expect(slot(marker)).toBe("timeline-marker")
    expect(marker.getAttribute("aria-hidden")).toBe("true")
    expect(slot(body)).toBe("timeline-body")
    expect(body.textContent).toBe(
      "Reminder sentOct 11, 9:00 AMkeira@example.com"
    )
  })

  it("puts the time in a time element with its machine-readable moment", () => {
    renderSteps()
    const time = screen.getByText("Oct 11, 9:00 AM")
    expect(time.tagName).toBe("TIME")
    expect(time.getAttribute("datetime")).toBe("2026-10-11T09:00")
  })

  it("hides only its own connector and spacing on the last item, so nested timelines keep theirs", () => {
    renderSteps()
    const [first, last] = screen.getAllByRole("listitem")
    for (const item of [first, last]) {
      expect(
        item.querySelector(
          ":scope > [data-slot=timeline-marker] > [data-slot=timeline-connector]"
        )
      ).not.toBeNull()
      expect(item.className).toContain(
        "[&:last-child>[data-slot=timeline-marker]>[data-slot=timeline-connector]]:hidden"
      )
    }
  })

  it("reads a step still to come as upcoming, and mutes only its own title", () => {
    render(
      <Timeline>
        <TimelineItem upcoming upcomingLabel="Coming up">
          <TimelineTitle>Delivery</TimelineTitle>
          <Timeline>
            <TimelineItem>
              <TimelineTitle>Out for delivery</TimelineTitle>
            </TimelineItem>
          </Timeline>
        </TimelineItem>
      </Timeline>
    )
    const outer = screen.getByText("Delivery")
    const nested = screen.getByText("Out for delivery")
    expect(
      outer.closest("[data-slot=timeline-body]")?.firstElementChild?.textContent
    ).toBe("Coming up: ")
    expect(outer.className).toContain("text-foreground-secondary")
    expect(nested.className).toContain("text-foreground")
    expect(nested.className).not.toContain("text-foreground-secondary")
  })

  it("draws an upcoming step's dot hollow and dashed, whatever its tone", () => {
    render(
      <Timeline>
        <TimelineItem tone="success">
          <TimelineTitle>Paid</TimelineTitle>
        </TimelineItem>
        <TimelineItem tone="success" upcoming>
          <TimelineTitle>Refund due</TimelineTitle>
        </TimelineItem>
      </Timeline>
    )
    const dotOf = (title: string) =>
      screen
        .getByText(title)
        .closest("li")
        ?.querySelector("[data-slot=timeline-marker] > span")?.className ?? ""
    expect(dotOf("Paid")).toContain("bg-success")
    expect(dotOf("Refund due")).toContain("border-dashed")
    expect(dotOf("Refund due")).not.toContain("bg-success")
  })

  it("keeps the upcoming label for screen readers inside its item", () => {
    render(
      <Timeline>
        <TimelineItem upcoming>
          <TimelineTitle>Refund due</TimelineTitle>
        </TimelineItem>
      </Timeline>
    )
    const label = screen.getByText("Upcoming:", { exact: false })
    expect(label.className).toContain("sr-only")
    expect(label.parentElement?.className).toMatch(/\brelative\b/)
  })

  it("marks the tone and a step still to come on the item", () => {
    renderSteps()
    const [sent, due] = screen.getAllByRole("listitem")
    expect(sent.dataset.tone).toBe("primary")
    expect(sent.dataset.upcoming).toBeUndefined()
    expect(due.dataset.tone).toBe("default")
    expect(due.dataset.upcoming).toBe("true")
  })

  it("shows an icon in place of the dot when given one", () => {
    render(
      <Timeline>
        <TimelineItem tone="success" icon={<svg data-testid="icon" />}>
          <TimelineTitle>Payment captured</TimelineTitle>
        </TimelineItem>
      </Timeline>
    )
    const marker = screen.getByRole("listitem").firstElementChild
    const chip = marker?.firstElementChild
    expect(slot(chip ?? null)).toBe("icon-chip")
    expect(chip?.contains(screen.getByTestId("icon"))).toBe(true)
    // The body steps down to the icon's centre line.
    expect(marker?.nextElementSibling?.className).toContain("pt-1")
  })

  // Review pass 2: each case below failed before its fix.
  it("hides the connector of the last item only, never of a nested timeline's items", () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineTitle>Ordered</TimelineTitle>
        </TimelineItem>
        <TimelineItem>
          <TimelineTitle>Shipped</TimelineTitle>
          <Timeline>
            <TimelineItem>
              <TimelineTitle>Picked up</TimelineTitle>
            </TimelineItem>
            <TimelineItem>
              <TimelineTitle>Out for delivery</TimelineTitle>
            </TimelineItem>
          </Timeline>
        </TimelineItem>
      </Timeline>
    )
    // The selector the item's last-child rule compiles to, checked with real CSS matching.
    const hidden =
      "[data-slot=timeline-item]:last-child > [data-slot=timeline-marker] > [data-slot=timeline-connector]"
    const connectorOf = (title: string) =>
      screen
        .getByText(title)
        .closest("li")
        ?.querySelector(
          ":scope > [data-slot=timeline-marker] > [data-slot=timeline-connector]"
        ) as Element
    expect(connectorOf("Ordered").matches(hidden)).toBe(false)
    expect(connectorOf("Shipped").matches(hidden)).toBe(true)
    expect(connectorOf("Picked up").matches(hidden)).toBe(false)
    expect(connectorOf("Out for delivery").matches(hidden)).toBe(true)
    expect(screen.getByText("Shipped").closest("li")?.className).toContain(
      "[&:last-child>[data-slot=timeline-marker]>[data-slot=timeline-connector]]:hidden"
    )
  })

  it("uses a time element only when there is a moment to give it", () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineHeader>
            <TimelineTitle>Note</TimelineTitle>
            <TimelineTime>Just now</TimelineTime>
          </TimelineHeader>
        </TimelineItem>
      </Timeline>
    )
    expect(screen.getByText("Just now").tagName).toBe("SPAN")
  })

  it("lets long titles and descriptions wrap instead of overflowing", () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineTitle>
            keira.longname+abandoned-cart@example-store.com
          </TimelineTitle>
          <TimelineDescription>
            a-very-long-unbroken-tracking-reference
          </TimelineDescription>
        </TimelineItem>
      </Timeline>
    )
    for (const text of [
      "keira.longname+abandoned-cart@example-store.com",
      "a-very-long-unbroken-tracking-reference",
    ]) {
      expect(screen.getByText(text).className).toMatch(/\bmin-w-0\b/)
      expect(screen.getByText(text).className).toMatch(/\bbreak-words\b/)
    }
  })

  it("widens only its own markers, and only for its own items' icons", () => {
    // The rule the list carries, as the selector it compiles to.
    const widened =
      "[data-slot=timeline]:has(> li > [data-slot=timeline-marker] > [data-slot=icon-chip]) > li > [data-slot=timeline-marker]"
    render(
      <div>
        <Timeline data-testid="mixed">
          <TimelineItem icon={<svg />}>
            <TimelineTitle>Shipped</TimelineTitle>
            <Timeline data-testid="nested">
              <TimelineItem>
                <TimelineTitle>Picked up</TimelineTitle>
              </TimelineItem>
            </Timeline>
          </TimelineItem>
          <TimelineItem>
            <TimelineTitle>Note</TimelineTitle>
          </TimelineItem>
        </Timeline>
        <Timeline data-testid="dots">
          <TimelineItem>
            <TimelineTitle>Dot only</TimelineTitle>
            <TimelineDescription>
              <span data-slot="icon-chip" />
            </TimelineDescription>
          </TimelineItem>
        </Timeline>
      </div>
    )
    const markerOf = (title: string) =>
      screen
        .getByText(title)
        .closest("li")
        ?.querySelector(":scope > [data-slot=timeline-marker]") as Element
    expect(screen.getByTestId("mixed").className).toContain(
      "has-[>li>[data-slot=timeline-marker]>[data-slot=icon-chip]]:[&>li>[data-slot=timeline-marker]]:w-7"
    )
    expect(markerOf("Shipped").matches(widened)).toBe(true)
    expect(markerOf("Note").matches(widened)).toBe(true)
    expect(markerOf("Picked up").matches(widened)).toBe(false)
    expect(markerOf("Dot only").matches(widened)).toBe(false)
  })
})
