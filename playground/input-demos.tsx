import * as React from "react"

import {
  ColorInput,
  CopyField,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  ImageUploadField,
  MediaPickerDialog,
  type FileRejection,
  type ImageUploadFieldValue,
  type MediaItem,
} from "@/index"

export function CopyFieldDemo() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <CopyField
        label="Callback URL"
        value="https://maison-oriel.flycom.shop/api/payments/paytr/callback"
        mono
        copyLabel="Copy callback URL"
      />
      <CopyField
        label="Vendor redirect URI"
        value="https://maison-oriel.flycom.shop/vendor/settings/payment?gateway=stripe"
        mono
        copyLabel="Copy vendor redirect URI"
      />
      <Field>
        <FieldLabel htmlFor="cname-target">CNAME target</FieldLabel>
        <CopyField
          id="cname-target"
          value="cname.flycom.shop"
          mono
          copyLabel="Copy CNAME target"
        />
        <FieldDescription>
          Add it as the value of a CNAME record for maisonoriel.com.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="signing-secret">Signing secret</FieldLabel>
        <CopyField
          id="signing-secret"
          value="whsec_8Kq2Vd0rXw7NcT4mLp9sZe1H"
          mono
          disabled
          copyLabel="Copy signing secret"
        />
        <FieldDescription>Save the webhook to get its secret.</FieldDescription>
      </Field>
      <CopyField
        aria-label="Sitemap URL"
        value="https://maisonoriel.com/sitemap.xml"
        mono
        copyLabel="Copy sitemap URL"
        containerClassName="sm:col-span-2"
      />
    </div>
  )
}

const HEX_ERROR = "Use 3 or 6 hex digits, like #1F2A44."

const isHexColor = (value: string | null): value is string =>
  value !== null && /^#[0-9a-f]{6}$/.test(value)

export function ColorInputDemo() {
  const [brand, setBrand] = React.useState<string | null>("#1f2a44")
  const [accent, setAccent] = React.useState<string | null>("#c9a4")
  const [invoice, setInvoice] = React.useState<string | null>(null)
  const invoiceValid = invoice === null || isHexColor(invoice)

  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <Field data-invalid={!isHexColor(brand) || undefined}>
        <FieldLabel htmlFor="brand-colour">Brand colour</FieldLabel>
        <ColorInput
          id="brand-colour"
          value={brand}
          onValueChange={setBrand}
          labels={{ picker: "Pick the brand colour" }}
        />
        {!isHexColor(brand) && <FieldError>{HEX_ERROR}</FieldError>}
      </Field>
      <Field data-invalid={!isHexColor(accent) || undefined}>
        <FieldLabel htmlFor="accent-colour">Accent colour</FieldLabel>
        <ColorInput
          id="accent-colour"
          value={accent}
          onValueChange={setAccent}
          labels={{ picker: "Pick the accent colour" }}
        />
        {!isHexColor(accent) && <FieldError>{HEX_ERROR}</FieldError>}
      </Field>
      <Field data-invalid={!invoiceValid || undefined}>
        <FieldLabel htmlFor="invoice-colour" optional>
          Invoice colour
        </FieldLabel>
        <ColorInput
          id="invoice-colour"
          value={invoice}
          onValueChange={setInvoice}
          allowClear
          fallback={isHexColor(brand) ? brand : undefined}
          placeholder={isHexColor(brand) ? brand.slice(1) : undefined}
          labels={{
            picker: "Pick the invoice colour",
            clear: "Use brand colour",
          }}
        />
        {invoiceValid ? (
          <FieldDescription>
            Used for the top rule, the title and the total. Empty uses your
            brand colour.
          </FieldDescription>
        ) : (
          <FieldError>{HEX_ERROR}</FieldError>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="email-colour">Email button colour</FieldLabel>
        <ColorInput
          id="email-colour"
          value="#155dfc"
          onValueChange={() => {}}
          disabled
          labels={{ picker: "Pick the email button colour" }}
        />
        <FieldDescription>Set by your email theme.</FieldDescription>
      </Field>
    </div>
  )
}

const MAX_SIZE = 25 * 1024 * 1024

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M120 46c-6-14-22-24-32-16s0 26 32 18c32 8 42-10 32-18s-26 2-32 16z" fill="none" stroke="white" stroke-width="2.5"/><text x="120" y="92" fill="white" font-family="Georgia, serif" font-size="19" letter-spacing="7" text-anchor="middle">MAISON ORIEL</text></svg>'
)}`

const WORDMARK = (
  <svg viewBox="0 0 240 120" aria-hidden="true" className="w-20">
    <path
      d="M120 46c-6-14-22-24-32-16s0 26 32 18c32 8 42-10 32-18s-26 2-32 16z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <text
      x="120"
      y="92"
      fill="currentColor"
      fontFamily="Georgia, serif"
      fontSize="19"
      letterSpacing="7"
      textAnchor="middle"
    >
      MAISON ORIEL
    </text>
  </svg>
)

const LIBRARY: MediaItem[] = [
  ["boutique-front", "Boutique front"],
  ["autumn-rack", "Autumn rack"],
  ["fabric-swatches", "Fabric swatches"],
  ["studio-vase", "Studio vase"],
  ["brush-texture", "Brush texture"],
  ["showroom", "Showroom"],
].map(([id, title], i) => ({
  id,
  title,
  name: `${id}.jpg`,
  url: `https://picsum.photos/seed/fc-brand-${i}/1200/900`,
  thumbnailUrl: `https://picsum.photos/seed/fc-brand-${i}/360/300`,
  mimeType: "image/jpeg",
  size: 240_000 + i * 51_000,
}))

