import {
  Text,
  TEXT_WEIGHTS,
  type TextTone,
  type TextVariant,
  type TextWeight,
} from "@/index"

const TYPE_SCALE = [
  ["type-page-title", "Page title", "24 / 700", "One per screen"],
  ["type-overview-value", "$12,480.00", "24 / 600", "Report overview figure"],
  ["type-kpi-value", "280 orders", "18 / 700", "KPI tile value"],
  ["type-stat-value", "$1,240.00", "24 / 600", "Label-first stat value"],
  [
    "type-stat-value-sm",
    "$49.00 on 15 November",
    "16 / 600",
    "Label-first stat value as a phrase",
  ],
  [
    "type-card-title",
    "Basic information",
    "15 / 640",
    "Card and dialog titles",
  ],
  ["type-section-label", "Today", "14 / 600", "Block heading"],
  [
    "type-body",
    "Upload your products and start selling right away.",
    "14 / 400",
    "Default body text",
  ],
  [
    "type-row-title",
    "Cash on delivery",
    "13.5 / 560",
    "List row, toggle row, table primary cell",
  ],
  ["type-field-label", "Store name", "12.5 / 560", "Above every input"],
  ["type-kpi-label", "Gross sales", "12 / 400", "Under or beside a metric"],
  [
    "type-hint",
    "Shown on invoices and emails.",
    "11.5 / 400",
    "Under a field, footnotes",
  ],
  ["type-badge", "Published", "11.5 / 600", "Status pills"],
  ["type-table-header", "Product", "11 / 700 · uppercase", "Table headers"],
  [
    "type-group-heading",
    "Admin",
    "10.5 / 650 · uppercase",
    "Dark sidebar group headings",
  ],
] as const

