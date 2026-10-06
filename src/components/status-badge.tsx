import * as React from "react"

import { Badge } from "@/components/ui/badge"

type StatusTone =
  "success" | "warning" | "destructive" | "default" | "secondary" | "soon"

/** Keys are lowercase with single spaces; lookups ignore case and extra whitespace, and read `_` and `-` as spaces. */
const STATUS_TONES: Record<string, StatusTone> = {
  active: "success",
  approved: "success",
  completed: "success",
  connected: "success",
  delivered: "success",
  enabled: "success",
  fulfilled: "success",
  "in stock": "success",
  live: "success",
  paid: "success",
  published: "success",
  verified: "success",
  "awaiting payment": "warning",
  "low stock": "warning",
  "on hold": "warning",
  "partially paid": "warning",
  "partially refunded": "warning",
  pending: "warning",
  "pending payment": "warning",
  "pending review": "warning",
  "ready for pickup": "warning",
  unpaid: "warning",
  "in transit": "default",
  partial: "default",
  processing: "default",
  scheduled: "default",
  shipped: "default",
  blocked: "destructive",
  cancelled: "destructive",
  canceled: "destructive",
  declined: "destructive",
  expired: "destructive",
  failed: "destructive",
  "out of stock": "destructive",
  refunded: "destructive",
  rejected: "destructive",
  suspended: "destructive",
  archived: "secondary",
  disabled: "secondary",
  draft: "secondary",
  inactive: "secondary",
  unfulfilled: "secondary",
  "coming soon": "soon",
}

function normaliseStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim()
}

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "variant"> & {
  status: string
  /** Forces a tone, e.g. for a status the map doesn't know. */
  tone?: StatusTone
  /** Extra or overriding mappings; keys match like `status`, so `on_hold` and `On hold` are the same key. */
  tones?: Record<string, StatusTone>
}

function StatusBadge({
  status,
  tone,
  tones,
  dot = true,
  children,
  ...props
}: StatusBadgeProps) {
  const key = normaliseStatus(status)
  const custom = Object.entries(tones ?? {}).find(
    ([name]) => normaliseStatus(name) === key
  )?.[1]
  const variant = tone ?? custom ?? STATUS_TONES[key] ?? "secondary"

  return (
    <Badge data-status={key} variant={variant} dot={dot} {...props}>
      {children ?? status}
    </Badge>
  )
}

export { StatusBadge, STATUS_TONES, type StatusBadgeProps, type StatusTone }
