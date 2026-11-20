import * as React from "react"

import {
  CodeEditor,
  type CodeEditorHandle,
  type CodeEditorProblem,
} from "@/components/ui/code-editor"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  MergeTagList,
  type MergeTag,
} from "@/index"

const GOOGLE_TAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8KX42MZQ1P"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8KX42MZQ1P');`

const CART_EMAIL = `<p>Hi {{customer_name}},</p>
<p>You left something in your cart at {{site_name}}.</p>
<p><a href="{{cart_url}}">Finish checking out</a></p>`

const MERGE_TAGS: MergeTag[] = [
  { tag: "customer_name", description: "The shopper's name", sample: "Amara" },
  {
    tag: "site_name",
    description: "Your store's name",
    sample: "Maison Oriel",
  },
  { tag: "cart_url", description: "A link back to the cart" },
]

const PRODUCT_JSON = `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Linen overshirt",
  "offers": { "@type": "Offer", "price": "89.00", "priceCurrency": "USD" }
}`

const BANNER_CSS = `.announcement-bar {
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}`

function findUnclosedScript(code: string): CodeEditorProblem[] {
  let open = 0
  let line = 0
  code.split("\n").forEach((text, index) => {
    const opens = text.match(/<script\b/gi)?.length ?? 0
    const closes = text.match(/<\/script>/gi)?.length ?? 0
    if (opens > closes) line = index + 1
    open += opens - closes
  })
  return open > 0
    ? [
        {
          line,
          message:
            "Add the closing </script> tag. Without it, everything after this snippet stops loading.",
        },
      ]
    : []
}

export function CodeEditorDemo() {
  const [code, setCode] = React.useState(GOOGLE_TAG)
  const problems = findUnclosedScript(code)
  const emailRef = React.useRef<CodeEditorHandle>(null)

  return (
    <div className="flex w-full flex-col gap-6">
      <Field data-invalid={problems.length > 0}>
        <FieldLabel htmlFor="snippet-code" required>
          Code
        </FieldLabel>
        <CodeEditor
          id="snippet-code"
          language="html"
          fileName="head.html"
          placeholder="<!-- Paste your snippet -->"
          maxLength={5000}
          value={code}
          onValueChange={setCode}
          problems={problems}
          invalid={problems.length > 0}
        />
        <FieldError errors={problems} />
      </Field>

      <Field>
        <FieldLabel htmlFor="cart-email">Email body</FieldLabel>
        <MergeTagList
          tags={MERGE_TAGS}
          onInsert={(_, token) => emailRef.current?.insertText(token)}
        />
        <CodeEditor
          ref={emailRef}
          id="cart-email"
          language="html"
          fileName="cart-reminder.html"
          minRows={5}
          maxRows={12}
          defaultValue={CART_EMAIL}
        />
        <FieldDescription>
          Merge tags go in at the cursor. The editor grows to 12 lines, then
          scrolls.
        </FieldDescription>
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="product-json">Read-only</FieldLabel>
          <CodeEditor
            id="product-json"
            language="json"
            fileName="product.json"
            minRows={6}
            readOnly
            value={PRODUCT_JSON}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="banner-css">Disabled</FieldLabel>
          <CodeEditor
            id="banner-css"
            language="css"
            fileName="banner.css"
            minRows={6}
            disabled
            value={BANNER_CSS}
          />
        </Field>
      </div>
    </div>
  )
}
