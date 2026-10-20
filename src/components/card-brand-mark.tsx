import * as React from "react"
import { cn } from "cn"

import { COLOR_CARD_MARKS } from "@/components/card-brand-mark/color-marks"
import { Icon } from "@/components/icon"

const CARD_NAMES = new Map([
  ["visa", "Visa"],
  ["mastercard", "Mastercard"],
  ["amex", "American Express"],
  ["unionpay", "UnionPay"],
  ["discover", "Discover"],
  ["jcb", "JCB"],
  ["diners", "Diners Club"],
])

const BRAND_ALIASES = new Map([
  ["americanexpress", "amex"],
  ["dinersclub", "diners"],
])

type CardBrandMarkProps = Omit<React.ComponentProps<"svg">, "ref"> & {
  /** As payment APIs return it ("visa", "American Express", "diners_club"); unknown brands show a generic card. */
  brand: string
  /** Height in pixels; the mark is 1.56 times as wide. */
  size?: number
  /** Accessible name; defaults to the brand's name, or "Card" when unknown. Pass "" when the brand is written beside it. */
  label?: string
}

/** Full-colour payment card mark (Visa, Mastercard, Amex…); a generic card for any other brand. */
function CardBrandMark({
  brand,
  size = 24,
  label,
  className,
  style,
  ...props
}: CardBrandMarkProps) {
  const normalized = brand.toLowerCase().replace(/[^a-z]/g, "")
  const id = BRAND_ALIASES.get(normalized) ?? normalized
  const name = CARD_NAMES.get(id)
  const accessibleName = label ?? name ?? "Card"
  const width = Math.round(size * 1.56)
  const shared = {
    "data-slot": "card-brand-mark",
    "data-brand": name ? id : "unknown",
    style: { width, height: size, ...style },
    ...props,
  }

  if (!name)
    return (
      <Icon
        {...shared}
        name="billing"
        label={accessibleName}
        size={size}
        className={cn("shrink-0", className)}
      />
    )

  const Mark = COLOR_CARD_MARKS[id]
  return (
    <Mark
      aria-hidden={accessibleName ? undefined : true}
      aria-label={accessibleName || undefined}
      role={accessibleName ? "img" : undefined}
      width={width}
      height={size}
      className={cn(
        "shrink-0 rounded-sm ring-1 ring-card-brand-ring",
        className
      )}
      {...shared}
    />
  )
}

export { CardBrandMark, type CardBrandMarkProps }
