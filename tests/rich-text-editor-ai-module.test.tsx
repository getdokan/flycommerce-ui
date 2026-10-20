import * as React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { RichTextEditorAiAction } from "@/index"

const AI_ASSISTANT = "@/components/rich-text-editor/ai-assistant"

const freshRichTextEditor = async () =>
  (await import("@/components/rich-text-editor")).RichTextEditor

const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)))

const actions: RichTextEditorAiAction[] = [
  {
    id: "paraphrase",
    label: "Paraphrase",
    run: async () => "<p>Gentle cotton tee.</p>",
  },
]

class Boundary extends React.Component<
  { onError: (error: unknown) => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

afterEach(() => {
  vi.doUnmock(AI_ASSISTANT)
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("RichTextEditor AI Assistant module", () => {
  it("never imports it for an editor without aiActions", async () => {
    const factory = vi.fn(() => ({}))
    vi.doMock(AI_ASSISTANT, factory)
    const RichTextEditor = await freshRichTextEditor()

    render(
      <RichTextEditor
        aria-label="Description"
        value="<p>Soft cotton tee.</p>"
        onGenerate={async (html) => html}
      />
    )
    await settle()

    expect(factory).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "AI Assistant" })).toBeNull()
  })

  it("holds the AI Assistant button's place, disabled, until the module loads", async () => {
    let finish!: () => void
    const loaded = new Promise<void>((resolve) => {
      finish = resolve
    })
    const factory = vi.fn(async (importOriginal: () => Promise<unknown>) => {
      await loaded
      return importOriginal()
    })
    vi.doMock(AI_ASSISTANT, factory)
    const RichTextEditor = await freshRichTextEditor()
    const user = userEvent.setup()

    render(
      <RichTextEditor
        aria-label="Description"
        value="<p>Soft cotton tee.</p>"
        aiActions={actions}
      />
    )
    await settle()

    expect(factory).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "AI Assistant" })).toHaveProperty(
      "disabled",
      true
    )

    await act(async () => finish())
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "AI Assistant" })
      ).toHaveProperty("disabled", false)
    )
    await user.click(screen.getByRole("button", { name: "AI Assistant" }))
    expect(
      await screen.findByRole("menuitem", { name: "Paraphrase" })
    ).toBeTruthy()
  })

  it("keeps the editor, without the AI Assistant, when the import fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.doMock(AI_ASSISTANT, () => {
      throw new TypeError("Failed to fetch dynamically imported module")
    })
    const RichTextEditor = await freshRichTextEditor()
    const onError = vi.fn()

    const { container } = render(
      <Boundary onError={onError}>
        <RichTextEditor
          aria-label="Description"
          value="<p>Soft cotton tee.</p>"
          aiActions={actions}
        />
      </Boundary>
    )
    await settle()

    expect(onError).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "AI Assistant" })).toBeNull()
    expect(
      container.querySelector(".ProseMirror")?.getAttribute("contenteditable")
    ).toBe("true")
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