const BRAND_IMAGES = [
  {
    slot: "logo",
    label: "Logo",
    hint: "Shown in your storefront header and emails.",
    labels: { input: "Upload logo", remove: "Remove logo" },
    pickerTitle: "Choose a logo",
  },
  {
    slot: "icon",
    label: "Icon",
    hint: "Used as the browser tab icon and app icon.",
    labels: { input: "Upload icon", remove: "Remove icon" },
    pickerTitle: "Choose an icon",
  },
] as const

type BrandImage = (typeof BRAND_IMAGES)[number]["slot"]

type BrandImageValue = ImageUploadFieldValue & { preview?: React.ReactNode }

const rejectionMessage = ([rejection]: FileRejection[]) =>
  rejection.reason === "size"
    ? `${rejection.file.name} is ${(rejection.file.size / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.`
    : `${rejection.file.name} is not a PNG, JPG, SVG or WebP image.`

export function ImageUploadFieldDemo() {
  const brandColour = "#1f2a44"
  const [images, setImages] = React.useState<
    Record<BrandImage, BrandImageValue | null>
  >({
    logo: {
      name: "maison-oriel-wordmark.svg",
      size: 48 * 1024,
      preview: WORDMARK,
    },
    icon: null,
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<BrandImage, string>>
  >({})
  const [uploading, setUploading] = React.useState<BrandImage | null>(null)
  const [picking, setPicking] = React.useState<BrandImage | null>(null)

  const setImage = (slot: BrandImage, image: BrandImageValue | null) => {
    setImages((current) => ({ ...current, [slot]: image }))
    setErrors((current) => ({ ...current, [slot]: undefined }))
  }

  const upload = (slot: BrandImage, [file]: File[]) => {
    setUploading(slot)
    setTimeout(() => {
      setImage(slot, {
        src: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      })
      setUploading(null)
    }, 1200)
  }

  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      {BRAND_IMAGES.map(({ slot, label, hint, labels }) => (
        <Field key={slot} data-invalid={errors[slot] ? true : undefined}>
          <FieldLabel>{label}</FieldLabel>
          <ImageUploadField
            value={images[slot]}
            preview={images[slot]?.preview}
            previewBackground={brandColour}
            maxSize={MAX_SIZE}
            invalid={Boolean(errors[slot])}
            loading={uploading === slot}
            onFiles={(files) => upload(slot, files)}
            onReject={(rejections) =>
              setErrors((current) => ({
                ...current,
                [slot]: rejectionMessage(rejections),
              }))
            }
            onRemove={() => setImage(slot, null)}
            onChooseExisting={() => setPicking(slot)}
            labels={labels}
          />
          {errors[slot] ? (
            <FieldError>{errors[slot]}</FieldError>
          ) : (
            <FieldDescription>{hint}</FieldDescription>
          )}
        </Field>
      ))}
      <Field>
        <FieldLabel>Open Graph image</FieldLabel>
        <ImageUploadField
          value={{
            src: "https://picsum.photos/seed/fc-brand-0/1200/630",
            name: "atelier-boutique.jpg",
            size: 412 * 1024,
          }}
          loading
          onFiles={() => {}}
          labels={{ input: "Upload share image" }}
        />
        <FieldDescription>1200 × 630 px works best.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel>Invoice logo</FieldLabel>
        <ImageUploadField
          maxSize={2 * 1024 * 1024}
          invalid
          onFiles={() => {}}
          labels={{ input: "Upload invoice logo" }}
        />
        <FieldError>
          maison-oriel-hero-banner.png is 3.4 MB. The limit is 2 MB.
        </FieldError>
      </Field>
      <Field>
        <FieldLabel>Email header</FieldLabel>
        <ImageUploadField
          value={{
            src: LOGO,
            name: "maison-oriel-wordmark.svg",
            size: 48 * 1024,
          }}
          previewBackground={brandColour}
          previewFit="contain"
          disabled
          onFiles={() => {}}
          onRemove={() => {}}
          onChooseExisting={() => {}}
          labels={{ remove: "Remove email header" }}
        />
        <FieldDescription>Set by your email theme.</FieldDescription>
      </Field>
      <MediaPickerDialog
        open={picking !== null}
        onOpenChange={(open) => {
          if (!open) setPicking(null)
        }}
        defaultTab="library"
        accept="image/*"
        maxSize={MAX_SIZE}
        items={LIBRARY}
        labels={{
          title: BRAND_IMAGES.find((image) => image.slot === picking)
            ?.pickerTitle,
          select: "Use image",
        }}
        onConfirm={([item]) => {
          if (item && picking)
            setImage(picking, {
              src: item.url,
              name: item.name,
              size: item.size,
            })
          setPicking(null)
        }}
      />
    </div>
  )
}
