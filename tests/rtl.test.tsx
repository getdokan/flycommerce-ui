import type * as React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useDirection as useBaseUIDirection } from "@base-ui/react/direction-provider"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Calendar,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
  DirectionProvider,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  Icon,
  PageHeaderBack,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SettingsNav,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  TableFilters,
  TooltipProvider,
  type CarouselApi,
} from "@/index"
import { applyTailwind, degrees, isMirrored } from "./tailwind"

type Dir = "ltr" | "rtl"

const pointsLeft = (svg: Element) =>
  svg.innerHTML.includes('points="15 18 9 12 15 6"')
const pointing = (svg: Element) =>
  pointsLeft(svg) !== isMirrored(svg) ? "left" : "right"

afterEach(() => {
  document.documentElement.removeAttribute("dir")
})

describe("SidebarMenuButton tooltip", () => {
  function Rail({
    side,
    collapsible = "icon",
    tooltip = "Orders",
  }: {
    side?: "left" | "right"
    collapsible?: "icon" | "none"
    tooltip?: React.ComponentProps<typeof SidebarMenuButton>["tooltip"]
  }) {
    return (
      <TooltipProvider>
        <SidebarProvider open={false}>
          <Sidebar side={side} collapsible={collapsible}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={tooltip}>
                  <Icon name="orders" />
                  <span>Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      </TooltipProvider>
    )
  }

  const tooltipSide = async () => {
    act(() => screen.getByRole("button", { name: "Orders" }).focus())
    await screen.findByRole("tooltip")
    return document
      .querySelector('[data-slot="tooltip-content"]')!
      .getAttribute("data-side")
  }

  it.each([
    ["a rail without side", undefined, "right"],
    ["a left rail", "left", "right"],
    ["a right rail", "right", "left"],
  ] as const)("opens away from %s", async (_name, side, expected) => {
    render(<Rail side={side} />)
    expect(await tooltipSide()).toBe(expected)
  })

  it("opens away from a right rail that never collapses", async () => {
    render(<Rail side="right" collapsible="none" />)
    expect(await tooltipSide()).toBe("left")
  })

  it("opens on the side tooltip.side names", async () => {
    render(
      <Rail side="right" tooltip={{ children: "Orders", side: "right" }} />
    )
    expect(await tooltipSide()).toBe("right")
  })
})

describe("Sidebar edges in RTL", () => {
  it.each([
    ["ltr", "left", "borderRightWidth"],
    ["ltr", "right", "borderLeftWidth"],
    ["rtl", "left", "borderRightWidth"],
    ["rtl", "right", "borderLeftWidth"],
  ] as const)(
    "in %s, a %s rail draws its border on the edge facing the page",
    async (dir, side, edge) => {
      render(
        <div dir={dir}>
          <SidebarProvider>
            <Sidebar side={side} collapsible="icon">
              Navigation
            </Sidebar>
          </SidebarProvider>
        </div>
      )
      await applyTailwind()
      const rail = document.querySelector('[data-slot="sidebar-container"]')!
      const other =
        edge === "borderLeftWidth" ? "borderRightWidth" : "borderLeftWidth"
      expect(getComputedStyle(rail)[edge]).toBe("1px")
      expect(getComputedStyle(rail)[other]).not.toBe("1px")
    }
  )

  it.each([
    ["ltr", "left", true, "w-resize"],
    ["ltr", "left", false, "e-resize"],
    ["rtl", "right", true, "e-resize"],
    ["rtl", "right", false, "w-resize"],
  ] as const)(
    "in %s, the handle of a %s rail (open: %s) shows a %s cursor, the way it moves",
    async (dir, side, open, cursor) => {
      render(
        <div dir={dir}>
          <SidebarProvider defaultOpen={open}>
            <Sidebar side={side} collapsible="offcanvas">
              <SidebarRail />
            </Sidebar>
          </SidebarProvider>
        </div>
      )
      await applyTailwind()
      const handle = document.querySelector('[data-slot="sidebar-rail"]')!
      expect(getComputedStyle(handle).cursor).toBe(cursor)
    }
  )

  it.each([
    ["ltr", "left", "right"],
    ["rtl", "right", "left"],
  ] as const)(
    "in %s, a hidden off-canvas %s rail keeps its handle past its %s edge, on screen",
    async (dir, side, edge) => {
      render(
        <div dir={dir}>
          <SidebarProvider defaultOpen={false}>
            <Sidebar side={side} collapsible="offcanvas">
              <SidebarRail />
            </Sidebar>
          </SidebarProvider>
        </div>
      )
      await applyTailwind()
      const handle = document.querySelector('[data-slot="sidebar-rail"]')!
      expect(getComputedStyle(handle)[edge]).toBe("calc(var(--spacing) * -2)")
    }
  )
})

