import * as React from "react"

import { CodeEditor, type CodeEditorHandle } from "@/components/ui/code-editor"
import {
  Field,
  FieldDescription,
  FieldLabel,
  MergeTagList,
  type MergeTag,
  type MergeTagGroup,
  Switch,
} from "@/index"

const ORDER_EMAIL = `<p>Hi {{customer_first_name}},</p>
<p>Thanks for your order {{order_number}} at {{store_name}}.</p>`

const TAGS: MergeTag[] = [
  {
    tag: "customer_first_name",
    description: "The shopper's first name",
    sample: "Amara",
  },
  { tag: "order_number", description: "The order number", sample: "#1043" },
  {
    tag: "order_total",
    description: "What the shopper paid",
    sample: "$186.00",
  },
  {
    tag: "store_name",
    description: "Your store's name",
    sample: "Maison Oriel",
  },
]

const GROUPS: MergeTagGroup[] = [
  { label: "Order", tags: TAGS.slice(1, 3) },
  { label: "Customer", tags: TAGS.slice(0, 1) },
  { label: "Store", tags: TAGS.slice(3) },
]

export function MergeTagListDemo() {
  const editor = React.useRef<CodeEditorHandle>(null)
  const [locked, setLocked] = React.useState(false)
  const insert = (_: MergeTag, token: string) =>
    editor.current?.insertText(token)

  return (
    <div className="grid max-w-2xl gap-8">
      <Field>
        <FieldLabel htmlFor="order-email-body">Email body</FieldLabel>
        <CodeEditor
          ref={editor}
          id="order-email-body"
          language="html"
          fileName="order-placed.html"
          minRows={4}
          maxRows={10}
          defaultValue={ORDER_EMAIL}
          readOnly={locked}
        />
        <MergeTagList
          aria-label="Email body merge tags"
          tags={TAGS}
          onInsert={insert}
          disabled={locked}
        />
        <FieldDescription>
          Hover a tag to see what it turns into. Click it to insert it at the
          cursor.
        </FieldDescription>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={locked} onCheckedChange={setLocked} />
        Read-only (no permission to edit)
      </label>

      <div className="grid gap-2">
        <p id="grouped-tags" className="text-sm font-medium">
          Grouped
        </p>
        <MergeTagList
          aria-labelledby="grouped-tags"
          groups={GROUPS}
          onInsert={insert}
          disabled={locked}
        />
      </div>
    </div>
  )
}
