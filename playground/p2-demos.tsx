import * as React from "react"
import { toast } from "sonner"

import {
  AsyncCombobox,
  Button,
  CopyButton,
  DatePicker,
  DateRangePicker,
  Dropzone,
  Field,
  FieldDescription,
  FieldLabel,
  Icon,
  IconChip,
  ImageWithFallback,
  InfoTooltip,
  LoadingOverlay,
  NavTabs,
  NavTabsLink,
  PasswordInput,
  RadioCard,
  RadioCardGroup,
  Rating,
  StatCard,
  SwitchField,
  TagInput,
  type DateRange,
} from "@/index"

type Vendor = { id: string; name: string; city: string }

const VENDORS: Vendor[] = [
  { id: "1", name: "Fashion BD", city: "Dhaka" },
  { id: "2", name: "City Music Ltd.", city: "Chattogram" },
  { id: "3", name: "Toy's King Store", city: "Sylhet" },
  { id: "4", name: "Winter King", city: "Khulna" },
  { id: "5", name: "Cold Solution", city: "Rajshahi" },
  { id: "6", name: "Somrat Fashion", city: "Dhaka" },
  { id: "7", name: "GreenVita", city: "Barishal" },
]

async function searchVendors(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const q = query.toLowerCase()
  return VENDORS.filter((v) => v.name.toLowerCase().includes(q))
}

export function AsyncComboboxDemo() {
  const [vendor, setVendor] = React.useState<Vendor | null>(null)
  return (
    <Field className="w-full sm:w-80">
      <FieldLabel htmlFor="vendor">Vendor</FieldLabel>
      <AsyncCombobox
        id="vendor"
        className="w-full"
        value={vendor}
        onValueChange={setVendor}
        loadOptions={searchVendors}
        defaultOptions={VENDORS.slice(0, 3)}
        getOptionLabel={(v) => v.name}
        getOptionValue={(v) => v.id}
        renderOption={(v) => (
          <span className="flex w-full justify-between gap-3">
            {v.name}
            <span className="text-muted-foreground">{v.city}</span>
          </span>
        )}
        placeholder="Search vendors"
      />
      <FieldDescription>
        Results load from a fake API with a 600ms delay.
      </FieldDescription>
    </Field>
  )
}

export function TagInputDemo() {
  const [tags, setTags] = React.useState(["summer", "cotton"])
  return (
    <Field className="w-full sm:w-96">
      <FieldLabel htmlFor="product-tags">Product tags</FieldLabel>
      <TagInput
        id="product-tags"
        value={tags}
        onValueChange={setTags}
        placeholder="Type and press Enter"
      />
      <FieldDescription>
        Enter or comma adds a tag; Backspace removes the last one.
      </FieldDescription>
    </Field>
  )
}

export function PasswordInputDemo() {
  return (
    <Field className="w-full sm:w-80">
      <FieldLabel htmlFor="password" required>
        Password
      </FieldLabel>
      <PasswordInput id="password" defaultValue="hunter2-secret" />
    </Field>
  )
}

export function RadioCardDemo() {
  return (
    <RadioCardGroup defaultValue="physical" className="w-full">
      <RadioCard
        value="physical"
        title="Physical product"
        description="A physical product that requires shipping"
      />
      <RadioCard
        value="digital"
        title="Digital product"
        description="A virtual or downloadable product"
      />
    </RadioCardGroup>
  )
}

export function SwitchFieldDemo() {
  const [saving, setSaving] = React.useState(false)
  const [reviews, setReviews] = React.useState(true)
  return (
    <div className="w-full">
      <SwitchField
        title="Product reviews"
        description="Let customers rate products they bought."
        checked={reviews}
        loading={saving}
        onCheckedChange={async (value) => {
          setSaving(true)
          await new Promise((resolve) => setTimeout(resolve, 700))
          setReviews(value)
          setSaving(false)
        }}
      />
      <SwitchField
        title="Questions & answers"
        description="Show a Q&A section on product pages."
        defaultChecked
      />
      <SwitchField title="Vacation mode" />
    </div>
  )
}

export function NavTabsDemo() {
  const [active, setActive] = React.useState("general")
  const tabs = [
    ["general", "General"],
    ["shipping", "Shipping"],
    ["tax", "Tax"],
    ["seo", "SEO"],
  ] as const
  return (
    <div className="flex flex-col gap-4">
      {(["line", "segmented"] as const).map((variant) => (
        <NavTabs
          key={variant}
          variant={variant}
          aria-label={`Settings (${variant})`}
        >
          {tabs.map(([id, label]) => (
            <NavTabsLink
              key={id}
              href={`#nav-tabs`}
              active={active === id}
              onClick={(event) => {
                event.preventDefault()
                setActive(id)
              }}
            >
              {label}
            </NavTabsLink>
          ))}
        </NavTabs>
      ))}
    </div>
  )
}

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>()
  const [dateTime, setDateTime] = React.useState<Date | undefined>(
    () => new Date()
  )
  const [range, setRange] = React.useState<DateRange | undefined>()
  return (
    <div className="grid w-full gap-5 sm:grid-cols-3">
      <Field>
        <FieldLabel htmlFor="publish-date">Publish date</FieldLabel>
        <DatePicker id="publish-date" value={date} onValueChange={setDate} />
      </Field>
      <Field>
        <FieldLabel htmlFor="sale-ends">Sale ends</FieldLabel>
        <DatePicker
          id="sale-ends"
          withTime
          value={dateTime}
          onValueChange={setDateTime}
          disabledDays={{ before: new Date() }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="report-range">Report period</FieldLabel>
        <DateRangePicker
          id="report-range"
          className="w-full"
          value={range}
          onValueChange={setRange}
        />
      </Field>
    </div>
  )
}

