"use client"

import * as React from "react"
import { cn } from "cn"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import type { Transaction } from "@tiptap/pm/state"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  FiAlignCenter as AlignCenterIcon,
  FiAlignLeft as AlignLeftIcon,
  FiBold as BoldIcon,
  FiChevronDown as ChevronDownIcon,
  FiItalic as ItalicIcon,
  FiLink as LinkIcon,
  FiList as ListIcon,
  FiUnderline as UnderlineIcon,
} from "react-icons/fi"
import { LuSparkles as SparklesIcon } from "react-icons/lu"

import type {
  AiState,
  AiTarget,
} from "@/components/rich-text-editor/ai-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"

type RichTextEditorLabels = {
  toolbar?: string
  paragraph?: string
  heading1?: string
  heading2?: string
  heading3?: string
  heading4?: string
  heading5?: string
  heading6?: string
  bold?: string
  italic?: string
  underline?: string
  alignLeft?: string
  alignCenter?: string
  bulletList?: string
  link?: string
  linkUrl?: string
  applyLink?: string
  removeLink?: string
  generate?: string
  generating?: string
  aiAssistant?: string
  aiSuggestion?: string
  original?: string
  suggestion?: string
  writing?: string
  cancel?: string
  discard?: string
  tryAgain?: string
  insertBelow?: string
  replace?: string
  aiError?: string
}

const DEFAULT_LABELS: Required<RichTextEditorLabels> = {
  toolbar: "Formatting",
  paragraph: "Paragraph",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  heading4: "Heading 4",
  heading5: "Heading 5",
  heading6: "Heading 6",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  alignLeft: "Align left",
  alignCenter: "Align center",
  bulletList: "Bulleted list",
  link: "Link",
  linkUrl: "URL",
  applyLink: "Apply",
  removeLink: "Remove",
  generate: "Generate with AI",
  generating: "Generating…",
  aiAssistant: "AI Assistant",
  aiSuggestion: "AI suggestion",
  original: "Original",
  suggestion: "Suggestion",
  writing: "Writing…",
  cancel: "Cancel",
  discard: "Discard",
  tryAgain: "Try again",
  insertBelow: "Insert below",
  replace: "Replace",
  aiError: "We couldn't get a suggestion.",
}

type RichTextEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** An AI Assistant menu entry: `run` gets the document HTML, plus the selected HTML when text is selected, and resolves to the suggested HTML. */
type RichTextEditorAiAction = {
  id: string
  label: string
  run: (
    html: string,
    selection: string | undefined,
    options: { signal: AbortSignal }
  ) => Promise<string>
}

type RichTextEditorProps = {
  /** HTML. */
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  id?: string
  invalid?: boolean
  disabled?: boolean
  /** Minimum height of the writing area, in px. */
  minHeight?: number
  labels?: RichTextEditorLabels
  className?: string
  /** Accessible name when there is no <FieldLabel htmlFor>, e.g. "Description". */
  "aria-label"?: string
  /** Defaults to the `<label for={id}>` on the page, so a `FieldLabel htmlFor` names the editor. */
  "aria-labelledby"?: string
  /** Adds "Generate with AI"; receives the current HTML and resolves to the new HTML. */
  onGenerate?: (current: string) => Promise<string>
  /** Heading levels the toolbar offers and loaded HTML keeps (others become paragraphs); read once, on mount. Defaults to [2, 3]. */
  headingLevels?: RichTextEditorHeadingLevel[]
  /** Adds an "AI Assistant" menu; a suggestion shows beside the original until it is replaced, inserted below or discarded. */
  aiActions?: RichTextEditorAiAction[]
  /** Text for a failed AI action: return your own message for an error you recognise, or null to show `labels.aiError`. */
  getAiErrorMessage?: (error: unknown) => string | null | undefined
}

const DEFAULT_HEADING_LEVELS: RichTextEditorHeadingLevel[] = [2, 3]

const CONTENT_CLASSES = cn(
  "text-sm leading-5 text-foreground-secondary",
  "[&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-foreground [&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:text-xs [&_h5]:font-semibold [&_h5]:text-foreground [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:text-xs [&_h6]:font-semibold [&_h6]:text-muted-foreground [&_p]:my-0 [&_p+p]:mt-2",
  "[&_a]:text-primary-ink [&_a]:underline [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:ps-5"
)

