"use client"

import * as React from "react"
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentLess,
  indentMore,
} from "@codemirror/commands"
import { indentUnit } from "@codemirror/language"
import {
  Annotation,
  Compartment,
  EditorState,
  Facet,
  RangeSet,
  Transaction,
  type ChangeSpec,
  type Extension,
} from "@codemirror/state"
import {
  EditorView,
  GutterMarker,
  gutterLineClass,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderWidget,
} from "@codemirror/view"
import { cn } from "cn"
import {
  FiAlertTriangle as AlertTriangleIcon,
  FiCheck as CheckIcon,
  FiCode as CodeIcon,
  FiX as XIcon,
} from "react-icons/fi"

import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CodeEditorLanguage = "html" | "css" | "javascript" | "json" | "text"

type CodeEditorProblem = {
  /** 1-based line; its number turns red in the gutter. */
  line?: number
  message: string
}

type CodeEditorLabels = {
  copy?: string
  copied?: string
  clear?: string
  /** The language badge; defaults to HTML, CSS, JavaScript, JSON or Plain text. */
  language?: string
  position?: (line: number, column: number) => string
  lines?: (count: number) => string
  characters?: (count: number, max?: number) => string
  problems?: (count: number) => string
  keyboardHint?: string
}

type CodeEditorHandle = {
  /** Replaces the selection with `text`, or inserts it at the cursor, then focuses the editor. */
  insertText: (text: string) => void
  focus: () => void
}

