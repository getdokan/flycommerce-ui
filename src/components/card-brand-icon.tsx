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
}

/** Payment card brand mark (Visa, Mastercard, Amex…); a generic card for any other brand. */
function CardBrandIcon({
  brand,
  label,
  size = 24,
  className,
  ...props
}: CardBrandIconProps) {
  const normalized = brand.toLowerCase().replace(/[^a-z]/g, "")
  const id = BRAND_ALIASES.get(normalized) ?? normalized
  const known = CARD_BRANDS.get(id)
  const accessibleName = label ?? known?.name ?? "Card"
  const shared = {
    "data-slot": "card-brand-icon",
    "data-brand": known ? id : "unknown",
    size,
    className: cn("shrink-0", className),
    ...props,
  }

  if (!known?.glyph)
    return <Icon {...shared} name="billing" label={accessibleName} />

  const Glyph = known.glyph
  return (
    <Glyph
      aria-hidden={accessibleName ? undefined : true}
      aria-label={accessibleName || undefined}
      role={accessibleName ? "img" : undefined}
      {...shared}
    />
  )
}

export { CardBrandIcon, type CardBrandIconProps }
