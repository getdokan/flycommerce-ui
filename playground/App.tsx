import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

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
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Switch,
  Toaster,
  TooltipProvider,
} from "@/index"
import { demos, groups } from "./demos"
import { useTheme } from "./theme-provider"

const restyledCount = demos.filter((d) => d.restyled).length

export default function App() {
  const { theme, setTheme } = useTheme()
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr")
  const [pendingOnly, setPendingOnly] = React.useState(false)
  const visible = pendingOnly ? demos.filter((d) => !d.restyled) : demos
  const [active, setActive] = React.useState(
    () => window.location.hash.slice(1) || demos[0].id
  )

  React.useEffect(() => {
    const onHash = () => setActive(window.location.hash.slice(1))
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

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
              </SidebarHeader>
              <SidebarContent>
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
                                    <span className="flex size-4 shrink-0 items-center justify-center text-[10px] font-semibold">
                                      {d.title.slice(0, 2)}
                                    </span>
                                    <span>{d.title}</span>
                                  </a>
                                </SidebarMenuButton>
                                {!d.restyled && (
                                  <SidebarMenuBadge aria-label="To restyle">
                                    <span className="size-1.5 rounded-full bg-warning" />
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
              <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger />
                <span className="text-sm font-semibold">Component gallery</span>
                <Badge variant="secondary">
                  {restyledCount}/{demos.length} restyled
                </Badge>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Switch
                    id="pending-only"
                    checked={pendingOnly}
                    onCheckedChange={setPendingOnly}
                  />
                  <Label htmlFor="pending-only" className="text-xs font-normal">
                    Show only to-restyle
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

              <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
                <p className="text-sm text-muted-foreground">
                  Tokens come from the PM prototype. “Restyled” sections match
                  it; “To restyle” sections still use shadcn&apos;s default
                  shapes.
                </p>
                {visible.map((d) => (
                  <section
                    key={d.id}
                    id={d.id}
                    className="flex scroll-mt-20 flex-col gap-4 rounded-xl border bg-card p-6 shadow-1"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold">{d.title}</h2>
                      {d.restyled ? (
                        <Badge className="bg-success-subtle text-success-strong">
                          Restyled
                        </Badge>
                      ) : (
                        <Badge className="bg-warning-subtle text-warning-strong">
                          To restyle
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-start gap-3">
                      {d.render()}
                    </div>
                  </section>
                ))}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
        <Toaster theme={theme === "dark" ? "dark" : "light"} />
      </TooltipProvider>
    </DirectionProvider>
  )
}