export function StatCardDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <StatCard
        hero
        label="Gross sales"
        value="$34,500"
        delta={50}
        deltaNote="vs last month"
        icon={<Icon name="payouts" />}
        action={<InfoTooltip content="Sales before refunds, fees and tax." />}
      />
      <StatCard
        label="Orders"
        value="280"
        delta={-12}
        deltaNote="vs last month"
        icon={<Icon name="orders" />}
      />
      <StatCard
        label="New vendors"
        value="4"
        delta={0}
        icon={<Icon name="vendors" />}
        sub="2 waiting for approval"
      />
    </div>
  )
}

export function IconChipDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <IconChip size="sm"><Icon name="orders" /></IconChip>
        <IconChip><Icon name="orders" /></IconChip>
        <IconChip size="lg"><Icon name="orders" /></IconChip>
        <IconChip size="xl"><Icon name="orders" /></IconChip>
        <IconChip shape="round"><Icon name="orders" /></IconChip>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <IconChip tone="grey"><Icon name="settings" /></IconChip>
        <IconChip tone="primary" shape="round"><Icon name="payouts" /></IconChip>
        <IconChip tone="success" shape="round"><Icon name="check" /></IconChip>
        <IconChip tone="warning" shape="round"><Icon name="warning" /></IconChip>
        <IconChip tone="destructive" shape="round"><Icon name="delete" /></IconChip>
        <IconChip tone="soon" shape="round"><Icon name="vendors" /></IconChip>
      </div>
      <div className="flex max-w-md items-center gap-3 rounded-xl bg-card p-5 shadow-card">
        <IconChip tone="grey"><Icon name="vendors" /></IconChip>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Vendor approval</p>
          <p className="text-sm text-muted-foreground">Review new vendors before they can sell.</p>
        </div>
      </div>
    </div>
  )
}

export function DropzoneDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  return (
    <div className="flex w-full flex-col gap-3">
      <Dropzone
        accept="image/*,.pdf"
        maxSize={2 * 1024 * 1024}
        description="PNG, JPG or PDF up to 2 MB"
        onFiles={(accepted) => setFiles((prev) => [...prev, ...accepted])}
        onReject={(rejections) =>
          rejections.forEach(({ file, reason }) =>
            toast.error(
              `${file.name}: ${reason === "size" ? "larger than 2 MB" : reason === "type" ? "unsupported type" : "too many files"}`
            )
          )
        }
      />
      {files.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="text-muted-foreground">
              {file.name} · {Math.round(file.size / 1024)} KB
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CopyButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-control border px-2.5 py-1.5 text-sm">
        trendy.flycommerce.com
      </code>
      <CopyButton value="https://trendy.flycommerce.com" label="Copy URL" />
      <CopyButton
        value="fc_demo_0123456789abcdef"
        iconOnly
        label="Copy API key"
      />
    </div>
  )
}

export function InfoTooltipDemo() {
  return (
    <div className="flex items-center gap-1.5 text-sm font-[560]">
      Net revenue
      <InfoTooltip content="Gross sales minus refunds, commission and fees." />
    </div>
  )
}

export function LoadingOverlayDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        variant="outline"
        className="self-start"
        onClick={() => {
          setLoading(true)
          setTimeout(() => setLoading(false), 1500)
        }}
      >
        Refresh for 1.5s
      </Button>
      <LoadingOverlay loading={loading} className="rounded-xl border p-5">
        <p className="text-sm">
          Store settings load here. While loading, the content dims, can&apos;t
          be clicked, and a spinner shows without shifting the layout.
        </p>
      </LoadingOverlay>
    </div>
  )
}

export function RatingDemo() {
  const [value, setValue] = React.useState(4)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Rating value={4.5} label="Average rating" />
        <span className="text-muted-foreground">4.5 · 128 reviews</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Rating
          value={value}
          onValueChange={setValue}
          size="lg"
          label="Your rating"
        />
        <span className="text-muted-foreground">Your rating: {value}</span>
      </div>
    </div>
  )
}

export function ImageDemo() {
  return (
    <div className="flex flex-wrap items-end gap-4 text-xs text-muted-foreground">
      <figure className="flex flex-col gap-1.5">
        <ImageWithFallback
          src="https://github.com/shadcn.png"
          alt="Store logo"
          containerClassName="size-16"
        />
        Loaded
      </figure>
      <figure className="flex flex-col gap-1.5">
        <ImageWithFallback
          src="https://example.invalid/missing.png"
          alt="Missing product photo"
          containerClassName="size-16"
        />
        Broken URL
      </figure>
      <figure className="flex flex-col gap-1.5">
        <ImageWithFallback
          alt="No image"
          aspectRatio="16 / 9"
          containerClassName="w-40"
        />
        No src, 16:9
      </figure>
    </div>
  )
}