type CodeEditorProps = Omit<
  React.ComponentProps<"div">,
  | "children"
  | "defaultValue"
  | "dir"
  | "id"
  | "onChange"
  | "ref"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  language?: CodeEditorLanguage
  /** Shown in the header tab, e.g. "head.html". */
  fileName?: string
  placeholder?: string
  readOnly?: boolean
  disabled?: boolean
  invalid?: boolean
  /** Visible lines when short. */
  minRows?: number
  /** Lines before it scrolls; defaults to `minRows`, a fixed height. `Infinity` grows with the code. */
  maxRows?: number
  /** Typing and pasting stop at this many characters, and the count shows the limit. */
  maxLength?: number
  /** From your own checks. Omit to hide the status; `[]` shows "No problems". */
  problems?: CodeEditorProblem[]
  labels?: CodeEditorLabels
  /** Set on the editable area, so `<FieldLabel htmlFor={id}>` names it. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  ref?: React.Ref<CodeEditorHandle>
}

const formatCount = (count: number) => count.toLocaleString("en-US")

const DEFAULT_LABELS: Required<Omit<CodeEditorLabels, "language">> = {
  copy: "Copy code",
  copied: "Copied",
  clear: "Clear code",
  position: (line, column) => `Ln ${line}, Col ${column}`,
  lines: (count) => (count === 1 ? "1 line" : `${formatCount(count)} lines`),
  characters: (count, max) =>
    max !== undefined
      ? `${formatCount(count)} / ${formatCount(max)} characters`
      : count === 1
        ? "1 character"
        : `${formatCount(count)} characters`,
  problems: (count) =>
    count === 0
      ? "No problems"
      : count === 1
        ? "1 problem"
        : `${formatCount(count)} problems`,
  keyboardHint: "To leave the editor, press Escape, then Tab.",
}

const LANGUAGE_NAMES: Record<CodeEditorLanguage, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  json: "JSON",
  text: "Plain text",
}

type LanguagePack = Exclude<CodeEditorLanguage, "text">

const LANGUAGE_PACKS: Record<LanguagePack, () => Promise<Extension>> = {
  html: () => import("@codemirror/lang-html").then((pack) => pack.html()),
  css: () => import("@codemirror/lang-css").then((pack) => pack.css()),
  javascript: () =>
    import("@codemirror/lang-javascript").then((pack) => pack.javascript()),
  json: () => import("@codemirror/lang-json").then((pack) => pack.json()),
}

const languageSupport = new Map<LanguagePack, Extension>()
const languageImports = new Map<LanguagePack, Promise<Extension>>()

function loadLanguageSupport(language: LanguagePack) {
  let load = languageImports.get(language)
  if (!load) {
    load = LANGUAGE_PACKS[language]()
      .catch((error): Extension => {
        console.warn(
          `CodeEditor: ${LANGUAGE_NAMES[language]} support failed to load; the code is edited as plain text.`,
          error
        )
        return []
      })
      .then((support) => {
        languageSupport.set(language, support)
        return support
      })
    languageImports.set(language, load)
  }
  return load
}

const LINE_HEIGHT = 20
const VERTICAL_PADDING = 24

const rowsHeight = (rows: number) =>
  `${rows * LINE_HEIGHT + VERTICAL_PADDING}px`

const External = Annotation.define<boolean>()

class ProblemLineMarker extends GutterMarker {
  elementClass = "cm-problemLine"
}

const problemLineMarker = new ProblemLineMarker()

const problemLines = Facet.define<readonly number[], readonly number[]>({
  combine: (values) => values.flat(),
})

const problemGutter = gutterLineClass.compute(
  ["doc", problemLines],
  (state) => {
    const lines = [...new Set(state.facet(problemLines))]
      .filter(
        (line) => Number.isInteger(line) && line >= 1 && line <= state.doc.lines
      )
      .sort((a, b) => a - b)
    return RangeSet.of(
      lines.map((line) => problemLineMarker.range(state.doc.line(line).from))
    )
  }
)

const editorTheme = EditorView.theme({
  "&": { maxHeight: "var(--code-editor-max-height)" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "inherit",
    lineHeight: "inherit",
  },
  ".cm-content": {
    minHeight: "var(--code-editor-min-height)",
    padding: "12px 0",
    caretColor: "var(--foreground)",
  },
  ".cm-line": { padding: "0 12px" },
  ".cm-gutters": {
    backgroundColor: "color-mix(in srgb, var(--muted) 30%, var(--card))",
    borderColor: "var(--border)",
    color: "var(--muted-foreground)",
    fontSize: "12px",
    fontVariantNumeric: "tabular-nums",
  },
  ".cm-gutter": { minHeight: "var(--code-editor-min-height)" },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "43px",
    padding: "0 8px 0 0",
  },
  ".cm-lineNumbers::after": {
    content: "var(--code-editor-phantom-lines)",
    padding: "0 8px 0 0",
    textAlign: "right",
    whiteSpace: "pre",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--foreground)",
  },
  ".cm-gutterElement.cm-problemLine": {
    color: "var(--destructive)",
    fontWeight: "600",
  },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
})

function indentOrInsert(view: EditorView) {
  const { state } = view
  if (state.readOnly) return false
  if (state.selection.ranges.some((range) => !range.empty))
    return indentMore(view)
  view.dispatch(
    state.update(state.replaceSelection(state.facet(indentUnit)), {
      scrollIntoView: true,
      userEvent: "input",
    })
  )
  return true
}

const baseExtensions: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  history(),
  keymap.of([
    { key: "Tab", run: indentOrInsert, shift: indentLess },
    ...defaultKeymap,
    ...historyKeymap,
  ]),
  editorTheme,
  problemGutter,
]

function lengthLimit(max: number) {
  return EditorState.transactionFilter.of((tr) => {
    if (
      !tr.docChanged ||
      tr.newDoc.length <= max ||
      tr.newDoc.length <= tr.startState.doc.length
    )
      return tr
    let room = max - tr.startState.doc.length
    const changes: ChangeSpec[] = []
    tr.changes.iterChanges((from, to, _fromB, _toB, inserted) => {
      room += to - from
      const keep = Math.max(0, Math.min(inserted.length, room))
      room -= keep
      changes.push({ from, to, insert: inserted.sliceString(0, keep) })
    })
    const trimmed = tr.startState.changes(changes)
    return {
      changes: trimmed,
      selection: tr.startState.selection.map(trimmed, 1),
      scrollIntoView: tr.scrollIntoView,
      userEvent: tr.annotation(Transaction.userEvent),
    }
  })
}

function minimalChange(from: string, to: string): ChangeSpec {
  const shorter = Math.min(from.length, to.length)
  let start = 0
  while (start < shorter && from.charCodeAt(start) === to.charCodeAt(start))
    start++
  let endFrom = from.length
  let endTo = to.length
  while (
    endFrom > start &&
    endTo > start &&
    from.charCodeAt(endFrom - 1) === to.charCodeAt(endTo - 1)
  ) {
    endFrom--
    endTo--
  }
  return { from: start, to: endFrom, insert: to.slice(start, endTo) }
}

/** Code field on CodeMirror (opt-in entry `@flycommerce/ui/code-editor`): file tab, line numbers, syntax colours, Ln/Col, counts and your problems. */
function CodeEditor({
  value,
  defaultValue = "",
  onValueChange,
  language = "text",
  fileName,
  placeholder,
  readOnly = false,
  disabled = false,
  invalid = false,
  minRows = 14,
  maxRows,
  maxLength,
  problems,
  labels: labelsProp,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ref,
  className,
  ...props
}: CodeEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const hintId = React.useId()
  const statusId = React.useId()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const viewRef = React.useRef<EditorView | null>(null)
  const onValueChangeRef = React.useRef(onValueChange)
  const [compartments] = React.useState(() => ({
    language: new Compartment(),
    editable: new Compartment(),
    placeholder: new Compartment(),
    attributes: new Compartment(),
    problems: new Compartment(),
    limit: new Compartment(),
  }))
  const [text, setText] = React.useState(() => value ?? defaultValue)
  const docRef = React.useRef(text)
  const [cursor, setCursor] = React.useState({ line: 1, column: 1 })

  const editable = !readOnly && !disabled
  const showStatus =
    problems !== undefined && (problems.length > 0 || text.length > 0)
  const problemLineKey = (problems ?? [])
    .map((problem) => problem.line ?? 0)
    .join(" ")

  React.useEffect(() => {
    onValueChangeRef.current = onValueChange
  }, [onValueChange])

  React.useEffect(() => {
    const view = new EditorView({
      parent: hostRef.current!,
      state: EditorState.create({
        doc: docRef.current,
        extensions: [
          baseExtensions,
          compartments.language.of([]),
          compartments.editable.of([]),
          compartments.placeholder.of([]),
          compartments.attributes.of([]),
          compartments.problems.of([]),
          compartments.limit.of([]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const next = update.state.doc.toString()
              docRef.current = next
              setText(next)
              if (!update.transactions.some((tr) => tr.annotation(External)))
                onValueChangeRef.current?.(next)
            }
            if (update.docChanged || update.selectionSet) {
              const head = update.state.selection.main.head
              const line = update.state.doc.lineAt(head)
              setCursor({ line: line.number, column: head - line.from + 1 })
            }
          }),
        ],
      }),
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [compartments])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const reconfigure = (support: Extension) =>
      view.dispatch({ effects: compartments.language.reconfigure(support) })
    if (language === "text") {
      reconfigure([])
      return
    }
    const loaded = languageSupport.get(language)
    reconfigure(loaded ?? [])
    if (loaded) return
    let current = true
    void loadLanguageSupport(language).then((support) => {
      if (current) reconfigure(support)
    })
    return () => {
      current = false
    }
  }, [compartments, language])

  React.useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.editable.reconfigure([
        EditorView.editable.of(!disabled),
        EditorState.readOnly.of(readOnly || disabled),
      ]),
    })
  }, [compartments, readOnly, disabled])

  React.useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.placeholder.reconfigure(
        placeholder ? placeholderWidget(placeholder) : []
      ),
    })
  }, [compartments, placeholder])

  React.useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.problems.reconfigure(
        problemLines.of(
          problemLineKey ? problemLineKey.split(" ").map(Number) : []
        )
      ),
    })
  }, [compartments, problemLineKey])

  React.useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.limit.reconfigure(
        maxLength === undefined ? [] : lengthLimit(maxLength)
      ),
    })
  }, [compartments, maxLength])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const label =
      id && !ariaLabel && !ariaLabelledBy
        ? document.querySelector<HTMLLabelElement>(
            `label[for="${CSS.escape(id)}"]`
          )
        : null
    if (label) label.id ||= `${id}-label`
    const labelledBy = ariaLabelledBy ?? label?.id
    const describedBy = [
      ariaDescribedBy,
      editable ? hintId : undefined,
      showStatus ? statusId : undefined,
    ]
      .filter(Boolean)
      .join(" ")
    view.dispatch({
      effects: compartments.attributes.reconfigure(
        EditorView.contentAttributes.of({
          ...(id ? { id } : {}),
          ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
          ...(labelledBy ? { "aria-labelledby": labelledBy } : {}),
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
          ...(invalid ? { "aria-invalid": "true" } : {}),
          ...(disabled ? { "aria-disabled": "true" } : {}),
        })
      ),
    })
    if (!label) return
    const focus = () => view.focus()
    label.addEventListener("click", focus)
    return () => label.removeEventListener("click", focus)
  }, [
    compartments,
    id,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    invalid,
    disabled,
    editable,
    showStatus,
    hintId,
    statusId,
  ])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view || value === undefined) return
    const current = view.state.doc.toString()
    if (value === current) return
    view.dispatch({
      changes: minimalChange(current, value),
      annotations: [External.of(true), Transaction.addToHistory.of(false)],
      filter: false,
    })
  }, [value])

  React.useImperativeHandle(
    ref,
    () => ({
      insertText(insert) {
        const view = viewRef.current
        if (!view || view.state.readOnly) return
        view.dispatch(view.state.replaceSelection(insert), {
          scrollIntoView: true,
          userEvent: "input",
        })
        view.focus()
      },
      focus() {
        viewRef.current?.focus()
      },
    }),
    []
  )

  const clear = () => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length },
      scrollIntoView: true,
      userEvent: "delete",
    })
    view.focus()
  }

  const minHeight = rowsHeight(minRows)
  const maxHeight =
    maxRows === undefined
      ? minHeight
      : Number.isFinite(maxRows)
        ? rowsHeight(Math.max(minRows, maxRows))
        : "none"
  const docLines = text.split("\n").length
  const lineCount = text ? docLines : 0
  const phantomLines =
    docLines < minRows
      ? `"${Array.from({ length: minRows - docLines }, (_, index) => docLines + 1 + index).join("\\A ")}"`
      : "none"

  return (
    <div
      data-slot="code-editor"
      data-language={language}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-control border border-input bg-card transition-colors not-data-invalid:has-[.cm-focused]:border-primary data-invalid:border-destructive data-disabled:pointer-events-none data-disabled:opacity-60",
        className
      )}
      {...props}
    >
      <div
        data-slot="code-editor-header"
        className="flex min-h-10 items-center gap-2 border-b border-border bg-muted/40 py-1 ps-3 pe-1"
      >
        <CodeIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        {fileName && (
          <span
            dir="ltr"
            className="min-w-0 truncate font-mono text-xs font-medium text-foreground"
          >
            {fileName}
          </span>
        )}
        <Badge variant="outline" className="ms-1">
          {labels.language ?? LANGUAGE_NAMES[language]}
        </Badge>
        {text && (
          <div className="ms-auto flex items-center gap-2">
            <CopyButton
              value={text}
              iconOnly
              size="icon-sm"
              variant="ghost"
              label={labels.copy}
              copiedLabel={labels.copied}
              disabled={disabled}
            />
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={labels.clear}
                onClick={clear}
              >
                <XIcon aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div
        ref={hostRef}
        dir="ltr"
        data-slot="code-editor-content"
        className="min-h-(--code-editor-min-height) text-start font-mono text-sm leading-5 text-foreground contain-inline-size"
        style={
          {
            "--code-editor-min-height": minHeight,
            "--code-editor-max-height": maxHeight,
            "--code-editor-phantom-lines": phantomLines,
          } as React.CSSProperties
        }
      />
      <div
        data-slot="code-editor-status"
        className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground tabular-nums"
      >
        <span dir="auto">{labels.position(cursor.line, cursor.column)}</span>
        <span dir="auto">
          {labels.lines(lineCount)} ·{" "}
          {labels.characters(text.length, maxLength)}
        </span>
        {showStatus && (
          <span
            id={statusId}
            data-slot="code-editor-problems"
            data-count={problems.length}
            className={cn(
              "ms-auto flex items-center gap-1",
              problems.length > 0 ? "text-destructive" : "text-success-strong"
            )}
          >
            {problems.length > 0 ? (
              <AlertTriangleIcon aria-hidden="true" className="size-3" />
            ) : (
              <CheckIcon aria-hidden="true" className="size-3" />
            )}
            <span dir="auto">{labels.problems(problems.length)}</span>
          </span>
        )}
      </div>
      {editable && (
        <span id={hintId} className="sr-only">
          {labels.keyboardHint}
        </span>
      )}
    </div>
  )
}

export {
  CodeEditor,
  type CodeEditorHandle,
  type CodeEditorLabels,
  type CodeEditorLanguage,
  type CodeEditorProblem,
  type CodeEditorProps,
}