describe("Sheet and Drawer edges in RTL", () => {
  it.each([
    ["ltr", "left"],
    ["ltr", "right"],
    ["rtl", "left"],
    ["rtl", "right"],
  ] as const)(
    "in %s, a %s sheet draws its border on the edge facing the page",
    async (dir, side) => {
      document.documentElement.dir = dir
      render(
        <Sheet open>
          <SheetContent side={side}>
            <SheetTitle>Invite</SheetTitle>
            <SheetDescription>They get an email.</SheetDescription>
          </SheetContent>
        </Sheet>
      )
      await applyTailwind()
      const style = getComputedStyle(screen.getByRole("dialog"))
      expect(
        side === "left" ? style.borderRightWidth : style.borderLeftWidth
      ).toBe("1px")
    }
  )

  it.each([
    ["left", "left", "borderRightWidth"],
    ["right", "right", "borderLeftWidth"],
  ] as const)(
    "in RTL, a %s drawer stays on the %s edge, where it slides from",
    async (direction, edge, border) => {
      document.documentElement.dir = "rtl"
      render(
        <Drawer open direction={direction}>
          <DrawerContent>
            <DrawerTitle>Order</DrawerTitle>
            <DrawerDescription>#1001</DrawerDescription>
          </DrawerContent>
        </Drawer>
      )
      await applyTailwind()
      const style = getComputedStyle(screen.getByRole("dialog"))
      expect(style[edge]).toBe("0px")
      expect(style[edge === "left" ? "right" : "left"]).toBe("auto")
      expect(style[border]).toBe("1px")
    }
  )
})

describe("SelectContent in RTL", () => {
  it.each(["ltr", "rtl"] as const)(
    "in %s, a popper beside the trigger keeps its 4px gap away from it",
    async (dir) => {
      document.documentElement.dir = dir
      render(
        <DirectionProvider dir={dir}>
          <Select open defaultValue="usd">
            <SelectTrigger aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="right">
              <SelectItem value="usd">USD</SelectItem>
            </SelectContent>
          </Select>
        </DirectionProvider>
      )
      await applyTailwind()
      const list = screen.getByRole("listbox")
      expect(list.getAttribute("data-side")).toBe("right")
      expect(getComputedStyle(list).getPropertyValue("--tw-translate-x")).toBe(
        "var(--spacing)"
      )
    }
  )
})