type AiAssistant = typeof import("@/components/rich-text-editor/ai-assistant")

let loadedAiAssistant: AiAssistant | null | undefined
let aiAssistantImport: Promise<AiAssistant | null> | undefined

function loadAiAssistant() {
  aiAssistantImport ??=
    import("@/components/rich-text-editor/ai-assistant").then(
      (module) => (loadedAiAssistant = module),
      (error: unknown) => {
        console.warn(
          "RichTextEditor: the AI Assistant failed to load; the editor works without it.",
          error
        )
        return (loadedAiAssistant = null)
      }
    )
  return aiAssistantImport
}

/** Figma "Description" field: formatting toolbar over a resizable writing area. Emits HTML. */
function RichTextEditor({
  value = "",
  onChange,
  placeholder,
  id,
  invalid = false,
  disabled = false,
  minHeight = 120,
  labels: labelsProp,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  onGenerate,
  headingLevels = DEFAULT_HEADING_LEVELS,
  aiActions,
  getAiErrorMessage,
}: RichTextEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [generating, setGenerating] = React.useState(false)
  const [levels] = React.useState(() =>
    [...new Set(headingLevels)].sort((a, b) => a - b)
  )
  const [ai, setAi] = React.useState<AiState | null>(null)
  const [aiAssistant, setAiAssistant] = React.useState(() => loadedAiAssistant)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const aiFocus = React.useRef<HTMLElement | null>(null)
  const aiController = React.useRef<AbortController | null>(null)
  const onChangeRef = React.useRef(onChange)

  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels },
        link: { openOnClick: false, autolink: true },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        "aria-multiline": "true",
        role: "textbox",
        class: cn(
          "min-h-full px-3 py-2.5 outline-none",
          CONTENT_CLASSES,
          "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-start [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-placeholder [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current?.(editor.isEmpty ? "" : editor.getHTML())
    },
  })

  // Outside changes (form reset, "Generate with AI") replace the content without echoing onChange.
  React.useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? "" : editor.getHTML()
    if (value !== current)
      editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  // A contenteditable isn't labelable, so `<label for>` needs linking by hand.
  React.useEffect(() => {
    if (!editor || ariaLabel) return
    const dom = editor.view.dom
    if (ariaLabelledBy) {
      dom.setAttribute("aria-labelledby", ariaLabelledBy)
      return
    }
    if (!id) return
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(id)}"]`
    )
    if (!label) return
    label.id ||= `${id}-label`
    dom.setAttribute("aria-labelledby", label.id)
    const focus = () => editor.commands.focus()
    label.addEventListener("click", focus)
    return () => label.removeEventListener("click", focus)
  }, [editor, id, ariaLabel, ariaLabelledBy])

  const hasAi = ai !== null
  const aiOpen = hasAi && !disabled
  const aiStatus = aiOpen ? ai.status : "idle"
  const aiBusy = aiStatus === "busy"
  const showAiMenu = Boolean(aiActions?.length) && aiAssistant !== null

  React.useEffect(() => {
    editor?.setEditable(!disabled && !generating && !aiBusy, false)
  }, [editor, disabled, generating, aiBusy])

  React.useEffect(() => {
    if (showAiMenu && !aiAssistant) void loadAiAssistant().then(setAiAssistant)
  }, [showAiMenu, aiAssistant])

  const stopAi = React.useCallback(() => {
    aiController.current?.abort()
    setAi(null)
  }, [])

  React.useEffect(() => () => aiController.current?.abort(), [])

  React.useEffect(() => {
    if (!editor || !hasAi) return
    const onTransaction = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.docChanged) stopAi()
    }
    editor.on("transaction", onTransaction)
    return () => {
      editor.off("transaction", onTransaction)
    }
  }, [editor, hasAi, stopAi])

  React.useEffect(() => {
    if (!aiOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (!rootRef.current?.contains(event.target as Node)) return
      event.preventDefault()
      stopAi()
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [aiOpen, stopAi])

  const setAiFocus = React.useCallback((node: HTMLElement | null) => {
    aiFocus.current = node
  }, [])

  const lastAiStatus = React.useRef(aiStatus)
  React.useEffect(() => {
    if (lastAiStatus.current === aiStatus) return
    lastAiStatus.current = aiStatus
    const active = document.activeElement
    if (
      active &&
      active !== document.body &&
      !rootRef.current?.contains(active)
    )
      return
    if (aiStatus === "idle") editor?.commands.focus()
    else aiFocus.current?.focus()
  }, [editor, aiStatus])

  const generate = async () => {
    if (!editor || !onGenerate) return
    setGenerating(true)
    try {
      const html = await onGenerate(editor.isEmpty ? "" : editor.getHTML())
      // Through a transaction, so Cmd+Z restores what was there before.
      editor.chain().focus().setContent(html).run()
    } finally {
      setGenerating(false)
    }
  }

  const runAi = async (action: RichTextEditorAiAction, target: AiTarget) => {
    if (!editor || !aiAssistant) return
    aiController.current?.abort()
    const controller = new AbortController()
    aiController.current = controller
    setAi({ status: "busy", action, target })
    let next: AiState
    try {
      const suggestion = await aiAssistant.getAiSuggestion(
        editor,
        action,
        target,
        controller.signal
      )
      next = suggestion
        ? { status: "review", action, target, suggestion }
        : { status: "error", action, target, message: labels.aiError }
    } catch (error) {
      next = {
        status: "error",
        action,
        target,
        message: getAiErrorMessage?.(error) || labels.aiError,
      }
    }
    if (!controller.signal.aborted) setAi(next)
  }

  const askAi = (action: RichTextEditorAiAction) => {
    if (editor && aiAssistant) runAi(action, aiAssistant.getAiTarget(editor))
  }

  const retryAi = () => {
    if (!ai) return
    runAi(
      aiActions?.find((action) => action.id === ai.action.id) ?? ai.action,
      ai.target
    )
  }

  const applyAi = (mode: "replace" | "insert") => {
    if (!editor || !aiAssistant || ai?.status !== "review") return
    aiAssistant.applyAiSuggestion(editor, ai.target, ai.suggestion, mode)
    stopAi()
  }

  const state = useEditorState({
    editor,
    selector: () =>
      editor
        ? {
            block:
              levels
                .filter((level) => editor.isActive("heading", { level }))
                .map((level) => `h${level}`)[0] ?? "p",
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            left: editor.isActive({ textAlign: "left" }),
            center: editor.isActive({ textAlign: "center" }),
            bullet: editor.isActive("bulletList"),
            link: editor.isActive("link"),
            href:
              (editor.getAttributes("link").href as string | undefined) ?? "",
          }
        : null,
  })

  const run = (fn: () => void) => () => {
    if (!editor) return
    fn()
  }

  const locked = disabled || aiBusy

  const aiTrigger = (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      className="ms-auto h-7 px-2.5"
      disabled={disabled || !editor || generating || aiBusy || !aiAssistant}
    >
      <SparklesIcon />
      {labels.aiAssistant}
      <ChevronDownIcon />
    </Button>
  )

  return (
    <div
      ref={rootRef}
      data-slot="rich-text-editor"
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      aria-busy={generating || aiBusy || undefined}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-control border border-input bg-background transition-colors hover:border-placeholder has-[.ProseMirror-focused]:border-primary aria-disabled:pointer-events-none aria-disabled:opacity-60 aria-invalid:border-destructive",
        className
      )}
    >
      <div
        role="toolbar"
        aria-label={labels.toolbar}
        className="flex flex-wrap items-center gap-x-1 gap-y-2 bg-card-header p-3"
      >
        <Select
          value={state?.block ?? "p"}
          disabled={locked || !editor}
          onValueChange={(block) => {
            if (!editor) return
            const chain = editor.chain().focus()
            if (block === "p") chain.setParagraph().run()
            else
              chain
                .toggleHeading({
                  level: Number(block.slice(1)) as RichTextEditorHeadingLevel,
                })
                .run()
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label={labels.paragraph}
            className="me-1 h-7 w-auto bg-background px-3 text-xs font-medium text-foreground-secondary shadow-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">{labels.paragraph}</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={`h${level}`}>
                {labels[`heading${level}`]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToolbarToggle
          label={labels.bold}
          pressed={state?.bold}
          disabled={locked}
          onClick={run(() => editor!.chain().focus().toggleBold().run())}
        >
          <BoldIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.italic}
          pressed={state?.italic}
          disabled={locked}
          onClick={run(() => editor!.chain().focus().toggleItalic().run())}
        >
          <ItalicIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.underline}
          pressed={state?.underline}
          disabled={locked}
          onClick={run(() => editor!.chain().focus().toggleUnderline().run())}
        >
          <UnderlineIcon />
        </ToolbarToggle>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarToggle
          label={labels.alignLeft}
          pressed={state?.left}
          disabled={locked}
          onClick={run(() =>
            editor!.chain().focus().setTextAlign("left").run()
          )}
        >
          <AlignLeftIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.alignCenter}
          pressed={state?.center}
          disabled={locked}
          onClick={run(() =>
            editor!.chain().focus().setTextAlign("center").run()
          )}
        >
          <AlignCenterIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.bulletList}
          pressed={state?.bullet}
          disabled={locked}
          onClick={run(() => editor!.chain().focus().toggleBulletList().run())}
        >
          <ListIcon />
        </ToolbarToggle>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <LinkButton
          labels={labels}
          active={state?.link ?? false}
          href={state?.href ?? ""}
          disabled={locked || !editor}
          onApply={(url) =>
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run()
          }
          onRemove={() =>
            editor?.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        />

        {showAiMenu && aiActions ? (
          aiAssistant ? (
            <aiAssistant.AiMenu
              actions={aiActions}
              focusRef={aiFocus}
              onPick={askAi}
            >
              {aiTrigger}
            </aiAssistant.AiMenu>
          ) : (
            aiTrigger
          )
        ) : null}

        {onGenerate && (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            className={cn("h-7 px-2.5", !showAiMenu && "ms-auto")}
            loading={generating}
            disabled={disabled || !editor || aiOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={generate}
          >
            {!generating && <SparklesIcon />}
            {generating ? labels.generating : labels.generate}
          </Button>
        )}
      </div>
      {aiOpen && editor && aiAssistant && (
        <aiAssistant.AiPanel
          editor={editor}
          ai={ai}
          labels={labels}
          contentClassName={CONTENT_CLASSES}
          focusRef={setAiFocus}
          onRetry={retryAi}
          onApply={applyAi}
          onDiscard={stopAi}
        />
      )}
      <div
        className={cn(
          "resize-y overflow-auto transition-opacity",
          (generating || aiBusy) && "animate-pulse opacity-60"
        )}
        style={{ minHeight, height: minHeight }}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} className="h-full [&>div]:h-full" />
      </div>
    </div>
  )
}

