import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

const TEXT_VARIANTS = [
  "display",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "body-l",
  "body-m",
  "body-s",
  "caption-l",
  "caption-m",
  "caption-s",
] as const

const TEXT_WEIGHTS = [
  "light",
  "regular",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black",
] as const

type TextVariant = (typeof TEXT_VARIANTS)[number]

type TextWeight = (typeof TEXT_WEIGHTS)[number]

type TextTone =
  "primary" | "secondary" | "muted" | "brand" | "success" | "danger" | "inherit"

const textVariants = cva("", {
  variants: {
    variant: {
      display: "type-display",
      h1: "type-h1",
      h2: "type-h2",
      h3: "type-h3",
      h4: "type-h4",
      h5: "type-h5",
      h6: "type-h6",
      "body-l": "type-body-l",
      "body-m": "type-body-m",
      "body-s": "type-body-s",
      "caption-l": "type-caption-l",
      "caption-m": "type-caption-m",
      "caption-s": "type-caption-s",
    },
    weight: {
      light: "font-light",
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    tone: {
      primary: "text-foreground",
      secondary: "text-foreground-secondary",
      muted: "text-muted-foreground",
      brand: "text-primary-ink",
      success: "text-success-strong",
      danger: "text-destructive",
      inherit: null,
    },
    numeric: {
      true: "tabular-nums",
    },
  },
  defaultVariants: {
    variant: "body-s",
    weight: "regular",
    tone: "primary",
  },
})

const TEXT_ELEMENTS: Record<TextVariant, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "body-l": "p",
  "body-m": "p",
  "body-s": "p",
  "caption-l": "span",
  "caption-m": "span",
  "caption-s": "span",
}

type TextProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
  variant?: TextVariant
  weight?: TextWeight
  tone?: TextTone
  /** Tabular figures, so numbers in columns and counters line up. */
  numeric?: boolean
  /** The element to render; by default h1–h6 for display and headings, p for body text, span for captions. */
  as?: React.ElementType
}

/** Text on the P3 type scale: `variant` (13 sizes), `weight` and `tone`; renders h1–h6, p or span. */
function Text({
  variant = "body-s",
  weight = "regular",
  tone = "primary",
  numeric,
  as,
  className,
  ...props
}: TextProps) {
  const Comp = as ?? TEXT_ELEMENTS[variant]

  return (
    <Comp
      data-slot="text"
      data-variant={variant}
      className={cn(
        textVariants({ variant, weight, tone, numeric }),
        className
      )}
      {...props}
    />
  )
}

export {
  Text,
  textVariants,
  TEXT_VARIANTS,
  TEXT_WEIGHTS,
  type TextProps,
  type TextTone,
  type TextVariant,
  type TextWeight,
}
