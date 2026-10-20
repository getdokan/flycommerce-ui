import { undoDepth } from "@codemirror/commands"
import { language as languageFacet } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const PACKS = {
  html: "@codemirror/lang-html",
  css: "@codemirror/lang-css",
  javascript: "@codemirror/lang-javascript",
  json: "@codemirror/lang-json",
} as const

type Pack = keyof typeof PACKS

const freshCodeEditor = async () =>
  (await import("@/components/ui/code-editor")).CodeEditor

const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)))

const view = () =>
  EditorView.findFromDOM(screen.getByRole("textbox", { name: "Code" }))!
const activeLanguage = () => view().state.facet(languageFacet)?.name ?? "text"

function trackImports() {
  const imported: Pack[] = []
  for (const name of Object.keys(PACKS) as Pack[])
    vi.doMock(PACKS[name], async (importOriginal) => {
      imported.push(name)
      return importOriginal()
    })
  return imported
}

function holdBack(name: Pack) {
  let release!: () => void
  const released = new Promise<void>((resolve) => {
    release = resolve
  })
  vi.doMock(PACKS[name], async (importOriginal) => {
    await released
    return importOriginal()
  })
  return release
}

afterEach(() => {
  for (const pack of Object.values(PACKS)) vi.doUnmock(pack)
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("CodeEditor language packs", () => {
  it("imports only the active language's pack, and none for plain text", async () => {
    const imported = trackImports()
    const CodeEditor = await freshCodeEditor()

    const { rerender } = render(<CodeEditor aria-label="Code" />)
    await settle()
    expect(imported).toEqual([])
    expect(activeLanguage()).toBe("text")

    rerender(<CodeEditor aria-label="Code" language="json" />)
    await settle()
    expect(imported).toEqual(["json"])
    expect(activeLanguage()).toBe("json")

    rerender(<CodeEditor aria-label="Code" language="html" />)
    await settle()
    expect(imported).toEqual(["json", "html"])
    expect(activeLanguage()).toBe("html")
  })

  it("can be typed in before its pack arrives, and keeps the text, cursor and history when it does", async () => {
    const release = holdBack("html")
    const CodeEditor = await freshCodeEditor()
    const onValueChange = vi.fn()

    render(
      <CodeEditor
        aria-label="Code"
        language="html"
        defaultValue="<p></p>"
        onValueChange={onValueChange}
      />
    )
    await settle()
    expect(activeLanguage()).toBe("text")

    act(() => view().dispatch({ selection: { anchor: 3 } }))
    act(() =>
      view().dispatch(view().state.replaceSelection("Hi"), {
        userEvent: "input.type",
      })
    )
    expect(onValueChange).toHaveBeenLastCalledWith("<p>Hi</p>")

    release()
    await settle()
    expect(activeLanguage()).toBe("html")
    expect(view().state.doc.toString()).toBe("<p>Hi</p>")
    expect(view().state.selection.main.head).toBe(5)
    expect(undoDepth(view().state)).toBe(1)
  })

  it("follows language changes, and a pack that arrives late never replaces a newer language", async () => {
    const release = holdBack("html")
    const CodeEditor = await freshCodeEditor()

    const { rerender } = render(
      <CodeEditor aria-label="Code" language="html" />
    )
    await settle()
    expect(activeLanguage()).toBe("text")

    rerender(<CodeEditor aria-label="Code" language="css" />)
    await settle()
    expect(activeLanguage()).toBe("css")

    release()
    await settle()
    expect(activeLanguage()).toBe("css")

    rerender(<CodeEditor aria-label="Code" language="text" />)
    expect(activeLanguage()).toBe("text")

    rerender(<CodeEditor aria-label="Code" language="html" />)
    expect(activeLanguage()).toBe("html")
  })

  it("keeps working as plain text, with one warning, when a pack fails to load", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.doMock(PACKS.css, () => {
      throw new TypeError("Failed to fetch dynamically imported module")
    })
    const CodeEditor = await freshCodeEditor()
    const onValueChange = vi.fn()

    const { unmount } = render(
      <CodeEditor
        aria-label="Code"
        language="css"
        defaultValue="a {}"
        onValueChange={onValueChange}
      />
    )
    await settle()
    expect(activeLanguage()).toBe("text")
    act(() =>
      view().dispatch(view().state.replaceSelection("b "), {
        userEvent: "input.type",
      })
    )
    expect(onValueChange).toHaveBeenLastCalledWith("b a {}")

    unmount()
    render(<CodeEditor aria-label="Code" language="css" />)
    await settle()
    expect(activeLanguage()).toBe("text")
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
