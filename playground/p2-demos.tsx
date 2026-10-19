import * as React from "react"
import { toast } from "sonner"

import {
  AsyncCombobox,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CheckboxCard,
  CheckboxCardGroup,
  CopyButton,
  DatePicker,
  DateRangePicker,
  Dropzone,
  Field,
  FieldCount,
  FieldDescription,
  FieldLabel,
  Icon,
  IconChip,
  ImageWithFallback,
  InfoTooltip,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  LoadingOverlay,
  NavTabs,
  NavTabsLink,
  PasswordInput,
  Progress,
  RadioCard,
  RadioCardGroup,
  Rating,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatGroup,
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

export function TitleField({
  id,
  label,
  limit,
  defaultValue,
}: {
  id: string
  label: string
  limit: number
  defaultValue: string
}) {
  const [title, setTitle] = React.useState(defaultValue)
  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldCount id={`${id}-count`} count={title.length} limit={limit} />
      </div>
      <Input
        id={id}
        aria-describedby={`${id}-count`}
        value={title}
        maxLength={100}
        onChange={(event) => setTitle(event.target.value)}
      />
    </Field>
  )
}

export function PasswordInputDemo() {
  return (
    <>
      <Field className="w-full sm:w-80">
        <FieldLabel htmlFor="password" required>
          Password
        </FieldLabel>
        <PasswordInput id="password" defaultValue="hunter2-secret" />
      </Field>
      <Field className="w-full sm:w-80">
        <FieldLabel htmlFor="secret-key">Secret key</FieldLabel>
        <PasswordInput
          id="secret-key"
          savedSuffix="4f2a"
          showLabel="Show secret"
          hideLabel="Hide secret"
        />
        <FieldDescription icon={<Icon name="info" />}>
          Saved, ends in 4f2a. Leave blank to keep it.
        </FieldDescription>
      </Field>
    </>
  )
}

