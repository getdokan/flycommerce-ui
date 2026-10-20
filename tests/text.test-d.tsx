import * as React from "react"

import { Text, TEXT_VARIANTS } from "@/index"

const label = React.createRef<HTMLLabelElement>()
const heading = React.createRef<HTMLHeadingElement>()
const span = React.createRef<HTMLSpanElement>()

export const accepted = [
  <Text as="label" htmlFor="store-name" ref={label} />,
  <Text as="a" href="/settings/billing" target="_blank" />,
  <Text as="time" dateTime="2026-10-20" />,
  <Text variant="h2" ref={heading} />,
  <Text variant="caption-l" ref={span} />,
  <Text tone="default" />,
  ...TEXT_VARIANTS.map((variant) => <Text key={variant} variant={variant} />),
]

export const rejected = [
  // @ts-expect-error a p has no htmlFor
  <Text htmlFor="store-name" />,
  // @ts-expect-error caption-l renders a span, which has no href
  <Text variant="caption-l" href="/settings/billing" />,
  // @ts-expect-error a span has no href
  <Text as="span" href="/settings/billing" />,
  // @ts-expect-error a time has no htmlFor
  <Text as="time" htmlFor="store-name" />,
  // @ts-expect-error a link takes an anchor ref, not a label ref
  <Text as="a" ref={label} />,
  // @ts-expect-error h1 takes a heading ref, not a span ref
  <Text variant="h1" ref={span} />,
  // @ts-expect-error the dark tone is default
  <Text tone="primary" />,
]
