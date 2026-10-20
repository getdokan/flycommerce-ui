import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ActivityFeed, type ActivityFeedEntry } from "@/index"

const ENTRIES: ActivityFeedEntry[] = [
  {
    id: "note",
    title: "Note from Dana",
    time: "Oct 15, 9:12 AM",
    dateTime: "2026-10-15T09:12",
    description: "Customer asked\nto hold the parcel.",
    note: true,
  },
  {
    id: "shipped",
    title: "Shipped",
    time: "Oct 15, 3:18 PM",
    description: "DHL Express",
    tone: "primary",
  },
  { id: "placed", title: "Order placed", time: "Oct 14, 10:02 AM" },
]

const count = () =>
  document.querySelector("[data-slot=textarea-count]") as HTMLElement
const overStatus = () =>
  document.querySelector("[data-slot=textarea-count-status]") as HTMLElement
const textbox = () => screen.getByRole("textbox") as HTMLTextAreaElement
const button = (name: string) =>
  screen.getByRole("button", { name }) as HTMLButtonElement

describe("ActivityFeed", () => {
  it("lists the entries in the order given, under its title", () => {
    render(<ActivityFeed entries={ENTRIES} description="Newest first." />)
    expect(screen.getByText("Activity")).toBeTruthy()
    expect(screen.getByText("Newest first.")).toBeTruthy()
    expect(
      screen
        .getAllByRole("listitem")
        .map(
          (item) =>
            item.querySelector("[data-slot=timeline-title]")?.textContent
        )
    ).toEqual(["Note from Dana", "Shipped", "Order placed"])
  })

  it("puts a note in its own box, keeping its line breaks, and marks it primary by default", () => {
    render(<ActivityFeed entries={ENTRIES} />)
    const note = screen.getByText(/Customer asked/)
    expect(note.dataset.note).toBe("true")
    expect(note.className).toContain("whitespace-pre-wrap")
    expect(note.closest("li")?.dataset.tone).toBe("primary")
    expect(screen.getByText("DHL Express").dataset.note).toBeUndefined()
  })

  it("shows no note box unless the app can take notes", () => {
    render(<ActivityFeed entries={ENTRIES} />)
    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it("says so when there is nothing yet", () => {
    render(<ActivityFeed entries={[]} labels={{ empty: "Nothing here" }} />)
    expect(screen.getByText("Nothing here")).toBeTruthy()
    expect(screen.queryByRole("list")).toBeNull()
  })

  it("adds a trimmed note, then clears the box", async () => {
    const onAddNote = vi.fn().mockResolvedValue(undefined)
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)
    expect(screen.getByRole("textbox", { name: "Add a note" })).toBeTruthy()

    await userEvent.type(textbox(), "  Called the customer  ")
    expect(count().textContent).toBe("23 / 500")
    await userEvent.click(button("Add note"))

    expect(onAddNote).toHaveBeenCalledWith("Called the customer")
    await waitFor(() => expect(textbox().value).toBe(""))
  })

  it("asks for text before adding an empty note", async () => {
    const onAddNote = vi.fn()
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "   ")
    await userEvent.click(button("Add note"))

    expect(onAddNote).not.toHaveBeenCalled()
    expect(screen.getByRole("alert").textContent).toBe("Write a note first.")
    expect(textbox().getAttribute("aria-invalid")).toBe("true")
  })

  it("refuses a note over the limit, and flags the count before sending", async () => {
    const onAddNote = vi.fn()
    render(
      <ActivityFeed entries={ENTRIES} onAddNote={onAddNote} noteMaxLength={5} />
    )

    await userEvent.type(textbox(), "too long")
    expect(count().dataset.over).toBe("true")
    await userEvent.click(button("Add note"))

    expect(onAddNote).not.toHaveBeenCalled()
    expect(screen.getByRole("alert").textContent).toBe(
      "Keep notes to 5 characters or fewer."
    )
  })

  it("keeps the text when adding fails, so nothing typed is lost", async () => {
    const onAddNote = vi.fn().mockRejectedValue(new Error("offline"))
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "Refund approved")
    await userEvent.click(button("Add note"))

    expect(onAddNote).toHaveBeenCalledOnce()
    await waitFor(() => expect(button("Add note").disabled).toBe(false))
    expect(textbox().value).toBe("Refund approved")
    expect(screen.getByRole("alert").textContent).toBe(
      "The note couldn't be added. Try again."
    )
  })

  it("turns the note box off when disabled, and takes translated labels", () => {
    render(
      <ActivityFeed
        entries={ENTRIES}
        onAddNote={vi.fn()}
        disabled
        labels={{
          title: "Aktivität",
          noteLabel: "Notiz",
          addNote: "Hinzufügen",
        }}
      />
    )
    expect(screen.getByText("Aktivität")).toBeTruthy()
    expect(
      (screen.getByRole("textbox", { name: "Notiz" }) as HTMLTextAreaElement)
        .disabled
    ).toBe(true)
    expect(button("Hinzufügen").disabled).toBe(true)
  })

  // Review pass 2: each case below failed before its fix.
  it("keeps text typed while a note is being sent", async () => {
    let finish: () => void = () => {}
    const onAddNote = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve))
    )
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "Refund approved")
    await userEvent.click(button("Add note"))
    await userEvent.type(textbox(), ", called customer")
    finish()

    await waitFor(() => expect(button("Add note").disabled).toBe(false))
    expect(textbox().value).toBe("Refund approved, called customer")
  })

  it("measures the limit the same way in the count and when adding", async () => {
    const onAddNote = vi.fn()
    render(
      <ActivityFeed entries={ENTRIES} onAddNote={onAddNote} noteMaxLength={5} />
    )
    await userEvent.type(textbox(), "  hello  ")
    expect(count().dataset.over).toBe("true")
    await userEvent.click(button("Add note"))
    expect(onAddNote).not.toHaveBeenCalled()
  })

  it("titles the feed with a heading that also names its list, at the level the page needs", () => {
    const { unmount } = render(<ActivityFeed entries={ENTRIES} />)
    expect(
      screen.getByRole("heading", { level: 2, name: "Activity" })
    ).toBeTruthy()
    expect(screen.getByRole("list", { name: "Activity" })).toBeTruthy()
    unmount()

    render(<ActivityFeed entries={ENTRIES} headingLevel={3} />)
    expect(
      screen.getByRole("heading", { level: 3, name: "Activity" })
    ).toBeTruthy()
  })

  it("keeps the built-in count left-to-right, but leaves a translated count to its language", () => {
    const { unmount } = render(
      <ActivityFeed entries={ENTRIES} onAddNote={vi.fn()} />
    )
    expect(screen.getByText("0 / 500").getAttribute("dir")).toBe("ltr")
    unmount()

    render(
      <ActivityFeed
        entries={ENTRIES}
        onAddNote={vi.fn()}
        labels={{ noteCount: (count, max) => `${count} من ${max}` }}
      />
    )
    expect(screen.getByText("0 من 500").getAttribute("dir")).toBeNull()
  })

  it("announces going over the limit once, not every keystroke", async () => {
    render(
      <ActivityFeed entries={ENTRIES} onAddNote={vi.fn()} noteMaxLength={5} />
    )
    expect(count().getAttribute("aria-live")).toBeNull()
    expect(overStatus().getAttribute("aria-live")).toBe("polite")

    await userEvent.type(textbox(), "abc")
    expect(overStatus().textContent).toBe("")
    await userEvent.type(textbox(), "defg")
    expect(overStatus().textContent?.trim()).toBe(
      "Keep notes to 5 characters or fewer."
    )
  })

  it("keeps its screen-reader-only label inside the component", () => {
    render(<ActivityFeed entries={ENTRIES} onAddNote={vi.fn()} />)
    const label = screen.getByText("Add a note", { selector: "label" })
    expect(label.parentElement?.className).toMatch(/\brelative\b/)
  })

  it("renders a description of 0 as text inside its slot, and nothing for an empty one", () => {
    render(
      <ActivityFeed
        entries={[
          { id: "a", title: "Refunded", time: "Today", description: 0 },
          { id: "b", title: "Viewed", time: "Today", description: null },
        ]}
      />
    )
    const [refunded, viewed] = screen.getAllByRole("listitem")
    expect(
      refunded.querySelector("[data-slot=timeline-description]")?.textContent
    ).toBe("0")
    expect(viewed.querySelector("[data-slot=timeline-description]")).toBeNull()
  })

  it("clears a failed save's error once a retry succeeds", async () => {
    const onAddNote = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined)
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "Hi")
    await userEvent.click(button("Add note"))
    await waitFor(() => expect(screen.queryByRole("alert")).toBeTruthy())
    await userEvent.click(button("Add note"))

    await waitFor(() => expect(textbox().value).toBe(""))
    expect(screen.queryByRole("alert")).toBeNull()
    expect(textbox().getAttribute("aria-invalid")).toBeNull()
  })

  it("doesn't call the text invalid when only the save failed", async () => {
    const onAddNote = vi.fn().mockRejectedValue(new Error("offline"))
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "Refund approved")
    await userEvent.click(button("Add note"))

    await waitFor(() => expect(screen.queryByRole("alert")).toBeTruthy())
    expect(textbox().getAttribute("aria-invalid")).toBeNull()
    expect(
      textbox().closest("[data-slot=field]")?.getAttribute("data-invalid")
    ).toBeNull()
  })

  it("marks the text invalid again for a validation error after a failed save", async () => {
    const onAddNote = vi.fn().mockRejectedValue(new Error("offline"))
    render(<ActivityFeed entries={ENTRIES} onAddNote={onAddNote} />)

    await userEvent.type(textbox(), "Hi")
    await userEvent.click(button("Add note"))
    await waitFor(() => expect(screen.queryByRole("alert")).toBeTruthy())
    expect(textbox().getAttribute("aria-invalid")).toBeNull()

    await userEvent.clear(textbox())
    await userEvent.click(button("Add note"))
    expect(screen.getByRole("alert").textContent).toBe("Write a note first.")
    expect(textbox().getAttribute("aria-invalid")).toBe("true")
  })
})
