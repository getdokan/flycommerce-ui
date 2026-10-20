"use client"

import * as React from "react"
import { cn } from "cn"
import {
  DOMParser as ProseMirrorDOMParser,
  DOMSerializer,
  Slice,
  type Fragment,
} from "@tiptap/pm/model"
import type { Selection } from "@tiptap/pm/state"
import {
  elementFromString,
  getHTMLFromFragment,
  type Editor,
} from "@tiptap/react"
import {
  FiAlertTriangle as AlertTriangleIcon,
  FiRefreshCw as RefreshIcon,
} from "react-icons/fi"
import { LuSparkles as SparklesIcon } from "react-icons/lu"

import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"

import type {
  RichTextEditorAiAction,
  RichTextEditorLabels,
} from "../rich-text-editor"

type AiTarget = { selection: Selection | null; original: Fragment | null }

type AiState =
  | { status: "busy"; action: RichTextEditorAiAction; target: AiTarget }
  | {
      status: "review"
      action: RichTextEditorAiAction
      target: AiTarget
      suggestion: Fragment
    }
  | {
      status: "error"
      action: RichTextEditorAiAction
      target: AiTarget
      message: string
    }

function getAiTarget(editor: Editor): AiTarget {
  const { selection } = editor.state
  return selection.empty
    ? {
        selection: null,
        original: editor.isEmpty ? null : editor.state.doc.content,
      }
    : { selection, original: selection.content().content }
}

async function getAiSuggestion(
  editor: Editor,
  action: RichTextEditorAiAction,
  target: AiTarget,
  signal: AbortSignal
) {
  const html = await action.run(
    editor.isEmpty ? "" : editor.getHTML(),
    target.selection
      ? getHTMLFromFragment(target.selection.content().content, editor.schema)
      : undefined,
    { signal }
  )
  const doc = ProseMirrorDOMParser.fromSchema(editor.schema).parse(
    elementFromString(html)
  )
  return doc.textContent.trim() ? doc.content : null
}

function applyAiSuggestion(
  editor: Editor,
  { selection }: AiTarget,
  content: Fragment,
  mode: "replace" | "insert"
) {
  const chain = editor.chain().focus()
  if (!selection && (mode === "replace" || editor.isEmpty))
    chain.setContent(content)
  else if (!selection)
    chain.insertContentAt(editor.state.doc.content.size, content)
  else if (mode === "replace")
    chain.command(({ tr }) => {
      tr.setSelection(selection).replaceSelection(Slice.maxOpen(content))
      return true
    })
  else
    chain.insertContentAt(
      selection.$to.depth ? selection.$to.after(1) : selection.$to.pos,
      content
    )
  chain.run()
}

function AiMenu({
  actions,
  focusRef,
  onPick,
  children,
}: {
  actions: RichTextEditorAiAction[]
  focusRef: React.RefObject<HTMLElement | null>
  onPick: (action: RichTextEditorAiAction) => void
  children: React.ReactElement
}) {
  const picked = React.useRef(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto"
        onCloseAutoFocus={(event) => {
          if (!picked.current) return
          picked.current = false
          event.preventDefault()
          focusRef.current?.focus()
        }}
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onSelect={() => {
              picked.current = true
              onPick(action)
            }}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AiPanel({
  editor,
  ai,
  labels,
  contentClassName,
  focusRef,
  onRetry,
  onApply,
  onDiscard,
}: {
  editor: Editor
  ai: AiState
  labels: Required<RichTextEditorLabels>
  contentClassName: string
  focusRef: (node: HTMLElement | null) => void
  onRetry: () => void
  onApply: (mode: "replace" | "insert") => void
  onDiscard: () => void
}) {
  const titleId = React.useId()

  return (
    <div
      ref={ai.status === "review" ? focusRef : undefined}
      role="region"
      aria-labelledby={titleId}
      aria-busy={ai.status === "busy" || undefined}
      tabIndex={-1}
      data-slot="rich-text-editor-ai"
      data-state={ai.status}
      className="@container/ai flex flex-col gap-3 border-b border-primary/20 bg-primary-subtle p-3 outline-none"
    >
      <p
        id={titleId}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary-strong"
      >
        <SparklesIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <span>{labels.aiSuggestion}</span> <span aria-hidden="true">·</span>{" "}
        <span className="font-medium">{ai.action.label}</span>
      </p>
      {ai.status === "error" ? (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>{ai.message}</AlertTitle>
          <AlertAction className="flex flex-wrap gap-2">
            <Button
              ref={focusRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              <RefreshIcon data-icon="inline-start" />
              {labels.tryAgain}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
              {labels.discard}
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <>
          <div className="grid gap-3 @xl/ai:grid-cols-2">
            {ai.target.original && (
              <AiVersion slot="original" label={labels.original}>
                <AiContent
                  editor={editor}
                  content={ai.target.original}
                  className={contentClassName}
                />
              </AiVersion>
            )}
            <AiVersion
              slot="suggestion"
              label={labels.suggestion}
              className={cn(!ai.target.original && "@xl/ai:col-span-2")}
            >
              {ai.status === "review" ? (
                <AiContent
                  editor={editor}
                  content={ai.suggestion}
                  className={contentClassName}
                />
              ) : (
                <span
                  role="status"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Spinner
                    aria-hidden="true"
                    role={undefined}
                    aria-label={undefined}
                  />
                  {labels.writing}
                </span>
              )}
            </AiVersion>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {ai.status === "busy" ? (
              <Button
                ref={focusRef}
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDiscard}
              >
                {labels.cancel}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDiscard}
                >
                  {labels.discard}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                >
                  <RefreshIcon data-icon="inline-start" />
                  {labels.tryAgain}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onApply("insert")}
                >
                  {labels.insertBelow}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onApply("replace")}
                >
                  {labels.replace}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function AiVersion({
  slot,
  label,
  className,
  children,
}: {
  slot: "original" | "suggestion"
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot={`rich-text-editor-ai-${slot}`}
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
    >
      <p className="type-group-heading text-muted-foreground">{label}</p>
      <div className="rounded-control border border-border bg-background px-3 py-2.5">
        {children}
      </div>
    </div>
  )
}

function AiContent({
  editor,
  content,
  className,
}: {
  editor: Editor
  content: Fragment
  className: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    ref.current?.replaceChildren(
      DOMSerializer.fromSchema(editor.schema).serializeFragment(content)
    )
  }, [editor, content])

  return <div ref={ref} className={className} />
}

export {
  AiMenu,
  AiPanel,
  applyAiSuggestion,
  getAiSuggestion,
  getAiTarget,
  type AiState,
  type AiTarget,
}
