"use client"

import * as React from "react"
import { cn } from "cn"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  SparklesIcon,
  UnderlineIcon,
} from "lucide-react"

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
  heading2?: string
  heading3?: string
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
}

const DEFAULT_LABELS: Required<RichTextEditorLabels> = {
  toolbar: "Formatting",
  paragraph: "Paragraph",
  heading2: "Heading 2",
  heading3: "Heading 3",
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
}: RichTextEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [generating, setGenerating] = React.useState(false)
  const onChangeRef = React.useRef(onChange)

  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
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
          "min-h-full px-3 py-2.5 text-sm leading-5 text-foreground-secondary outline-none",
          "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:my-0 [&_p+p]:mt-2",
          "[&_a]:text-primary [&_a]:underline [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:ps-5",
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

  React.useEffect(() => {
    editor?.setEditable(!disabled && !generating)
  }, [editor, disabled, generating])

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

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            block: editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : "p",
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

  return (
    <div
      data-slot="rich-text-editor"
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      aria-busy={generating || undefined}
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
          disabled={disabled || !editor}
          onValueChange={(block) => {
            if (!editor) return
            const chain = editor.chain().focus()
            if (block === "p") chain.setParagraph().run()
            else chain.toggleHeading({ level: block === "h2" ? 2 : 3 }).run()
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label={labels.paragraph}
            className="me-1 h-7 w-auto gap-1 bg-background px-3 text-xs font-medium text-foreground-secondary shadow-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">{labels.paragraph}</SelectItem>
            <SelectItem value="h2">{labels.heading2}</SelectItem>
            <SelectItem value="h3">{labels.heading3}</SelectItem>
          </SelectContent>
        </Select>

        <ToolbarToggle
          label={labels.bold}
          pressed={state?.bold}
          disabled={disabled}
          onClick={run(() => editor!.chain().focus().toggleBold().run())}
        >
          <BoldIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.italic}
          pressed={state?.italic}
          disabled={disabled}
          onClick={run(() => editor!.chain().focus().toggleItalic().run())}
        >
          <ItalicIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.underline}
          pressed={state?.underline}
          disabled={disabled}
          onClick={run(() => editor!.chain().focus().toggleUnderline().run())}
        >
          <UnderlineIcon />
        </ToolbarToggle>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarToggle
          label={labels.alignLeft}
          pressed={state?.left}
          disabled={disabled}
          onClick={run(() =>
            editor!.chain().focus().setTextAlign("left").run()
          )}
        >
          <AlignLeftIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.alignCenter}
          pressed={state?.center}
          disabled={disabled}
          onClick={run(() =>
            editor!.chain().focus().setTextAlign("center").run()
          )}
        >
          <AlignCenterIcon />
        </ToolbarToggle>
        <ToolbarToggle
          label={labels.bulletList}
          pressed={state?.bullet}
          disabled={disabled}
          onClick={run(() => editor!.chain().focus().toggleBulletList().run())}
        >
          <ListIcon />
        </ToolbarToggle>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <LinkButton
          labels={labels}
          active={state?.link ?? false}
          href={state?.href ?? ""}
          disabled={disabled || !editor}
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

        {onGenerate && (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            className="ms-auto h-7 px-2.5"
            loading={generating}
            disabled={disabled || !editor}
            onMouseDown={(event) => event.preventDefault()}
            onClick={generate}
          >
            {!generating && <SparklesIcon />}
            {generating ? labels.generating : labels.generate}
          </Button>
        )}
      </div>
      <div
        className={cn(
          "resize-y overflow-auto transition-opacity",
          generating && "animate-pulse opacity-60"
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

export { RichTextEditor, type RichTextEditorLabels, type RichTextEditorProps }
