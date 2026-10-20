import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { describe, expect, it, vi } from "vitest"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  RichTextEditor,
  type RichTextEditorAiAction,
} from "@/index"

document.elementFromPoint ??= () => null

type Run = RichTextEditorAiAction["run"]

async function writingArea(container: HTMLElement) {
  await waitFor(() =>
    expect(container.querySelector(".ProseMirror")).toBeTruthy()
  )
  return container.querySelector<HTMLElement>(".ProseMirror")!
}

async function pick(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: "AI Assistant" }))
  await user.click(await screen.findByRole("menuitem", { name: label }))
}

const suggestionPanel = () =>
  screen.queryByRole("region", { name: /^AI suggestion/ })

async function review() {
  await waitFor(() =>
    expect(suggestionPanel()?.getAttribute("data-state")).toBe("review")
  )
  return suggestionPanel()!
}

function select(area: HTMLElement, from: number, to: number) {
  const text = area.querySelector("p")!.firstChild as Text
  act(() => {
    document.getSelection()!.setBaseAndExtent(text, from, text, to)
    document.dispatchEvent(new Event("selectionchange"))
  })
}

function deferred() {
  let resolve!: (html: string) => void
  const promise = new Promise<string>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe("RichTextEditor heading levels", () => {
  it("keeps the default levels: H2 and H3 only, other headings load as paragraphs", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <RichTextEditor
        aria-label="Policy"
        value="<h4>Returns</h4><h2>Shipping</h2>"
      />
    )
    const area = await writingArea(container)

    expect(area.querySelector("h4")).toBeNull()
    expect(area.querySelector("p")?.textContent).toBe("Returns")
    expect(area.querySelector("h2")?.textContent).toBe("Shipping")
    await user.click(screen.getByRole("combobox", { name: "Paragraph" }))
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["Paragraph", "Heading 2", "Heading 3"])
    expect(screen.queryByRole("button", { name: "AI Assistant" })).toBeNull()
  })

  it("keeps a stored H4 when headingLevels includes 4, and offers it in the toolbar", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const stored = "<h4>Returns</h4><p>Within 30 days.</p>"
    const { container } = render(
      <RichTextEditor
        aria-label="Policy"
        value={stored}
        headingLevels={[4, 1, 2, 3]}
        onChange={onChange}
      />
    )
    const area = await writingArea(container)

    expect(area.querySelector("h4")?.textContent).toBe("Returns")
    for (const [html] of onChange.mock.calls) expect(html).toBe(stored)

    const block = screen.getByRole("combobox", { name: "Paragraph" })
    expect(block.textContent).toBe("Heading 4")
    await user.click(block)
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Heading 4"])

    await user.click(screen.getByRole("option", { name: "Heading 1" }))
    expect(onChange).toHaveBeenLastCalledWith(
      "<h1>Returns</h1><p>Within 30 days.</p>"
    )
  })
})

