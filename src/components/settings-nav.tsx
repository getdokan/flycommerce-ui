"use client"

import * as React from "react"
import { cn } from "cn"

import { Icon, type IconName } from "@/components/icon"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Kbd } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SettingsNavItem = {
  id: string
  label: string
  href: string
  /** An `<Icon>` name, or your own icon element. */
  icon?: IconName | React.ReactElement
  /** Extra terms the filter matches, e.g. `["vat"]` for Taxes. */
  keywords?: string[]
}

type SettingsNavGroup = {
  id: string
  label: string
  items: SettingsNavItem[]
}

type SettingsNavLinkProps = {
  href: string
  className: string
  "aria-current"?: "page"
  children: React.ReactNode
}

type SettingsNavLabels = {
  nav?: string
  filter?: string
  clear?: string
  results?: (count: number) => string
  noMatch?: (query: string) => string
  jump?: string
}

type SettingsNavProps = Omit<React.ComponentProps<"div">, "children"> & {
  groups: SettingsNavGroup[]
  /** `id` of the current page's item: highlighted in the rail, selected in the jump menu. */
  activeId?: string
  /** Renders each item's link, e.g. your router's `Link` with these props spread on it. Defaults to `<a>`. */
  renderLink?: (
    item: SettingsNavItem,
    props: SettingsNavLinkProps
  ) => React.ReactNode
  /** Called when an item is picked in the jump menu. Defaults to `window.location.assign(item.href)`, a full page load: pass your router's navigate when `renderLink` renders router links. */
  onNavigate?: (item: SettingsNavItem) => void
  /** Opt-in key, e.g. "/", that focuses the filter from anywhere on the page, except while typing in a field. Off by default, so it never takes a key from the app's own search. */
  shortcutKey?: string | false
  labels?: SettingsNavLabels
  /** The settings page. Beside the rail from a 56rem-wide area; below the jump menu when narrower. */
  children?: React.ReactNode
}

const DEFAULT_LABELS: Required<SettingsNavLabels> = {
  nav: "Settings",
  filter: "Find a setting",
  clear: "Clear search",
  results: (count) => (count === 1 ? "1 setting" : `${count} settings`),
  noMatch: (query) => `No setting matches “${query}”.`,
  jump: "Jump to section",
}

const normalize = (text: string) => text.toLowerCase().replace(/[-_]/g, " ")

function renderAnchor(_item: SettingsNavItem, props: SettingsNavLinkProps) {
  return <a {...props} />
}

function navigateTo(item: SettingsNavItem) {
  window.location.assign(item.href)
}

