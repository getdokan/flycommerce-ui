"use client"

import * as React from "react"
import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PersonCellProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** The person's name: shown truncated, in full on hover, and as the initials. Empty shows `placeholder`. */
  name: string
  /** The person's photo; the initials show until it loads, or when it fails. */
  src?: string
  /** The person's stable id (the email only when there is none): one of eight person colours, the same every time. Empty stays grey. */
  colorFrom?: string | number
  /** Drawn instead of the initials, e.g. `<Icon name="vendors" />` for a store with no name. */
  icon?: React.ReactNode
  /** Makes the name a link. */
  href?: string
  /** Called on a plain click of the link, for a client-side router; a modified click (new tab) opens `href` as usual. */
  onNavigate?: () => void
  /** Second line, e.g. the email. */
  description?: React.ReactNode
  /** After the name, e.g. `<Badge variant="secondary">Guest</Badge>`. */
  badge?: React.ReactNode
  /** sm 24px, default 32px, lg 40px. */
  size?: "sm" | "default" | "lg"
  /** Shown when there is no name. */
  placeholder?: React.ReactNode
}

/** The first letters of the first two words, so "Hana Lindqvist" reads "HL" and "dana@example.com" reads "DE". */
function personInitials(name: string) {
  return name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]!.toUpperCase())
    .join("")
}

/** Table cell with a person's avatar (photo or initials in their colour), their name, and an optional second line and badge. */
function PersonCell({
  name,
  src,
  colorFrom,
  icon,
  href,
  onNavigate,
  description,
  badge,
  size = "default",
  placeholder = "—",
  className,
  ...props
}: PersonCellProps) {
  if (!name.trim())
    return (
      <div
        data-slot="person-cell"
        className={cn("text-muted-foreground", className)}
        {...props}
      >
        {placeholder}
      </div>
    )

  const label = href ? (
    <a
      href={href}
      className="truncate rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
      onClick={(event) => {
        if (
          !onNavigate ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        onNavigate()
      }}
    >
      {name}
    </a>
  ) : (
    <span className="truncate">{name}</span>
  )

  return (
    <div
      data-slot="person-cell"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    >
      <Avatar size={size} aria-hidden="true">
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback colorFrom={colorFrom} className="[&>svg]:size-4">
          {icon ?? personInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div
          className="flex min-w-0 items-center gap-2 font-[560] text-foreground"
          title={name}
        >
          {label}
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {description && (
          <div className="truncate text-[12.5px] text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export { PersonCell, personInitials, type PersonCellProps }