describe("RichTextEditor AI actions", () => {
  function Editor({
    run,
    onChange,
    value = "<p>Soft cotton tee.</p><p>Machine washable.</p>",
  }: {
    run: Run
    onChange?: (html: string) => void
    value?: string
  }) {
    return (
      <RichTextEditor
        aria-label="Description"
        value={value}
        onChange={onChange}
        aiActions={[
          { id: "paraphrase", label: "Paraphrase", run },
          { id: "simplify", label: "Simplify", run },
        ]}
      />
    )
  }

  it("shows the suggestion beside the original, then Replace swaps the document", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const run = vi.fn<Run>(async () => "<p>Gentle cotton tee.</p>")
    const { container } = render(<Editor run={run} onChange={onChange} />)
    await writingArea(container)

    await pick(user, "Paraphrase")
    expect(run).toHaveBeenCalledWith(
      "<p>Soft cotton tee.</p><p>Machine washable.</p>",
      undefined,
      { signal: expect.any(AbortSignal) }
    )
    const panel = await review()
    expect(document.activeElement).toBe(panel)
    expect(
      screen.getByRole("region", { name: "AI suggestion Paraphrase" })
    ).toBe(panel)
    expect(
      panel.querySelector("[data-slot=rich-text-editor-ai-original]")
        ?.textContent
    ).toBe("OriginalSoft cotton tee.Machine washable.")
    expect(
      panel.querySelector("[data-slot=rich-text-editor-ai-suggestion]")
        ?.textContent
    ).toBe("SuggestionGentle cotton tee.")

    const calls = onChange.mock.calls.length
    await user.click(within(panel).getByRole("button", { name: "Replace" }))
    expect(onChange.mock.calls.length).toBe(calls + 1)
    expect(onChange).toHaveBeenLastCalledWith("<p>Gentle cotton tee.</p>")
    expect(suggestionPanel()).toBeNull()
  })

  it("Insert below adds the suggestion after the document", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const run = vi.fn<Run>(async () => "<p>Pairs well with linen shorts.</p>")
    const { container } = render(<Editor run={run} onChange={onChange} />)
    await writingArea(container)

    await pick(user, "Paraphrase")
    await user.click(
      within(await review()).getByRole("button", { name: "Insert below" })
    )
    expect(onChange).toHaveBeenLastCalledWith(
      "<p>Soft cotton tee.</p><p>Machine washable.</p><p>Pairs well with linen shorts.</p>"
    )
    expect(suggestionPanel()).toBeNull()
  })

  it("Discard closes the panel and leaves the content alone", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const run = vi.fn<Run>(async () => "<p>Gentle cotton tee.</p>")
    const { container } = render(<Editor run={run} onChange={onChange} />)
    const area = await writingArea(container)
    const calls = onChange.mock.calls.length

    await pick(user, "Paraphrase")
    await user.click(
      within(await review()).getByRole("button", { name: "Discard" })
    )
    expect(suggestionPanel()).toBeNull()
    expect(onChange.mock.calls.length).toBe(calls)
    expect(area.innerHTML).toBe(
      "<p>Soft cotton tee.</p><p>Machine washable.</p>"
    )
    await waitFor(() => expect(document.activeElement).toBe(area))
  })

  it("rewrites only the selected text when there is a selection", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const run = vi.fn<Run>(async (_html, selection) =>
      selection ? "<p>gentle</p>" : "<p>Whole document</p>"
    )
    const { container } = render(<Editor run={run} onChange={onChange} />)
    const area = await writingArea(container)
    await user.click(area)

    select(area, 0, 4)
    await pick(user, "Paraphrase")
    expect(run).toHaveBeenLastCalledWith(
      "<p>Soft cotton tee.</p><p>Machine washable.</p>",
      "<p>Soft</p>",
      { signal: expect.any(AbortSignal) }
    )
    const panel = await review()
    expect(
      panel.querySelector("[data-slot=rich-text-editor-ai-original]")
        ?.textContent
    ).toBe("OriginalSoft")
    await user.click(within(panel).getByRole("button", { name: "Replace" }))
    expect(onChange).toHaveBeenLastCalledWith(
      "<p>gentle cotton tee.</p><p>Machine washable.</p>"
    )

    await user.click(area)
    select(area, 0, 6)
    await pick(user, "Simplify")
    await user.click(
      within(await review()).getByRole("button", { name: "Insert below" })
    )
    expect(onChange).toHaveBeenLastCalledWith(
      "<p>gentle cotton tee.</p><p>gentle</p><p>Machine washable.</p>"
    )
  })

  it("locks the editor while an action runs, and Esc cancels it", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const pending = deferred()
    let signal: AbortSignal | undefined
    const run = vi.fn<Run>((_html, _selection, options) => {
      signal = options.signal
      return pending.promise
    })
    const { container } = render(<Editor run={run} onChange={onChange} />)
    const area = await writingArea(container)
    const calls = onChange.mock.calls.length

    await pick(user, "Paraphrase")
    const panel = suggestionPanel()!
    expect(panel.getAttribute("data-state")).toBe("busy")
    expect(within(panel).getByRole("status").textContent).toBe("Writing…")
    expect(
      container
        .querySelector("[data-slot=rich-text-editor]")
        ?.getAttribute("aria-busy")
    ).toBe("true")
    expect(area.getAttribute("contenteditable")).toBe("false")
    expect(screen.getByRole("button", { name: "AI Assistant" })).toHaveProperty(
      "disabled",
      true
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(panel).getByRole("button", { name: "Cancel" })
      )
    )

    await user.keyboard("{Escape}")
    expect(suggestionPanel()).toBeNull()
    expect(signal?.aborted).toBe(true)
    expect(area.getAttribute("contenteditable")).toBe("true")

    await act(async () => pending.resolve("<p>Too late.</p>"))
    expect(suggestionPanel()).toBeNull()
    expect(onChange.mock.calls.length).toBe(calls)
  })

  it("shows a failure inline and runs the action again on Try again", async () => {
    const user = userEvent.setup()
    const run = vi
      .fn<Run>()
      .mockRejectedValueOnce("timeout")
      .mockRejectedValueOnce(new Error("The AI service didn't respond."))
      .mockResolvedValueOnce("<p>Gentle cotton tee.</p>")
    const { container } = render(<Editor run={run} />)
    await writingArea(container)

    await pick(user, "Paraphrase")
    let alert = await screen.findByRole("alert")
    expect(alert.textContent).toContain("We couldn't get a suggestion.")
    const tryAgain = within(alert).getByRole("button", { name: "Try again" })
    expect(document.activeElement).toBe(tryAgain)

    await user.click(tryAgain)
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "The AI service didn't respond."
      )
    )
    alert = screen.getByRole("alert")
    await user.click(within(alert).getByRole("button", { name: "Try again" }))

    const panel = await review()
    expect(run).toHaveBeenCalledTimes(3)
    expect(screen.queryByRole("alert")).toBeNull()
    expect(
      panel.querySelector("[data-slot=rich-text-editor-ai-suggestion]")
        ?.textContent
    ).toBe("SuggestionGentle cotton tee.")
  })

  it("Esc discards a suggestion without closing the dialog around the editor", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const run = vi.fn<Run>(async () => "<p>Gentle cotton tee.</p>")
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Edit policy</DialogTitle>
          <DialogDescription>Shown on the product page.</DialogDescription>
          <Editor run={run} />
        </DialogContent>
      </Dialog>
    )
    await writingArea(screen.getByRole("dialog"))

    await pick(user, "Paraphrase")
    await review()
    await user.keyboard("{Escape}")
    expect(suggestionPanel()).toBeNull()
    expect(onOpenChange).not.toHaveBeenCalled()

    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("has no axe violations while busy, in review or after a failure", async () => {
    const user = userEvent.setup()
    const pending = deferred()
    const run = vi
      .fn<Run>()
      .mockReturnValueOnce(pending.promise)
      .mockRejectedValueOnce(new Error("The AI service didn't respond."))
    const { container } = render(<Editor run={run} />)
    await writingArea(container)
    const check = async () => {
      const { violations } = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      })
      expect(violations.map((violation) => violation.id)).toEqual([])
    }

    await pick(user, "Paraphrase")
    await check()
    await act(async () => pending.resolve("<p>Gentle cotton tee.</p>"))
    await review()
    await check()
    await user.click(screen.getByRole("button", { name: "Try again" }))
    await screen.findByRole("alert")
    await check()
  })

  it("keeps the text editable during review, and an edit dismisses the suggestion", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const run = vi.fn<Run>(async () => "<p>Gentle cotton tee.</p>")
    const { container } = render(<Editor run={run} onChange={onChange} />)
    const area = await writingArea(container)

    await pick(user, "Paraphrase")
    await review()
    expect(area.getAttribute("contenteditable")).toBe("true")
    await user.click(screen.getByRole("combobox", { name: "Paragraph" }))
    await user.click(screen.getByRole("option", { name: "Heading 2" }))
    expect(suggestionPanel()).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith(
      "<h2>Soft cotton tee.</h2><p>Machine washable.</p>"
    )
  })

  it("closes the suggestion when the value changes from outside", async () => {
    const user = userEvent.setup()
    const run = vi.fn<Run>(async () => "<p>Gentle cotton tee.</p>")
    const { container, rerender } = render(<Editor run={run} />)
    const area = await writingArea(container)

    await pick(user, "Paraphrase")
    await review()
    rerender(<Editor run={run} value="<p>Coton doux.</p>" />)
    expect(suggestionPanel()).toBeNull()
    expect(area.innerHTML).toBe("<p>Coton doux.</p>")
  })

  it("keeps onGenerate as a one-shot replace", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onGenerate = vi.fn(async () => "<p>Generated copy.</p>")
    const { container } = render(
      <RichTextEditor
        aria-label="Description"
        value="<p>Draft.</p>"
        onChange={onChange}
        onGenerate={onGenerate}
      />
    )
    await writingArea(container)

    await user.click(screen.getByRole("button", { name: "Generate with AI" }))
    expect(onGenerate).toHaveBeenCalledWith("<p>Draft.</p>")
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith("<p>Generated copy.</p>")
    )
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(suggestionPanel()).toBeNull()
  })
})

describe("RichTextEditor disabled", () => {
  it("locks and unlocks the writing area without calling onChange", async () => {
    const onChange = vi.fn()
    const props = {
      "aria-label": "Description",
      value: "<p>Soft <b>cotton</b> tee.</p>",
      onChange,
    }
    const { container, rerender } = render(<RichTextEditor {...props} />)
    const area = await writingArea(container)
    expect(area.getAttribute("contenteditable")).toBe("true")

    rerender(<RichTextEditor {...props} disabled />)
    expect(area.getAttribute("contenteditable")).toBe("false")
    rerender(<RichTextEditor {...props} />)
    expect(area.getAttribute("contenteditable")).toBe("true")
    expect(onChange).not.toHaveBeenCalled()
  })
})