/** Two-pane settings area: a grouped, filterable rail beside the page, a jump menu on narrow screens. */
function SettingsNav({
  groups,
  activeId,
  renderLink = renderAnchor,
  onNavigate = navigateTo,
  shortcutKey = false,
  labels: labelsProp,
  className,
  children,
  ...props
}: SettingsNavProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const id = React.useId()
  const filterRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const needle = normalize(query.trim())

  const visibleGroups = React.useMemo(
    () =>
      needle
        ? groups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) =>
                normalize(
                  [item.label, group.label, ...(item.keywords ?? [])].join(" ")
                ).includes(needle)
              ),
            }))
            .filter((group) => group.items.length > 0)
        : groups,
    [groups, needle]
  )
  const matches = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0
  )
  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) => item.id === activeId)

  React.useEffect(() => {
    if (!shortcutKey) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== shortcutKey ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
        )
      )
        return
      const filter = filterRef.current
      filter?.focus()
      if (filter && document.activeElement === filter) event.preventDefault()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcutKey])

  const clear = () => {
    setQuery("")
    filterRef.current?.focus()
  }

  return (
    <div
      data-slot="settings-nav"
      className={cn("@container/settings-nav w-full", className)}
      {...props}
    >
      <div className="flex flex-col gap-6 @4xl/settings-nav:flex-row @4xl/settings-nav:items-start @4xl/settings-nav:gap-8">
        <nav
          aria-label={labels.nav}
          className="shrink-0 @4xl/settings-nav:w-64"
        >
          <div
            data-slot="settings-nav-rail"
            className="hidden overflow-hidden rounded-xl bg-card text-card-foreground shadow-card @4xl/settings-nav:block"
          >
            <div className="border-b border-border-subtle p-3">
              <div className="relative">
                <SearchInput
                  ref={filterRef}
                  value={query}
                  onValueChange={setQuery}
                  placeholder={labels.filter}
                  aria-label={labels.filter}
                  aria-keyshortcuts={shortcutKey || undefined}
                  clearLabel={labels.clear}
                />
                {shortcutKey && !query && (
                  <Kbd
                    aria-hidden="true"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2"
                  >
                    {shortcutKey}
                  </Kbd>
                )}
              </div>
              <p
                aria-live="polite"
                className="px-1 type-hint text-muted-foreground not-empty:mt-2"
              >
                {needle ? labels.results(matches) : ""}
              </p>
            </div>
            {visibleGroups.map((group) => (
              <div
                key={group.id}
                className="border-border-subtle px-2.5 py-3 not-first:border-t"
              >
                <p
                  id={`${id}-${group.id}`}
                  className="mb-1.5 px-2 type-group-heading text-muted-foreground"
                >
                  {group.label}
                </p>
                <ul
                  aria-labelledby={`${id}-${group.id}`}
                  className="flex flex-col gap-0.5"
                >
                  {group.items.map((item) => {
                    const active = item.id === activeId
                    return (
                      <li key={item.id}>
                        {renderLink(item, {
                          href: item.href,
                          "aria-current": active ? "page" : undefined,
                          className: cn(
                            "group/settings-nav-item flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                            active
                              ? "bg-primary-subtle font-semibold text-primary-ink"
                              : "text-foreground-secondary hover:bg-muted hover:text-foreground"
                          ),
                          children: (
                            <>
                              {item.icon && (
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors [&_svg]:size-4",
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary text-muted-foreground group-hover/settings-nav-item:text-foreground-secondary"
                                  )}
                                >
                                  {typeof item.icon === "string" ? (
                                    <Icon name={item.icon} />
                                  ) : (
                                    item.icon
                                  )}
                                </span>
                              )}
                              <span className="truncate">{item.label}</span>
                              {active && (
                                <Icon
                                  name="next"
                                  className="ms-auto rtl:rotate-180"
                                />
                              )}
                            </>
                          ),
                        })}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
            {needle && matches === 0 && (
              <div className="flex flex-col items-center gap-1.5 px-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {labels.noMatch(query.trim())}
                </p>
                <Button variant="link" size="sm" onClick={clear}>
                  {labels.clear}
                </Button>
              </div>
            )}
          </div>
          <Field className="@4xl/settings-nav:hidden">
            <FieldLabel htmlFor={`${id}-jump`}>{labels.jump}</FieldLabel>
            <Select
              value={activeItem?.id ?? ""}
              onValueChange={(value) => {
                const item = groups
                  .flatMap((group) => group.items)
                  .find((candidate) => candidate.id === value)
                if (item) onNavigate(item)
              }}
            >
              <SelectTrigger
                id={`${id}-jump`}
                className="w-full"
                onKeyDown={(event) => {
                  if (
                    event.key.length === 1 &&
                    event.key !== " " &&
                    !event.ctrlKey &&
                    !event.altKey &&
                    !event.metaKey
                  )
                    event.preventDefault()
                }}
              >
                <SelectValue placeholder={labels.nav} />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectGroup key={group.id}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </nav>
        {children !== undefined && (
          <div data-slot="settings-nav-content" className="min-w-0 flex-1">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export {
  SettingsNav,
  type SettingsNavGroup,
  type SettingsNavItem,
  type SettingsNavLabels,
  type SettingsNavLinkProps,
  type SettingsNavProps,
}
