import * as React from "react"
import { cn } from "cn"
import type { IconType } from "react-icons"
import {
  FaCcAmex,
  FaCcDinersClub,
  FaCcDiscover,
  FaCcJcb,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa"

import { COLOR_CARD_MARKS } from "@/components/card-brand-icon/color-marks"
import { Icon } from "@/components/icon"

const CARD_BRANDS = new Map<string, { name: string; glyph?: IconType }>([
  ["visa", { name: "Visa", glyph: FaCcVisa }],
  ["mastercard", { name: "Mastercard", glyph: FaCcMastercard }],
  ["amex", { name: "American Express", glyph: FaCcAmex }],
  ["discover", { name: "Discover", glyph: FaCcDiscover }],
  ["diners", { name: "Diners Club", glyph: FaCcDinersClub }],
  ["jcb", { name: "JCB", glyph: FaCcJcb }],
  ["unionpay", { name: "UnionPay" }],
])

const BRAND_ALIASES = new Map([
  ["americanexpress", "amex"],
  ["dinersclub", "diners"],
])

type CardBrandIconProps = Omit<React.ComponentProps<IconType>, "ref"> & {
  /** As payment APIs return it ("visa", "American Express", "diners_club"); unknown brands show a generic card. */
  brand: string
  /** Accessible name; defaults to the brand's name, or "Card" when unknown. Pass "" when the brand is written beside it. */
  label?: string
  /** `color` draws the network's full-colour card, `size` tall and 1.56 times as wide; `mono` is the one-colour glyph. */
  variant?: "mono" | "color"
}

/** Payment card brand mark (Visa, Mastercard, Amex…) in mono or colour; a generic card otherwise. */
function CardBrandIcon({
  brand,
  label,
  variant = "mono",
  size = 24,
  className,
  ...props
}: CardBrandIconProps) {
  const normalized = brand.toLowerCase().replace(/[^a-z]/g, "")
  const id = BRAND_ALIASES.get(normalized) ?? normalized
  const known = CARD_BRANDS.get(id)
  const accessibleName = label ?? known?.name ?? "Card"
  const a11y = {
    "aria-hidden": accessibleName ? undefined : true,
    "aria-label": accessibleName || undefined,
    role: accessibleName ? "img" : undefined,
  }
  const ColorMark = known && variant === "color" ? COLOR_CARD_MARKS[id] : null

  if (ColorMark) {
    const { title, children, ...svgProps } = props
    return (
      <ColorMark
        {...a11y}
        data-slot="card-brand-icon"
        data-brand={id}
        data-variant="color"
        height={size}
        width={typeof size === "number" ? Math.round(size * 1.56) : undefined}
        className={cn(
          "shrink-0 rounded-sm ring-1 ring-card-brand-ring",
          className
        )}
        {...svgProps}
      >
        {title && <title>{title}</title>}
        {children}
      </ColorMark>
    )
  }

  const shared = {
    "data-slot": "card-brand-icon",
    "data-brand": known ? id : "unknown",
    "data-variant": variant,
    size,
    className: cn("shrink-0", className),
    ...props,
  }

  if (!known?.glyph)
    return <Icon {...shared} name="billing" label={accessibleName} />

  const Glyph = known.glyph
  return <Glyph {...a11y} {...shared} />
}

export { CardBrandIcon, type CardBrandIconProps }