export function RadioCardDemo() {
  const [rate, setRate] = React.useState("flat")
  const [warranty, setWarranty] = React.useState("custom")
  const [methods, setMethods] = React.useState(["couriers", "manual"])
  const setMethod = (method: string, on: boolean) =>
    setMethods((current) =>
      on ? [...current, method] : current.filter((m) => m !== method)
    )

  return (
    <div className="flex w-full flex-col gap-6">
      <RadioCardGroup defaultValue="physical" className="w-full">
        <RadioCard
          value="physical"
          title="Physical product"
          badge={
            <Badge dot variant="success">
              Active
            </Badge>
          }
          description="A physical product that requires shipping"
        />
        <RadioCard
          value="digital"
          title="Digital product"
          description="A virtual or downloadable product"
        />
      </RadioCardGroup>

      <RadioCardGroup
        value={rate}
        onValueChange={setRate}
        aria-label="Shipping rate"
        className="w-full"
      >
        <RadioCard
          value="flat"
          title="Flat rate"
          description="One price for every order"
          details={
            rate === "flat" && (
              <Field className="sm:max-w-xs">
                <FieldLabel htmlFor="flat-rate">Rate per order</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="flat-rate"
                    inputMode="decimal"
                    defaultValue="4.99"
                  />
                </InputGroup>
              </Field>
            )
          }
        />
        <RadioCard
          value="free"
          title="Free shipping"
          description="Customers pay nothing for delivery"
        />
      </RadioCardGroup>

      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>Refund shipping</CardTitle>
          <CardDescription>
            Who bears the shipping cost when an order is refunded.
          </CardDescription>
        </CardHeader>
        <CardContent flush>
          <RadioCardGroup
            variant="rows"
            defaultValue="customer"
            aria-label="Refund shipping"
          >
            <RadioCard
              value="customer"
              title="Customer"
              badge={<Badge variant="success">Active</Badge>}
              description="Shipping is non-refundable. The customer bears it and it is never returned on a refund."
            />
            <RadioCard
              value="system"
              title="System (platform absorbs)"
              description="Shipping is refunded to the customer and the platform absorbs the cost. The vendor keeps it."
            />
            <RadioCard
              value="vendor"
              title="Vendor"
              description="Shipping is refunded to the customer and deducted back from the vendor."
            />
          </RadioCardGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>Warranty</CardTitle>
          <CardDescription>
            What this product promises after the sale.
          </CardDescription>
        </CardHeader>
        <CardContent flush>
          <RadioCardGroup
            variant="rows"
            value={warranty}
            onValueChange={setWarranty}
            aria-label="Warranty"
          >
            <RadioCard
              value="inherit"
              title="Use default"
              description="From the brand or store default: 1-year limited warranty."
            />
            <RadioCard
              value="custom"
              title="Choose a policy"
              description="Pick a specific policy for this product."
              details={
                warranty === "custom" && (
                  <Field className="sm:max-w-sm">
                    <FieldLabel htmlFor="warranty-policy" required>
                      Warranty policy
                    </FieldLabel>
                    <Select defaultValue="extended">
                      <SelectTrigger id="warranty-policy" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limited">
                          1-year limited warranty
                        </SelectItem>
                        <SelectItem value="extended">
                          2-year extended warranty
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }
            />
            <RadioCard
              value="none"
              title="No warranty"
              description="Don’t show a warranty."
            />
          </RadioCardGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>How orders are paid</CardTitle>
          <CardDescription>
            When an agent prepares a checkout, this decides where the shopper
            pays.
          </CardDescription>
        </CardHeader>
        <CardContent flush>
          <RadioCardGroup
            variant="rows"
            defaultValue="handoff"
            aria-label="How orders are paid"
          >
            <RadioCard
              value="handoff"
              title="The shopper confirms and pays on your checkout"
              badge={<Badge variant="secondary">Active</Badge>}
              description="The agent hands the shopper a checkout link. Your payment methods, taxes and fraud checks apply as usual."
            />
            <RadioCard
              value="mandate"
              disabled
              className="opacity-60"
              title="Autonomous purchase with a signed mandate"
              badge={<Badge variant="soon">Not available yet</Badge>}
              description="Needs verified AP2 (Agent Payments Protocol) mandates, which agents can’t send yet. Orders are refused rather than charged."
            />
          </RadioCardGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>Fulfilment methods</CardTitle>
          <CardDescription>
            How orders may be fulfilled. Vendors pick from what you enable here.
          </CardDescription>
        </CardHeader>
        <CardContent flush>
          <CheckboxCardGroup variant="rows" aria-label="Fulfilment methods">
            <CheckboxCard
              title="Third-party couriers"
              badge={<Badge variant="secondary">Default</Badge>}
              description="Vendors push orders to a connected courier or aggregator."
              checked={methods.includes("couriers")}
              onCheckedChange={(on) => setMethod("couriers", on === true)}
            />
            <CheckboxCard
              title="In-house delivery"
              description="Orders go to the delivery drivers you recruit, pay and settle cash on delivery with."
              disabled
            />
            <CheckboxCard
              title="Manual"
              description="Vendors arrange delivery themselves. Nothing is dispatched automatically."
              checked={methods.includes("manual")}
              onCheckedChange={(on) => setMethod("manual", on === true)}
            />
          </CheckboxCardGroup>
        </CardContent>
      </Card>

      <CheckboxCardGroup aria-label="Sales channels" className="w-full">
        <CheckboxCard
          title="Online store"
          description="Your storefront and checkout"
          defaultChecked
        />
        <CheckboxCard
          title="Point of sale"
          description="Sell in person with the POS app"
        />
      </CheckboxCardGroup>
    </div>
  )
}

export function SwitchFieldDemo() {
  const [saving, setSaving] = React.useState(false)
  const [reviews, setReviews] = React.useState(true)
  const [reporting, setReporting] = React.useState(true)
  const [reportSaving, setReportSaving] = React.useState(false)

  return (
    <div className="flex w-full flex-col gap-6">
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

      <Card>
        <CardHeader className="border-b sm:px-6">
          <CardTitle>Features</CardTitle>
          <CardDescription>
            What AvaTax does for your store. Changes save with the page.
          </CardDescription>
        </CardHeader>
        <CardContent flush className="divide-y divide-border">
          <SwitchField
            variant="row"
            title="Report transactions to AvaTax"
            description="Record completed orders in Avalara for reporting and filing. Off means estimates only."
            checked={reporting}
            loading={reportSaving}
            onCheckedChange={async (value) => {
              setReportSaving(true)
              await new Promise((resolve) => setTimeout(resolve, 700))
              setReporting(value)
              setReportSaving(false)
            }}
          />
          <SwitchField
            variant="row"
            title="Avalara API logging"
            description="Keep request and response payloads for troubleshooting and certification review."
            defaultChecked
          >
            <Field className="sm:max-w-xs">
              <FieldLabel htmlFor="log-retention">Log retention</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="log-retention"
                  inputMode="numeric"
                  defaultValue="30"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>days</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription icon={<Icon name="info" />}>
                Older logs are removed automatically.
              </FieldDescription>
            </Field>
          </SwitchField>
          <SwitchField
            variant="row"
            title="Multi-vendor marketplace transactions"
            badge={<Badge variant="secondary">Recommended</Badge>}
            description="One Avalara document per vendor in a multi-vendor cart, so each vendor is tracked for nexus and filing."
          />
          <SwitchField
            variant="row"
            title="Tax-inclusive pricing"
            description="Only for storefronts that show prices with tax included."
            disabled
          />
        </CardContent>
      </Card>
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
    <div className="flex w-full flex-col gap-6">
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

      <div className="grid w-full gap-4 md:grid-cols-3">
        <StatCard
          layout="label-first"
          label="Total requests"
          value="1,284"
          foot="Since 28 Sep 2026"
        />
        <StatCard
          layout="label-first"
          label="Total tokens"
          value="412,880"
          foot="About 322 per request"
        />
        <StatCard
          layout="label-first"
          label="Credits used"
          value="640 of 1,000"
          foot={<Progress value={64} aria-label="Credits used" />}
        />
      </div>

      <StatGroup
        aria-label="Orders this period"
        className="grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          layout="label-first"
          label="Extra orders"
          value="12"
          foot="So far"
        />
        <StatCard
          layout="label-first"
          label="Charge so far"
          value="$24.00"
          foot="12 × $2.00"
        />
        <StatCard
          layout="label-first"
          label="Projected"
          value="$58.00"
          foot="29 extra by 30 Nov"
        />
        <StatCard
          layout="label-first"
          label="Upgrade point"
          action={
            <InfoTooltip
              label="About upgrade point"
              content="Above this many orders, Growth costs less per month."
            />
          }
          value="1,200"
          foot="Orders per period"
        />
      </StatGroup>

      <Card>
        <CardHeader>
          <CardTitle id="plan-figures">Growth plan</CardTitle>
          <CardDescription>$49.00 a month, billed monthly</CardDescription>
        </CardHeader>
        <StatGroup
          flush
          aria-labelledby="plan-figures"
          className="border-t border-border-subtle sm:grid-cols-2"
        >
          <StatCard
            layout="label-first"
            valueSize="sm"
            label="Next payment"
            value="$49.00 on 15 November"
            foot="Plus extra orders, $12.00 projected"
          />
          <StatCard
            layout="label-first"
            valueSize="sm"
            label="Vendors"
            value="64 of 100"
            foot={<Progress value={64} aria-label="Vendors used" />}
          />
        </StatGroup>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle id="cart-figures">Key figures</CardTitle>
          <CardDescription>1 to 19 October</CardDescription>
        </CardHeader>
        <CardContent flush>
          <StatGroup
            flush
            aria-labelledby="cart-figures"
            className="sm:grid-cols-3"
          >
            <StatCard
              layout="label-first"
              label="Recovered revenue"
              value="$1,240.00"
              foot="Net of refunds"
            />
            <StatCard
              layout="label-first"
              label="Recovery rate"
              value="18.4%"
              foot="23 of 125 abandoned carts"
            />
            <StatCard
              layout="label-first"
              label="Reminders sent"
              value="96"
              foot="Daily at 9:00 AM UTC"
            />
          </StatGroup>
        </CardContent>
      </Card>
    </div>
  )
}

export function IconChipDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <IconChip size="sm">
          <Icon name="orders" />
        </IconChip>
        <IconChip>
          <Icon name="orders" />
        </IconChip>
        <IconChip size="lg">
          <Icon name="orders" />
        </IconChip>
        <IconChip size="xl">
          <Icon name="orders" />
        </IconChip>
        <IconChip shape="round">
          <Icon name="orders" />
        </IconChip>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <IconChip tone="grey">
          <Icon name="settings" />
        </IconChip>
        <IconChip tone="primary" shape="round">
          <Icon name="payouts" />
        </IconChip>
        <IconChip tone="success" shape="round">
          <Icon name="check" />
        </IconChip>
        <IconChip tone="warning" shape="round">
          <Icon name="warning" />
        </IconChip>
        <IconChip tone="destructive" shape="round">
          <Icon name="delete" />
        </IconChip>
        <IconChip tone="soon" shape="round">
          <Icon name="vendors" />
        </IconChip>
      </div>
      <div className="flex max-w-md items-center gap-3 rounded-xl bg-card p-5 shadow-card">
        <IconChip tone="grey">
          <Icon name="vendors" />
        </IconChip>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Vendor approval
          </p>
          <p className="text-sm text-muted-foreground">
            Review new vendors before they can sell.
          </p>
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
