import * as React from "react"

import { Button, DeviceFrame, PreviewStage } from "@/index"

const LINES = [
  "Silk twill scarf, ivory",
  "Linen shirt, sand, M",
  "Leather card holder, black",
  "Wool socks, two pairs",
]

function OrderEmail() {
  return (
    <div className="space-y-4 p-5 text-sm">
      <p className="text-xs font-semibold tracking-wide uppercase">
        Maison Oriel
      </p>
      <h3 className="text-lg font-semibold">Thanks for your order, Amara</h3>
      <p>
        We've got order #1043 and we're getting it ready. We'll email you again
        when it ships.
      </p>
      <ul className="divide-y divide-black/10">
        {LINES.map((line) => (
          <li key={line} className="py-3">
            {line}
          </li>
        ))}
      </ul>
      <p>Total paid: €248.00</p>
      <p>
        Questions? Reply to this email and our team in Lyon will get back to you
        within a day.
      </p>
    </div>
  )
}

function StorefrontBanner() {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-4 text-sm">
      <div className="space-y-2">
        <p className="font-semibold">Maison Oriel</p>
        <p className="text-muted-foreground">New season linen is in.</p>
      </div>
      <div className="space-y-3 rounded-lg border border-border bg-background p-3">
        <p>We use cookies to keep your bag and remember your language.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Accept</Button>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DeviceFrameDemo() {
  return (
    <div className="grid w-full gap-6 md:grid-cols-3">
      <PreviewStage className="rounded-lg py-6">
        <DeviceFrame label="Order confirmed on a phone" screen="white">
          <OrderEmail />
        </DeviceFrame>
      </PreviewStage>
      <PreviewStage className="rounded-lg py-6">
        <DeviceFrame
          label="Cookie banner on a phone"
          style={{ "--device-frame-width": "16rem" } as React.CSSProperties}
        >
          <StorefrontBanner />
        </DeviceFrame>
      </PreviewStage>
      <div className="w-40 max-w-full">
        <DeviceFrame label="Order confirmed in a narrow column" screen="white">
          <OrderEmail />
        </DeviceFrame>
      </div>
    </div>
  )
}
