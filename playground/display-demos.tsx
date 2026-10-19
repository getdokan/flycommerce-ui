import {
  SiDhl,
  SiFedex,
  SiPaypal,
  SiShopify,
  SiStripe,
  SiUps,
} from "react-icons/si"

import {
  Badge,
  BrandMark,
  Button,
  ButtonArrow,
  CardBrandMark,
  Icon,
  Tray,
} from "@/index"

export function PillButtonDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button shape="pill">
          Upgrade plan
          <ButtonArrow />
        </Button>
        <Button shape="pill" variant="outline">
          Compare plans
          <ButtonArrow />
        </Button>
        <Button shape="pill" asChild>
          <a href="#pill-button">
            Connect Stripe
            <ButtonArrow />
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button shape="pill" loading>
          Checking with PayPal
          <ButtonArrow />
        </Button>
        <Button shape="pill" disabled>
          Upgrade plan
          <ButtonArrow />
        </Button>
        <Button shape="pill" variant="outline" size="sm">
          Renew plan
        </Button>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button shape="pill">
          Start with Grow
          <ButtonArrow pinned />
        </Button>
        <Button shape="pill" variant="outline">
          Start with Basic
          <ButtonArrow pinned />
        </Button>
      </div>
    </div>
  )
}

const MARK_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const

export function BrandMarkDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        {MARK_SIZES.map((size) => (
          <BrandMark
            key={size}
            size={size}
            fill
            src="https://avatars.githubusercontent.com/u/216758?s=160&v=4"
            label="Mailchimp"
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <BrandMark label="Stripe">
          <SiStripe color="#635BFF" />
        </BrandMark>
        <BrandMark label="PayPal">
          <SiPaypal color="#002991" />
        </BrandMark>
        <BrandMark label="Shopify">
          <SiShopify color="#7AB55C" />
        </BrandMark>
        <BrandMark label="FedEx" className="p-1.5">
          <SiFedex color="#4D148C" />
        </BrandMark>
        <BrandMark label="UPS">
          <SiUps color="#5C3D2E" />
        </BrandMark>
        <BrandMark
          label="DHL"
          className="p-1.5"
          style={{ backgroundColor: "#FFCC00" }}
        >
          <SiDhl color="#D40511" />
        </BrandMark>
      </div>
      <div className="flex max-w-md items-center gap-4 rounded-xl bg-card p-5 shadow-card">
        <BrandMark size="lg" className="p-2.5">
          <SiPaypal color="#002991" />
        </BrandMark>
        <div className="min-w-0 flex-1">
          <p className="type-row-title text-foreground">PayPal</p>
          <p className="text-sm text-muted-foreground">
            PayPal balance and Pay Later
          </p>
        </div>
        <Badge variant="success" dot>
          Connected
        </Badge>
      </div>
    </div>
  )
}

const CARD_BRAND_SAMPLES = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "diners",
  "jcb",
  "unionpay",
  "eftpos_au",
]

export function CardBrandMarkDemo() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-8">
        {CARD_BRAND_SAMPLES.map((brand) => (
          <figure
            key={brand}
            className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle px-2 py-3 text-foreground-secondary"
          >
            <CardBrandMark brand={brand} />
            <figcaption className="type-hint text-muted-foreground">
              {brand}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex max-w-md items-center gap-3 rounded-xl bg-card p-4 shadow-card">
        <CardBrandMark brand="Visa" label="" />
        <div className="min-w-0 flex-1">
          <p className="type-row-title text-foreground">Visa ending in 4242</p>
          <p className="type-hint text-muted-foreground">Expires 12/2027</p>
        </div>
        <Button variant="outline" size="sm">
          Replace
        </Button>
      </div>
    </div>
  )
}

const CARD_NETWORKS = [
  "visa",
  "mastercard",
  "amex",
  "unionpay",
  "discover",
  "jcb",
  "diners",
]

const ATTENTION = [
  {
    store: "Maison Oriel",
    reason: "Payment failed on 14 Oct",
    status: "Suspended",
    action: "Update payment",
  },
  {
    store: "Northwind Goods",
    reason: "Plan ended on 12 Oct",
    status: "Inactive",
    action: "Renew plan",
  },
]

export function TrayDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tray contentClassName="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <BrandMark
            size="lg"
            className="p-2.5"
            style={{ backgroundColor: "#635BFF" }}
          >
            <SiStripe color="#FFFFFF" />
          </BrandMark>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="type-card-title text-foreground">Stripe</h3>
              <Badge>Recommended</Badge>
            </div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Connect Stripe and customers can pay with every major card, Apple
              Pay and Google Pay.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Button shape="pill">
            Connect Stripe
            <ButtonArrow />
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          {CARD_NETWORKS.map((brand) => (
            <CardBrandMark key={brand} brand={brand} size={26} />
          ))}
        </div>
      </Tray>
      <Tray
        tone="destructive"
        header={
          <>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-destructive-strong shadow-1 ring-1 ring-border">
              <Icon name="warning" size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="type-row-title text-foreground">
                2 stores need your attention
              </h3>
              <p className="text-sm text-foreground-secondary">
                Shoppers can’t buy until these are fixed.
              </p>
            </div>
          </>
        }
      >
        <ul className="divide-y divide-border-subtle">
          {ATTENTION.map((row, index) => (
            <li
              key={row.store}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-semibold text-foreground">
                    {row.store}
                  </span>
                  <span className="text-muted-foreground"> · {row.reason}</span>
                </p>
                <Badge variant="destructive">{row.status}</Badge>
              </div>
              <Button
                size="sm"
                shape="pill"
                variant={index === 0 ? "destructive-solid" : "outline"}
                className="w-full sm:w-auto"
              >
                {row.action}
              </Button>
            </li>
          ))}
        </ul>
      </Tray>
      <div className="grid gap-6 md:grid-cols-2">
        <Tray tone="warning" contentClassName="p-5">
          <p className="type-row-title text-foreground">
            Your trial ends in 3 days
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a plan to keep your store open.
          </p>
        </Tray>
        <Tray tone="neutral" contentClassName="p-5">
          <p className="type-row-title text-foreground">
            4 of 5 staff seats used
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Move to Grow to add more.
          </p>
        </Tray>
      </div>
    </div>
  )
}