function ToolbarToggle({
  label,
  pressed = false,
  disabled,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Toggle
      size="sm"
      aria-label={label}
      pressed={pressed}
      disabled={disabled}
      onPressedChange={onClick}
      onMouseDown={(event) => event.preventDefault()}
      className="size-7 min-w-7 rounded-md p-0 text-foreground-secondary [&_svg]:size-[18px]"
    >
      {children}
    </Toggle>
  )
}

function LinkButton({
  labels,
  active,
  href,
  disabled,
  onApply,
  onRemove,
}: {
  labels: Required<RichTextEditorLabels>
  active: boolean
  href: string
  disabled?: boolean
  onApply: (url: string) => void
  onRemove: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const inputId = React.useId()

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setUrl(href)
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          aria-label={labels.link}
          pressed={active}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          className="size-7 min-w-7 rounded-md p-0 text-foreground-secondary [&_svg]:size-[18px]"
        >
          <LinkIcon />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = url.trim()
            if (trimmed)
              onApply(
                /^[a-z]+:/i.test(trimmed) ? trimmed : `https://${trimmed}`
              )
            setOpen(false)
          }}
        >
          <label htmlFor={inputId} className="type-field-label">
            {labels.linkUrl}
          </label>
          <Input
            id={inputId}
            autoFocus
            value={url}
            placeholder="https://"
            onChange={(event) => setUrl(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  onRemove()
                  setOpen(false)
                }}
              >
                {labels.removeLink}
              </Button>
            )}
            <Button type="submit" size="sm">
              {labels.applyLink}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export {
  RichTextEditor,
  type RichTextEditorAiAction,
  type RichTextEditorHeadingLevel,
  type RichTextEditorLabels,
  type RichTextEditorProps,
}
