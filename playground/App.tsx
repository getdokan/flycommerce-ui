import * as React from "react"
import { MoonIcon, SearchIcon, SunIcon } from "lucide-react"
import sources from "virtual:demo-sources"

import {
  Badge,
  Button,
  DirectionProvider,
  Label,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Toaster,
  TooltipProvider,
} from "@/index"
import { demos, groups, type Demo, type Source } from "./demos"
import { CodeBlock } from "./code-block"
import { DemoIcon } from "./demo-icons"
import { useTheme } from "./theme-provider"

const SOURCE_BADGE: Record<
  Source,
  { label: string; variant: "success" | "default" | "secondary" }
> = {
  prototype: { label: "Prototype", variant: "success" },
  figma: { label: "Figma", variant: "default" },
  composite: { label: "Composite", variant: "default" },
  default: { label: "shadcn default", variant: "secondary" },
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr")
  const [pendingOnly, setPendingOnly] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement>(null)
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const visible = demos.filter((d) => {
    if (pendingOnly && d.source !== "default") return false
    const haystack =
      `${d.title} ${d.id} ${d.group} ${d.keywords ?? ""}`.toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing =
        target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if (event.key === "/" && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  const [active, setActive] = React.useState(
    () => window.location.hash.slice(1) || demos[0].id
  )

  React.useEffect(() => {
    // Land on Welcome; replaceState so Back doesn't return to the bare URL.
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#${demos[0].id}`)
    }
    const onHash = () => setActive(window.location.hash.slice(1))
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  useHoldLandingScroll()
  useScrollSpy(visible, setActive)

  return (
    <DirectionProvider dir={dir}>
      <TooltipProvider>
        <div dir={dir}>
          <SidebarProvider>
            <Sidebar collapsible="icon" side={dir === "rtl" ? "right" : "left"}>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                    F
                  </span>
                  <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                    FlyCommerce UI
                  </span>
                </div>
                <div className="relative group-data-[collapsible=icon]:hidden">
                  <SearchIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-sidebar-muted"
                  />
                  <SidebarInput
                    ref={searchRef}
                    type="search"
                    aria-label="Search components"
                    placeholder="Search components"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setQuery("")
                      if (event.key === "Enter" && visible[0]) {
                        window.location.hash = visible[0].id
                      }
                    }}
                    className="h-9 border-sidebar-border bg-sidebar-accent ps-8 pe-8 text-sidebar-foreground placeholder:text-sidebar-muted [&::-webkit-search-cancel-button]:hidden"
                  />
                  <kbd className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 rounded border border-sidebar-border px-1.5 text-[10px] text-sidebar-muted">
                    /
                  </kbd>
                </div>
              </SidebarHeader>
              <SidebarContent>
                {visible.length === 0 && (
                  <p className="px-4 py-3 text-xs text-sidebar-muted group-data-[collapsible=icon]:hidden">
                    No components match “{query}”.
                  </p>
                )}
                {groups
                  .filter((group) => visible.some((d) => d.group === group))
                  .map((group) => (
                    <SidebarGroup key={group}>
                      <SidebarGroupLabel>{group}</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {visible
                            .filter((d) => d.group === group)
                            .map((d) => (
                              <SidebarMenuItem key={d.id}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={active === d.id}
                                  tooltip={d.title}
                                >
                                  <a href={`#${d.id}`}>
                                    <DemoIcon id={d.id} />
                                    <span>{d.title}</span>
                                  </a>
                                </SidebarMenuButton>
                                {d.source === "default" && (
                                  <SidebarMenuBadge aria-label="shadcn default">
                                    <span className="size-1.5 rounded-full bg-sidebar-muted" />
                                  </SidebarMenuBadge>
                                )}
                              </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ))}
              </SidebarContent>
            </Sidebar>

            <SidebarInset className="bg-page">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger />
                <span className="hidden text-sm font-semibold sm:inline">
                  Component gallery
                </span>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Switch
                    id="pending-only"
                    checked={pendingOnly}
                    onCheckedChange={setPendingOnly}
                  />
                  <Label htmlFor="pending-only" className="text-xs font-normal">
                    <span className="sm:hidden">Defaults</span>
                    <span className="hidden sm:inline">
                      Show only shadcn defaults
                    </span>
                  </Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}
                >
                  {dir.toUpperCase()}
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </Button>
              </header>

              <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
                {terms.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing {visible.length} of {demos.length} for “
                    {query.trim()}”.
                  </p>
                )}
                {visible.length === 0 && (
                  <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground shadow-1">
                    No components match “{query.trim()}”.{" "}
                    <Button variant="link" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  </div>
                )}
                {visible.map((d) => (
                  <DemoSection key={d.id} demo={d} />
                ))}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
        <Toaster theme={theme === "dark" ? "dark" : "light"} />
      </TooltipProvider>
    </DirectionProvider>
  )
}

function DemoSection({ demo }: { demo: Demo }) {
  const [view, setView] = React.useState<"preview" | "code">("preview")
  const code = demo.doc ? undefined : sources[demo.id]
  const badge = SOURCE_BADGE[demo.source ?? "default"]
  // Welcome carries its own h1, so a second heading would only repeat it.
  const showHeader = demo.id !== "welcome"

  return (
    <section
      id={demo.id}
      aria-label={showHeader ? undefined : demo.title}
      className="flex min-w-0 scroll-mt-20 flex-col gap-4 rounded-xl border bg-card p-4 shadow-1 sm:p-6"
    >
      {showHeader && (
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={
              demo.doc ? "text-xl font-bold" : "text-[15px] font-semibold"
            }
          >
            {demo.title}
          </h2>
          {!demo.doc && (
            <Badge dot variant={badge.variant}>
              {badge.label}
            </Badge>
          )}
          {code && (
            <Tabs
              value={view}
              onValueChange={(next) => setView(next as "preview" | "code")}
              className="ms-auto"
            >
              <TabsList aria-label={`${demo.title} view`}>
                <TabsTrigger value="preview" className="px-3 py-1 text-xs">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="px-3 py-1 text-xs">
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}
      {view === "preview" || !code ? (
        <div className="flex min-w-0 flex-wrap items-start gap-3">
          {demo.render()}
        </div>
      ) : (
        <CodeBlock code={code} />
      )}
    </section>
  )
}

/** Highlights the section being read and keeps its sidebar link in view. */
function useScrollSpy(visible: Demo[], setActive: (id: string) => void) {
  const ids = visible.map((d) => d.id).join(",")

  React.useEffect(() => {
    let pending = 0
    let current = ""
    const update = () => {
      pending = 0
      const sections = ids
        .split(",")
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      // The section whose top has passed just below the sticky header.
      let id = sections[0]?.id ?? ""
      for (const section of sections) {
        if (section.getBoundingClientRect().top > 120) break
        id = section.id
      }
      if (!id || id === current) return
      current = id
      setActive(id)
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, "", `#${id}`)
      }
      const link = document.querySelector<HTMLElement>(
        `[data-sidebar="content"] a[href="#${CSS.escape(id)}"]`
      )
      const list = link?.closest<HTMLElement>('[data-sidebar="content"]')
      if (link && list) {
        const linkBox = link.getBoundingClientRect()
        const listBox = list.getBoundingClientRect()
        // Scroll only the sidebar, never the page.
        if (linkBox.top < listBox.top || linkBox.bottom > listBox.bottom) {
          list.scrollTop +=
            linkBox.top - listBox.top - listBox.height / 2 + linkBox.height / 2
        }
      }
    }
    const onScroll = () => {
      if (!pending) pending = window.setTimeout(update, 50)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(pending)
    }
  }, [ids, setActive])
}

/**
 * Keeps the page on the linked section while it loads. Demos (cmdk scrolls its
 * first item into view), late layout and scroll restoration all move it otherwise.
 */
function useHoldLandingScroll() {
  React.useEffect(() => {
    const targetId = window.location.hash.slice(1)
    let holding = true
    let timer = 0
    const pin = () => {
      if (!holding) return
      const target = document.getElementById(targetId)
      if (!target || target.id === demos[0].id) window.scrollTo({ top: 0 })
      else target.scrollIntoView()
    }
    const release = () => {
      holding = false
    }
    // A tab opened in the background starts its window when it's first shown.
    const startWindow = () => {
      if (document.hidden || timer) return
      pin()
      timer = window.setTimeout(release, 2000)
    }
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"]
    userEvents.forEach((type) =>
      window.addEventListener(type, release, { passive: true, once: true })
    )
    window.addEventListener("scroll", pin, { passive: true })
    document.addEventListener("visibilitychange", startWindow)
    const first = window.setTimeout(startWindow, 0)
    return () => {
      release()
      window.clearTimeout(first)
      window.clearTimeout(timer)
      window.removeEventListener("scroll", pin)
      document.removeEventListener("visibilitychange", startWindow)
      userEvents.forEach((type) => window.removeEventListener(type, release))
    }
  }, [])
}
