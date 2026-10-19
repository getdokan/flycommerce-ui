import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const brandMarkVariants = cva(
  "grid shrink-0 place-items-center overflow-hidden rounded-brand-mark bg-brand-mark shadow-brand-mark ring-1 ring-brand-mark-ring [&_svg]:size-full",
  {
    variants: {
      size: {
        xs: "size-5",
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-20",
      },
      fill: {
        true: "",
        false: "p-2",
      },
    },
    defaultVariants: {
      size: "md",
      fill: false,
    },
  }
)

type BrandMarkProps = React.ComponentProps<"span"> &
  VariantProps<typeof brandMarkVariants> & {
    /** Logo image URL; without it, the children (an SVG mark) fill the tile. */
    src?: string
    /** Accessible name, usually the brand; without it the mark is decorative. */
    label?: string
  }

/** A third-party logo on a white tile that stays white in dark mode; `fill` for an app icon. */
function BrandMark({
  src,
  label,
  size = "md",
  fill = false,
  className,
  children,
  ...props
}: BrandMarkProps) {
  return (
    <span
      data-slot="brand-mark"
      data-size={size}
      data-fill={fill || undefined}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn(brandMarkVariants({ size, fill }), className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={cn("size-full", fill ? "object-cover" : "object-contain")}
        />
      ) : (
        <span aria-hidden="true" className="grid size-full place-items-center">
          {children}
        </span>
      )}
    </span>
  )
}

export { BrandMark, brandMarkVariants, type BrandMarkProps }
