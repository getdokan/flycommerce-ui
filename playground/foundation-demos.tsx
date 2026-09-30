const TYPE_SCALE = [
  ["type-page-title", "Page title", "24 / 700", "One per screen"],
  ["type-overview-value", "$12,480.00", "24 / 600", "Report overview figure"],
  ["type-kpi-value", "280 orders", "18 / 700", "KPI tile value"],
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
