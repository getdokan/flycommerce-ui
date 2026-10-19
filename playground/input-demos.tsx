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
          aria-describedby="cname-target-hint"
          value="cname.flycom.shop"
          mono
          copyLabel="Copy CNAME target"
        />
        <FieldDescription id="cname-target-hint">
          Add it as the value of a CNAME record for maisonoriel.com.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="signing-secret">Signing secret</FieldLabel>
        <CopyField
          id="signing-secret"
          aria-describedby="signing-secret-hint"
          value="whsec_8Kq2Vd0rXw7NcT4mLp9sZe1H"
          mono
          disabled
          copyLabel="Copy signing secret"
        />
        <FieldDescription id="signing-secret-hint">
          Save the webhook to get its secret.
        </FieldDescription>
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
          aria-describedby={
            isHexColor(brand) ? undefined : "brand-colour-error"
          }
          value={brand}
          onValueChange={setBrand}
          labels={{ picker: "Pick the brand colour" }}
        />
        {!isHexColor(brand) && (
          <FieldError id="brand-colour-error">{HEX_ERROR}</FieldError>
        )}
      </Field>
      <Field data-invalid={!isHexColor(accent) || undefined}>
        <FieldLabel htmlFor="accent-colour">Accent colour</FieldLabel>
        <ColorInput
          id="accent-colour"
          aria-describedby={
            isHexColor(accent) ? undefined : "accent-colour-error"
          }
          value={accent}
          onValueChange={setAccent}
          labels={{ picker: "Pick the accent colour" }}
        />
        {!isHexColor(accent) && (
          <FieldError id="accent-colour-error">{HEX_ERROR}</FieldError>
        )}
      </Field>
      <Field data-invalid={!invoiceValid || undefined}>
        <FieldLabel htmlFor="invoice-colour" optional>
          Invoice colour
        </FieldLabel>
        <ColorInput
          id="invoice-colour"
          aria-describedby={
            invoiceValid ? "invoice-colour-hint" : "invoice-colour-error"
          }
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
          <FieldDescription id="invoice-colour-hint">
            Used for the top rule, the title and the total. Empty uses your
            brand colour.
          </FieldDescription>
        ) : (
          <FieldError id="invoice-colour-error">{HEX_ERROR}</FieldError>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="email-colour">Email button colour</FieldLabel>
        <ColorInput
          id="email-colour"
          aria-describedby="email-colour-hint"
          value="#155dfc"
          onValueChange={() => {}}
          disabled
          labels={{ picker: "Pick the email button colour" }}
        />
        <FieldDescription id="email-colour-hint">
          Set by your email theme.
        </FieldDescription>
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

const BRAND_COLOUR = "#1f2a44"

type BrandImageValue = ImageUploadFieldValue & { preview?: React.ReactNode }

const rejectionMessage = ([rejection]: FileRejection[]) =>
  rejection.reason === "size"
    ? `${rejection.file.name} is ${(rejection.file.size / 1024 / 1024).toFixed(1)} MB. The limit is 25 MB.`
    : `${rejection.file.name} is not a PNG, JPG, SVG or WebP image.`

function BrandImageField({
  id,
  label,
  hint,
  pickerTitle,
  initial = null,
}: {
  id: string
  label: string
  hint: string
  pickerTitle: string
  initial?: BrandImageValue | null
}) {
  const [image, setImage] = React.useState(initial)
  const [error, setError] = React.useState<string>()
  const [uploading, setUploading] = React.useState<File | null>(null)
  const [picking, setPicking] = React.useState(false)
  const src = image?.src

  React.useEffect(() => {
    if (!uploading) return
    const timer = setTimeout(() => {
      setImage({
        src: URL.createObjectURL(uploading),
        name: uploading.name,
        size: uploading.size,
      })
      setUploading(null)
    }, 1200)
    return () => clearTimeout(timer)
  }, [uploading])

  React.useEffect(() => {
    if (!src?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(src)
  }, [src])

  const use = (next: BrandImageValue | null) => {
    setImage(next)
    setError(undefined)
  }

  return (
    <>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <ImageUploadField
          id={id}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          label={label}
          value={image}
          preview={image?.preview}
          previewBackground={BRAND_COLOUR}
          maxSize={MAX_SIZE}
          invalid={Boolean(error)}
          loading={uploading !== null}
          onFiles={([file]) => {
            setError(undefined)
            setUploading(file)
          }}
          onReject={(rejections) => setError(rejectionMessage(rejections))}
          onRemove={() => use(null)}
          onChooseExisting={() => setPicking(true)}
        />
        {error ? (
          <FieldError id={`${id}-error`}>{error}</FieldError>
        ) : (
          <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>
        )}
      </Field>
      <MediaPickerDialog
        open={picking}
        onOpenChange={setPicking}
        defaultTab="library"
        accept="image/*"
        maxSize={MAX_SIZE}
        items={LIBRARY}
        labels={{ title: pickerTitle, select: "Use image" }}
        onConfirm={([item]) => {
          if (item) use({ src: item.url, name: item.name, size: item.size })
          setPicking(false)
        }}
      />
    </>
  )
}

export function ImageUploadFieldDemo() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <BrandImageField
        id="logo-image"
        label="Logo"
        hint="Shown in your storefront header and emails."
        pickerTitle="Choose a logo"
        initial={{
          name: "maison-oriel-wordmark.svg",
          size: 48 * 1024,
          preview: WORDMARK,
        }}
      />
      <BrandImageField
        id="icon-image"
        label="Icon"
        hint="Used as the browser tab icon and app icon."
        pickerTitle="Choose an icon"
      />
      <Field>
        <FieldLabel htmlFor="share-image">Open Graph image</FieldLabel>
        <ImageUploadField
          id="share-image"
          aria-describedby="share-image-hint"
          label="Open Graph image"
          value={{
            src: "https://picsum.photos/seed/fc-brand-0/1200/630",
            name: "atelier-boutique.jpg",
            size: 412 * 1024,
          }}
          loading
          onFiles={() => {}}
        />
        <FieldDescription id="share-image-hint">
          1200 × 630 px works best.
        </FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="invoice-logo">Invoice logo</FieldLabel>
        <ImageUploadField
          id="invoice-logo"
          aria-describedby="invoice-logo-error"
          label="Invoice logo"
          maxSize={2 * 1024 * 1024}
          invalid
          onFiles={() => {}}
        />
        <FieldError id="invoice-logo-error">
          maison-oriel-hero-banner.png is 3.4 MB. The limit is 2 MB.
        </FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="email-header">Email header</FieldLabel>
        <ImageUploadField
          id="email-header"
          aria-describedby="email-header-hint"
          label="Email header"
          value={{
            src: LOGO,
            name: "maison-oriel-wordmark.svg",
            size: 48 * 1024,
          }}
          previewBackground={BRAND_COLOUR}
          previewFit="contain"
          disabled
          onFiles={() => {}}
          onRemove={() => {}}
          onChooseExisting={() => {}}
        />
        <FieldDescription id="email-header-hint">
          Set by your email theme.
        </FieldDescription>
      </Field>
    </div>
  )
}
