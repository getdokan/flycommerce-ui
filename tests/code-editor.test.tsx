import * as React from "react"
import { EditorSelection } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  CodeEditor,
  type CodeEditorHandle,
  type CodeEditorProps,
} from "@/components/ui/code-editor"
import { Field, FieldLabel } from "@/index"

const textbox = (name = "Code") => screen.getByRole("textbox", { name })
const viewOf = (name = "Code") => EditorView.findFromDOM(textbox(name))!
const lines = (name = "Code") =>
  [...textbox(name).querySelectorAll(".cm-line")].map(
    (line) => line.textContent
  )
const status = () =>
  document.querySelector<HTMLElement>('[data-slot="code-editor-status"]')!
const problemsStatus = () =>
  document.querySelector<HTMLElement>('[data-slot="code-editor-problems"]')

function typeText(insert: string, name = "Code") {
  const view = viewOf(name)
  act(() => {
    view.dispatch(view.state.replaceSelection(insert), {
      userEvent: "input.type",
    })
  })
}

function moveCursor(anchor: number, head = anchor) {
  const view = viewOf()
  act(() => {
    view.dispatch({ selection: EditorSelection.single(anchor, head) })
  })
}

const key = (name: string, keyCode: number, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(textbox(), { key: name, code: name, keyCode, ...init })

function Editor(props: CodeEditorProps) {
  return <CodeEditor aria-label="Code" {...props} />
}

let errors: unknown[][]
beforeEach(() => {
  errors = []
  vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args)
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  expect(errors.map((args) => args.map(String).join(" "))).toEqual([])
})