export function TypographyDemo() {
  return (
    <div className="flex w-full flex-col">
      <p className="mb-4 text-sm text-muted-foreground">
        Inter throughout. Use the{" "}
        <code className="rounded bg-muted px-1">type-*</code> utilities for
        size, weight and spacing, and pair them with a colour utility such as{" "}
        <code className="rounded bg-muted px-1">text-foreground</code>.
      </p>
      {TYPE_SCALE.map(([cls, sample, spec, use]) => (
        <div
          key={cls}
          className="grid gap-1 border-b border-border-subtle py-3 last:border-b-0 sm:grid-cols-[1fr_200px] sm:items-baseline sm:gap-4"
        >
          <span className={`${cls} truncate text-foreground`}>{sample}</span>
          <span className="text-xs text-muted-foreground">
            <code className="text-foreground-secondary">{cls}</code> · {spec}
            <span className="block">{use}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

const SCALE_SPECS: [TextVariant, string, string, string][] = [
  ["display", "Display", "96 / 100 · -3.6", "h1"],
  ["h1", "H1", "64 / 72 · -1.7", "h1"],
  ["h2", "H2", "56 / 64 · -1.7", "h2"],
  ["h3", "H3", "48 / 56 · -1", "h3"],
  ["h4", "H4", "40 / 48 · -0.7", "h4"],
  ["h5", "H5", "32 / 40 · -0.5", "h5"],
  ["h6", "H6", "24 / 32 · -0.3", "h6"],
  ["body-l", "Body L", "20 / 28 · -0.2", "p"],
  ["body-m", "Body M", "18 / 26 · -0.2", "p"],
  ["body-s", "Body S", "16 / 24 · -0.2", "p"],
  ["caption-l", "Caption L", "14 / 20 · 0", "span"],
  ["caption-m", "Caption M", "12 / 16 · 0", "span"],
  ["caption-s", "Caption S", "10 / 14 · 0", "span"],
]

const WEIGHT_VALUES: Record<TextWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

const TONE_NOTES: [TextTone, string][] = [
  ["primary", "text-foreground"],
  ["secondary", "text-foreground-secondary"],
  ["muted", "text-muted-foreground"],
  ["brand", "text-primary-ink"],
  ["success", "text-success-strong"],
  ["danger", "text-destructive"],
  ["inherit", "No colour: takes the parent's"],
]

export function TextDemo() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <Text as="p" variant="caption-l" tone="muted">
        The P3 type scale in Inter. Pick a size with{" "}
        <code className="rounded bg-muted px-1">variant</code>, then{" "}
        <code className="rounded bg-muted px-1">weight</code> and{" "}
        <code className="rounded bg-muted px-1">tone</code>; numbers take{" "}
        <code className="rounded bg-muted px-1">numeric</code>. Sizes are listed
        as size / line height · letter spacing, in px. Plain markup uses the
        same sizes as{" "}
        <code className="rounded bg-muted px-1">type-display</code> …{" "}
        <code className="rounded bg-muted px-1">type-caption-s</code>.
      </Text>

      <div className="flex flex-col">
        {SCALE_SPECS.map(([variant, name, spec, element]) => (
          <div
            key={variant}
            className="grid gap-1 border-b border-border-subtle py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-baseline sm:gap-4"
          >
            <Text variant={variant} className="min-w-0 break-words">
              {name}
            </Text>
            <Text
              variant="caption-m"
              tone="muted"
              numeric
              dir="ltr"
              className="flex flex-col"
            >
              <code className="text-foreground-secondary">{variant}</code>
              <span>
                {spec} · {element}
              </span>
            </Text>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Text as="h3" variant="caption-m" weight="semibold" tone="muted">
          Weights
        </Text>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {TEXT_WEIGHTS.map((weight) => (
            <div key={weight} className="flex flex-col">
              <Text variant="body-l" weight={weight}>
                {weight}
              </Text>
              <Text variant="caption-m" tone="muted" numeric>
                {WEIGHT_VALUES[weight]}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Text as="h3" variant="caption-m" weight="semibold" tone="muted">
          Tones
        </Text>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {TONE_NOTES.map(([tone, note]) => (
            <div key={tone} className="flex flex-col">
              <Text tone={tone} weight="medium">
                {tone}
              </Text>
              <Text variant="caption-m" tone="muted">
                {note}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Text as="h3" variant="caption-m" weight="semibold" tone="muted">
          Numbers
        </Text>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <div className="flex flex-col items-end">
            <Text variant="caption-m" tone="muted">
              Default
            </Text>
            <Text variant="body-l" weight="semibold">
              $1,111.11
            </Text>
            <Text variant="body-l" weight="semibold">
              $8,480.50
            </Text>
          </div>
          <div className="flex flex-col items-end">
            <Text variant="caption-m" tone="muted">
              numeric
            </Text>
            <Text variant="body-l" weight="semibold" numeric>
              $1,111.11
            </Text>
            <Text variant="body-l" weight="semibold" numeric>
              $8,480.50
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

const COLOR_GROUPS: [string, [string, string][]][] = [
  [
    "Surfaces",
    [
      ["page", "App canvas"],
      ["background", "Cards, inputs"],
      ["card-header", "Card and table header"],
      ["muted", "Quiet fill"],
      ["sidebar", "Dark chrome"],
    ],
  ],
  [
    "Ink",
    [
      ["foreground", "Headings, body"],
      ["foreground-secondary", "Secondary body"],
      ["muted-foreground", "Meta, descriptions"],
      ["placeholder", "Placeholders, hints"],
    ],
  ],
  [
    "Brand",
    [
      ["primary", "Actions, links, focus"],
      ["primary-hover", "Hover"],
      ["primary-subtle", "Info tint"],
      ["primary-subtle-2", "Row hover, selected"],
    ],
  ],
  [
    "Lines",
    [
      ["border", "Borders, inputs"],
      ["border-subtle", "Dividers"],
    ],
  ],
  [
    "Status",
    [
      ["success", "Success"],
      ["success-subtle", "Success tint"],
      ["warning", "Warning"],
      ["warning-subtle", "Warning tint"],
      ["destructive", "Danger"],
      ["destructive-subtle", "Danger tint"],
      ["soon", "Coming soon"],
    ],
  ],
]

export function ColorsDemo() {
  return (
    <div className="flex w-full flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Use the token, never the hex:{" "}
        <code className="rounded bg-muted px-1">bg-primary</code>,{" "}
        <code className="rounded bg-muted px-1">text-muted-foreground</code>,{" "}
        <code className="rounded bg-muted px-1">border-border</code>. Toggle
        dark mode to see every token switch.
      </p>
      {COLOR_GROUPS.map(([group, tokens]) => (
        <div key={group} className="flex flex-col gap-2">
          <h3 className="type-table-header text-muted-foreground">{group}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {tokens.map(([token, use]) => (
              <div key={token} className="overflow-hidden rounded-lg border">
                <div
                  className="h-12 border-b"
                  style={{ background: `var(--${token})` }}
                />
                <div className="px-2.5 py-2">
                  <div className="truncate text-[12.5px] font-[560]">
                    {token}
                  </div>
                  <div className="truncate text-[11.5px] text-muted-foreground">
                    {use}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