describe("Carousel in RTL", () => {
  function Slides(props: React.ComponentProps<typeof Carousel>) {
    return (
      <Carousel {...props}>
        <CarouselContent>
          {[1, 2, 3].map((slide) => (
            <CarouselItem key={slide}>{slide}</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )
  }

  const mount = async (
    dir: Dir,
    props?: React.ComponentProps<typeof Carousel>
  ) => {
    const setApi = vi.fn<(api: CarouselApi) => void>()
    render(
      <DirectionProvider dir={dir}>
        <div dir={dir}>
          <Slides setApi={setApi} {...props} />
        </div>
      </DirectionProvider>
    )
    await waitFor(() => expect(setApi).toHaveBeenCalled())
    return setApi.mock.lastCall![0]!
  }

  it.each(["ltr", "rtl"] as const)(
    "tells Embla the reading direction (%s)",
    async (dir) => {
      const api = await mount(dir)
      expect(api.internalEngine().options.direction).toBe(dir)
    }
  )

  it("lets opts.direction override it", async () => {
    const api = await mount("rtl", { opts: { direction: "ltr" } })
    expect(api.internalEngine().options.direction).toBe("ltr")
  })

  it.each([
    ["ltr", "ArrowLeft", "scrollPrev"],
    ["ltr", "ArrowRight", "scrollNext"],
    ["rtl", "ArrowLeft", "scrollNext"],
    ["rtl", "ArrowRight", "scrollPrev"],
  ] as const)("in %s, %s calls %s", async (dir, key, method) => {
    const api = await mount(dir)
    const scroll = vi.spyOn(api, method)
    fireEvent.keyDown(screen.getByRole("region"), { key })
    expect(scroll).toHaveBeenCalledOnce()
  })

  it.each(["ltr", "rtl"] as const)(
    "in %s, a vertical carousel's previous button points up and its next button down",
    async (dir) => {
      await mount(dir, { orientation: "vertical" })
      await applyTailwind()
      const compass = (slot: string) => {
        const button = document.querySelector(`[data-slot="${slot}"]`)!
        const icon = button.querySelector("svg")!
        const angle =
          (pointsLeft(icon) ? 180 : 0) + degrees(icon) + degrees(button)
        return ["right", "down", "left", "up"][(((angle % 360) + 360) / 90) % 4]
      }
      expect(compass("carousel-previous")).toBe("up")
      expect(compass("carousel-next")).toBe("down")
    }
  )
})

describe("Calendar in RTL", () => {
  const october = new Date(2026, 9, 1)
  const day = (date: number) =>
    document.querySelector<HTMLElement>(`[data-day="10/${date}/2026"]`)!

  it.each([
    ["ltr", "ArrowLeft", 6],
    ["ltr", "ArrowRight", 8],
    ["rtl", "ArrowLeft", 8],
    ["rtl", "ArrowRight", 6],
  ] as const)(
    "in %s, %s moves to the day drawn on that side (October %s)",
    async (dir, key, date) => {
      const user = userEvent.setup()
      render(
        <DirectionProvider dir={dir}>
          <Calendar mode="single" defaultMonth={october} />
        </DirectionProvider>
      )
      await user.click(day(7))
      await user.keyboard(`{${key}}`)
      expect(document.activeElement).toBe(day(date))
    }
  )

  it("sets dir only when a DirectionProvider gives RTL, so it inherits the page's otherwise", () => {
    render(
      <>
        <DirectionProvider dir="rtl">
          <Calendar mode="single" defaultMonth={october} />
        </DirectionProvider>
        <Calendar mode="single" defaultMonth={october} />
      </>
    )
    const [rtl, page] = document.querySelectorAll('[data-slot="calendar"]')
    expect(rtl.getAttribute("dir")).toBe("rtl")
    expect(page.hasAttribute("dir")).toBe(false)
  })

  it.each([undefined, "around"] as const)(
    "in RTL (navLayout %s), the previous month button points right and the next left",
    async (navLayout) => {
      render(
        <DirectionProvider dir="rtl">
          <div dir="rtl">
            <Calendar
              mode="single"
              defaultMonth={october}
              navLayout={navLayout}
            />
          </div>
        </DirectionProvider>
      )
      await applyTailwind()
      expect(
        pointing(document.querySelector(".rdp-button_previous svg")!)
      ).toBe("right")
      expect(pointing(document.querySelector(".rdp-button_next svg")!)).toBe(
        "left"
      )
    }
  )
})

describe("DirectionProvider", () => {
  function BaseUIDirection() {
    return <output>{useBaseUIDirection()}</output>
  }

  it("sets the direction of Base UI parts such as Combobox, too", () => {
    render(
      <>
        <DirectionProvider dir="rtl">
          <BaseUIDirection />
        </DirectionProvider>
        <DirectionProvider dir="ltr">
          <BaseUIDirection />
        </DirectionProvider>
        <BaseUIDirection />
      </>
    )
    expect(
      screen.getAllByRole("status").map((output) => output.textContent)
    ).toEqual(["rtl", "ltr", "ltr"])
  })

  it("moves between a Combobox's input and its chips the way they are drawn in RTL", async () => {
    const user = userEvent.setup()
    render(
      <DirectionProvider dir="rtl">
        <div dir="rtl">
          <Combobox
            multiple
            items={["Apparel", "Toys"]}
            defaultValue={["Apparel", "Toys"]}
          >
            <ComboboxChips>
              <ComboboxValue>
                {(values: string[]) =>
                  values.map((item) => (
                    <ComboboxChip key={item}>{item}</ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput aria-label="Categories" />
            </ComboboxChips>
          </Combobox>
        </div>
      </DirectionProvider>
    )
    const input = screen.getByRole("combobox", { name: "Categories" })
    act(() => input.focus())
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(input)
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement?.textContent).toContain("Toys")
  })
})

describe("Directional icons inside library parts", () => {
  it("PageHeaderBack turns its own chevron in RTL, and leaves an Icon that mirrors itself mirrored", async () => {
    render(
      <div dir="rtl">
        <PageHeaderBack href="#products">Products</PageHeaderBack>
        <PageHeaderBack asChild>
          <a href="#orders">
            <Icon name="back" />
            Orders
          </a>
        </PageHeaderBack>
      </div>
    )
    await applyTailwind()
    const [chevron, back] = document.querySelectorAll(
      '[data-slot="page-header-back"] svg'
    )
    expect(pointing(chevron)).toBe("right")
    expect(isMirrored(back)).toBe(true)
  })

  it("SettingsNav points the current item's chevron to the end in RTL", async () => {
    render(
      <div dir="rtl">
        <SettingsNav
          activeId="payments"
          groups={[
            {
              id: "money",
              label: "Money",
              items: [{ id: "payments", label: "Payments", href: "#payments" }],
            },
          ]}
        />
      </div>
    )
    await applyTailwind()
    const chevron = document.querySelector('[data-icon-name="next"]')!
    expect(isMirrored(chevron)).toBe(true)
  })
})

describe("TableFilters in RTL", () => {
  it.each([
    ["ltr", "right"],
    ["rtl", "left"],
  ] as const)(
    "in %s, opens its sheet at the %s, the end edge",
    async (dir, side) => {
      const user = userEvent.setup()
      render(
        <DirectionProvider dir={dir}>
          <TableFilters
            fields={[
              {
                key: "status",
                label: "Status",
                type: "select",
                options: [{ value: "paid", label: "Paid" }],
              },
            ]}
            value={{}}
            onValueChange={() => {}}
          />
        </DirectionProvider>
      )
      await user.click(screen.getByRole("button", { name: "Filters" }))
      expect(
        screen
          .getByRole("dialog", { name: "Filters" })
          .getAttribute("data-side")
      ).toBe(side)
    }
  )
})
