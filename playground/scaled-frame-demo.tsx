import { ScaledFrame, Text } from "@/index"

const email = `<!doctype html>
<html>
  <body style="margin:0;font-family:system-ui,sans-serif;background:white;color:black">
    <div style="padding:40px 48px">
      <p style="margin:0 0 24px;font-size:20px;font-weight:600">Maison Oriel</p>
      <h1 style="margin:0 0 12px;font-size:28px">Your order is confirmed</h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.5">Hi Amara, thanks for your order #1043. We'll email you again when it ships.</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:12px 0;border-top:1px solid silver">Silk twill scarf, ivory × 1</td><td style="padding:12px 0;border-top:1px solid silver;text-align:right">€120.00</td></tr>
        <tr><td style="padding:12px 0;border-top:1px solid silver">Shipping</td><td style="padding:12px 0;border-top:1px solid silver;text-align:right">€8.00</td></tr>
        <tr><td style="padding:12px 0;border-top:1px solid silver;font-weight:600">Total</td><td style="padding:12px 0;border-top:1px solid silver;text-align:right;font-weight:600">€128.00</td></tr>
      </table>
    </div>
  </body>
</html>`

function StorefrontMock() {
  return (
    <div className="grid gap-6 bg-card p-12">
      <div className="flex items-center justify-between">
        <Text variant="h2" as="p">
          Maison Oriel
        </Text>
        <Text tone="secondary">Shop · Journal · About</Text>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {["Silk scarf", "Linen shirt", "Wool coat"].map((name) => (
          <div key={name} className="grid gap-2">
            <div className="aspect-square rounded-lg bg-muted" />
            <Text>{name}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScaledFrameDemo() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      <div className="grid gap-2">
        <Text variant="caption-m" tone="muted">
          An email at 640, scaled to the column
        </Text>
        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          <ScaledFrame width={640} srcDoc={email} title="Order confirmed" />
        </div>
      </div>
      <div className="grid gap-2">
        <Text variant="caption-m" tone="muted">
          A storefront at 1280, children instead of an iframe
        </Text>
        <div className="overflow-hidden rounded-lg border border-border">
          <ScaledFrame width={1280}>
            <StorefrontMock />
          </ScaledFrame>
        </div>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Text variant="caption-m" tone="muted">
          A phone width with a height cap; the rest scrolls inside
        </Text>
        <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-border">
          <ScaledFrame
            width={375}
            maxHeight="16rem"
            srcDoc={email}
            title="Order confirmed on a phone"
            aria-label="Order confirmed on a phone"
          />
        </div>
      </div>
    </div>
  )
}