describe("CodeEditor", () => {
  it("shows the value and reports edits through onValueChange", () => {
    const onValueChange = vi.fn()
    render(
      <Editor
        language="html"
        value={"<p>Hello</p>\n<p>World</p>"}
        onValueChange={onValueChange}
      />
    )

    expect(lines()).toEqual(["<p>Hello</p>", "<p>World</p>"])
    moveCursor(0)
    typeText("<!-- note -->\n")
    expect(onValueChange).toHaveBeenLastCalledWith(
      "<!-- note -->\n<p>Hello</p>\n<p>World</p>"
    )
  })

  it("follows a controlled value without echoing it back", () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Editor value="one" onValueChange={onValueChange} />
    )

    rerender(<Editor value="one two" onValueChange={onValueChange} />)
    expect(lines()).toEqual(["one two"])
    expect(onValueChange).not.toHaveBeenCalled()
    expect(status().textContent).toContain("1 line · 7 characters")
  })

  it("keeps its own value when uncontrolled", () => {
    const onValueChange = vi.fn()
    render(<Editor defaultValue="a" onValueChange={onValueChange} />)

    moveCursor(1)
    typeText("bc")
    expect(lines()).toEqual(["abc"])
    expect(onValueChange).toHaveBeenLastCalledWith("abc")
  })

  it("inserts text at the cursor, or over the selection, through its ref", async () => {
    const ref = React.createRef<CodeEditorHandle>()
    const onValueChange = vi.fn()
    render(
      <Editor ref={ref} defaultValue="Hello !" onValueChange={onValueChange} />
    )

    moveCursor(6)
    act(() => ref.current!.insertText("{{customer_name}}"))
    expect(onValueChange).toHaveBeenLastCalledWith("Hello {{customer_name}}!")
    expect(viewOf().state.selection.main.head).toBe(23)
    expect(status().textContent).toContain("Ln 1, Col 24")

    moveCursor(0, 5)
    act(() => ref.current!.insertText("Hi"))
    expect(onValueChange).toHaveBeenLastCalledWith("Hi {{customer_name}}!")
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
  })

  it("indents with Tab, and Escape then Tab leaves the editor", () => {
    const onValueChange = vi.fn()
    render(<Editor defaultValue="a" onValueChange={onValueChange} />)

    moveCursor(1)
    expect(key("Tab", 9)).toBe(false)
    expect(onValueChange).toHaveBeenLastCalledWith("a  ")

    onValueChange.mockClear()
    key("Escape", 27)
    expect(key("Tab", 9)).toBe(true)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(textbox().getAttribute("aria-describedby")).toBeTruthy()
    expect(
      document.getElementById(
        textbox().getAttribute("aria-describedby")!.split(" ")[0]
      )?.textContent
    ).toBe("To leave the editor, press Escape, then Tab.")
  })

  it("indents and outdents every selected line", () => {
    const onValueChange = vi.fn()
    render(<Editor defaultValue={"a\nb"} onValueChange={onValueChange} />)

    moveCursor(0, 3)
    key("Tab", 9)
    expect(onValueChange).toHaveBeenLastCalledWith("  a\n  b")
    key("Tab", 9, { shiftKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith("a\nb")
  })

  it("shows the cursor position and the line and character counts", () => {
    render(<Editor defaultValue={"ab\ncd"} />)

    expect(status().textContent).toContain("Ln 1, Col 1")
    expect(status().textContent).toContain("2 lines · 5 characters")
    moveCursor(4)
    expect(status().textContent).toContain("Ln 2, Col 2")
  })

  it("counts an empty editor as zero lines", () => {
    render(<Editor />)
    expect(status().textContent).toContain("0 lines · 0 characters")
  })

  it("numbers the empty rows under short code, and only those", () => {
    const emptyRows = () =>
      document
        .querySelector<HTMLElement>('[data-slot="code-editor-content"]')!
        .style.getPropertyValue("--code-editor-phantom-lines")
    const { rerender } = render(<Editor value="" minRows={4} />)
    expect(emptyRows()).toBe('"2\\A 3\\A 4"')

    rerender(<Editor value={"a\nb"} minRows={4} />)
    expect(emptyRows()).toBe('"3\\A 4"')

    rerender(<Editor value={"a\nb\nc\nd"} minRows={4} />)
    expect(emptyRows()).toBe("none")
  })

  it("reports the app's problems in the status bar and the gutter", () => {
    const code = "<script>\nok\n<script>"
    const { rerender } = render(<Editor value={code} />)
    expect(problemsStatus()).toBeNull()

    rerender(<Editor value={code} problems={[]} />)
    expect(problemsStatus()?.textContent).toBe("No problems")
    expect(problemsStatus()?.dataset.count).toBe("0")

    rerender(
      <Editor
        value={code}
        problems={[
          { line: 1, message: "Close the <script> tag." },
          { line: 3, message: "Close the <script> tag." },
        ]}
      />
    )
    expect(problemsStatus()?.textContent).toBe("2 problems")
    const marked = [
      ...document.querySelectorAll(".cm-lineNumbers .cm-problemLine"),
    ].map((element) => element.textContent)
    expect(marked).toEqual(["1", "3"])
    expect(textbox().getAttribute("aria-describedby")).toContain(
      problemsStatus()!.id
    )

    rerender(<Editor value="" problems={[]} />)
    expect(problemsStatus()).toBeNull()
  })

  it("copies the code", async () => {
    const user = userEvent.setup()
    render(<Editor defaultValue="<p>Copy me</p>" />)

    await user.click(screen.getByRole("button", { name: "Copy code" }))
    expect(await navigator.clipboard.readText()).toBe("<p>Copy me</p>")
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy()
  })

  it("clears the code, undoably, and hides both actions when empty", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Editor defaultValue="<p>Bye</p>" onValueChange={onValueChange} />)

    await user.click(screen.getByRole("button", { name: "Clear code" }))
    expect(onValueChange).toHaveBeenLastCalledWith("")
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Clear code" })).toBeNull()

    key("z", 90, { ctrlKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith("<p>Bye</p>")
  })

  it("translates every visible string through labels", () => {
    render(
      <Editor
        defaultValue="x"
        language="json"
        problems={[{ line: 1, message: "Unexpected token" }]}
        labels={{
          copy: "Code kopieren",
          clear: "Code löschen",
          language: "JSON-Daten",
          position: (line, column) => `Zeile ${line}, Spalte ${column}`,
          lines: (count) => `${count} Zeile`,
          characters: (count) => `${count} Zeichen`,
          problems: (count) => `${count} Problem`,
          keyboardHint: "Escape, dann Tab",
        }}
      />
    )

    expect(screen.getByRole("button", { name: "Code kopieren" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Code löschen" })).toBeTruthy()
    expect(screen.getByText("JSON-Daten")).toBeTruthy()
    expect(status().textContent).toContain("Zeile 1, Spalte 1")
    expect(status().textContent).toContain("1 Zeile · 1 Zeichen")
    expect(problemsStatus()?.textContent).toBe("1 Problem")
    expect(screen.getByText("Escape, dann Tab")).toBeTruthy()
  })

  it("names the language and file in the header", () => {
    const { rerender } = render(<Editor fileName="head.html" language="html" />)
    const header = document.querySelector('[data-slot="code-editor-header"]')!
    expect(header.textContent).toBe("head.htmlHTML")

    rerender(<Editor />)
    expect(header.textContent).toBe("Plain text")
    expect(
      document
        .querySelector('[data-slot="code-editor"]')
        ?.getAttribute("data-language")
    ).toBe("text")
  })

  it("is named by a FieldLabel and marked invalid", () => {
    render(
      <Field>
        <FieldLabel htmlFor="snippet">Snippet</FieldLabel>
        <CodeEditor id="snippet" invalid />
      </Field>
    )

    const box = textbox("Snippet")
    expect(box.id).toBe("snippet")
    expect(box.getAttribute("aria-invalid")).toBe("true")
    expect(
      document
        .querySelector('[data-slot="code-editor"]')
        ?.hasAttribute("data-invalid")
    ).toBe(true)
  })

  it("can be read-only: copy stays, clear and Tab capture go", () => {
    render(<Editor value="<p>Read me</p>" readOnly />)

    expect(textbox().getAttribute("aria-readonly")).toBe("true")
    expect(textbox().getAttribute("contenteditable")).toBe("true")
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Clear code" })).toBeNull()
    expect(key("Tab", 9)).toBe(true)
    expect(textbox().hasAttribute("aria-describedby")).toBe(false)
  })

  it("can be disabled", () => {
    render(<Editor value="<p>Off</p>" disabled />)

    expect(textbox().getAttribute("contenteditable")).toBe("false")
    expect(textbox().getAttribute("aria-disabled")).toBe("true")
    expect(
      screen.getByRole("button", { name: "Copy code" }).hasAttribute("disabled")
    ).toBe(true)
    expect(screen.queryByRole("button", { name: "Clear code" })).toBeNull()
    expect(
      document
        .querySelector('[data-slot="code-editor"]')
        ?.hasAttribute("data-disabled")
    ).toBe(true)
  })

  it("stops typing and pasting at maxLength and shows the limit", () => {
    const onValueChange = vi.fn()
    render(
      <Editor
        defaultValue="12345678"
        maxLength={10}
        onValueChange={onValueChange}
      />
    )

    moveCursor(8)
    typeText("abcdef")
    expect(onValueChange).toHaveBeenLastCalledWith("12345678ab")
    expect(viewOf().state.selection.main.head).toBe(10)
    expect(status().textContent).toContain("10 / 10 characters")

    onValueChange.mockClear()
    typeText("z")
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
