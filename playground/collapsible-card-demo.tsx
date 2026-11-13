import * as React from "react"

import {
  Button,
  CollapsibleCard,
  Icon,
  IconChip,
  SearchInput,
  SwitchField,
  type IconName,
} from "@/index"

type Email = { name: string; description: string; on: boolean }
type Section = {
  id: string
  icon: IconName
  title: string
  description: string
  emails: Email[]
}

const SECTIONS: Section[] = [
  {
    id: "orders",
    icon: "orders",
    title: "Orders and payments",
    description: "Confirmations, payment and shipping updates to shoppers",
    emails: [
      {
        name: "Order processing",
        description: "When you start preparing the order.",
        on: true,
      },
      {
        name: "Order shipped",
        description: "With the carrier and tracking link.",
        on: true,
      },
      {
        name: "Payment reminder",
        description: "When an order is still unpaid.",
        on: false,
      },
    ],
  },
  {
    id: "marketing",
    icon: "marketing",
    title: "Marketing",
    description: "Emails that bring shoppers back",
    emails: [
      {
        name: "Back in stock",
        description: "When a product a shopper asked about returns.",
        on: true,
      },
      {
        name: "Abandoned cart",
        description: "A reminder about items left in a cart.",
        on: false,
      },
    ],
  },
  {
    id: "team",
    icon: "team",
    title: "Store team",
    description: "Alerts to you and your staff",
    emails: [
      {
        name: "New order",
        description: "Each time a shopper places an order.",
        on: true,
      },
      {
        name: "Low stock",
        description: "When a product runs low.",
        on: true,
      },
    ],
  },
]

export function CollapsibleCardDemo() {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    orders: true,
  })
  const [on, setOn] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      SECTIONS.flatMap((section) =>
        section.emails.map((email) => [email.name, email.on])
      )
    )
  )
  const needle = query.trim().toLowerCase()
  const matches = (email: Email, text: string) =>
    email.name.toLowerCase().includes(text)

  const search = (value: string) => {
    setQuery(value)
    const text = value.trim().toLowerCase()
    if (!text) return
    setOpen((current) => ({
      ...current,
      ...Object.fromEntries(
        SECTIONS.filter((section) =>
          section.emails.some((email) => matches(email, text))
        ).map((section) => [section.id, true])
      ),
    }))
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <SearchInput
        containerClassName="sm:w-72"
        placeholder="Search emails"
        aria-label="Search emails"
        value={query}
        onValueChange={search}
      />
      {SECTIONS.map((section) => {
        const emails = section.emails.filter((email) => matches(email, needle))
        if (!emails.length) return null
        const enabled = section.emails.filter((email) => on[email.name]).length

        return (
          <CollapsibleCard
            key={section.id}
            icon={
              <IconChip tone="primary">
                <Icon name={section.icon} />
              </IconChip>
            }
            title={section.title}
            description={section.description}
            meta={`${enabled} of ${section.emails.length} on`}
            actions={
              section.id === "team" ? (
                <Button size="sm" variant="outline">
                  Manage team
                </Button>
              ) : undefined
            }
            open={Boolean(open[section.id])}
            onOpenChange={(value) =>
              setOpen((current) => ({ ...current, [section.id]: value }))
            }
          >
            <div className="divide-y divide-border">
              {emails.map((email) => (
                <SwitchField
                  key={email.name}
                  variant="row"
                  title={email.name}
                  description={email.description}
                  checked={on[email.name]}
                  onCheckedChange={(value) =>
                    setOn((current) => ({ ...current, [email.name]: value }))
                  }
                />
              ))}
            </div>
          </CollapsibleCard>
        )
      })}
      <CollapsibleCard
        size="sm"
        padding="default"
        title="Delivery drivers"
        description="Shown once you add drivers"
        disabled
      >
        Nothing here yet.
      </CollapsibleCard>
    </div>
  )
}
