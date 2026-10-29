import { render, screen } from "@testing-library/react"
import axe from "axe-core"
import type { IconType } from "react-icons"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DirectionProvider,
  Icon,
  IconProvider,
  ICONS,
  MIRRORED_ICONS,
  P3_GLYPHS,
  P3IconProvider,
  SettingsNav,
  type IconName,
} from "@/index"
import { applyTailwind, isMirrored } from "./tailwind"

const NAMES = Object.keys(ICONS) as IconName[]
const html = (node: React.ReactNode) => renderToStaticMarkup(node)
const drawn = (Glyph: IconType, name: IconName, strokeWidth?: number) => {
  const mirrored = MIRRORED_ICONS.includes(name)
  return html(
    <Glyph
      data-slot="icon"
      data-icon-name={name}
      {...(mirrored ? { "data-mirror": "" } : {})}
      size={16}
      {...(strokeWidth === undefined ? {} : { strokeWidth })}
      className={mirrored ? "shrink-0 rtl:-scale-x-100" : "shrink-0"}
      aria-hidden
    />
  )
}
const icon = (name: IconName) =>
  document.querySelector(`[data-icon-name="${name}"]`)?.outerHTML

describe("Icon without an IconProvider", () => {
  it("draws every name with its built-in glyph and the props it always passed", () => {
    for (const name of NAMES) {
      expect(html(<Icon name={name} />)).toBe(drawn(ICONS[name], name, 2))
      expect(
        html(
          <IconProvider>
            <Icon name={name} />
          </IconProvider>
        )
      ).toBe(drawn(ICONS[name], name, 2))
    }
  })

  it("keeps the built-in glyph of every name", () => {
    expect(Object.fromEntries(NAMES.map((name) => [name, ICONS[name].name])))
      .toMatchInlineSnapshot(`
      {
        "abandonedCart": "TbShoppingCartX",
        "abuse": "FiFlag",
        "add": "FiPlus",
        "ai": "LuSparkles",
        "api": "FiCode",
        "arriving": "LuArrowDownToLine",
        "attributes": "FiSliders",
        "back": "FiArrowLeft",
        "bank": "LuLandmark",
        "billing": "FiCreditCard",
        "blogs": "LuNewspaper",
        "brandAppearance": "LuPalette",
        "brands": "FiTag",
        "cash": "LuBanknote",
        "categories": "LuFolderTree",
        "changelog": "FiGift",
        "chargeback": "LuShieldAlert",
        "check": "FiCheck",
        "close": "FiX",
        "collapse": "FiChevronUp",
        "collections": "FiLayers",
        "columns": "FiColumns",
        "comingUp": "LuCalendarClock",
        "commission": "FiPercent",
        "conceal": "FiEyeOff",
        "coupons": "LuTicket",
        "crop": "FiCrop",
        "currency": "FiDollarSign",
        "customer": "FiUser",
        "customers": "FiUsers",
        "dashboard": "FiHome",
        "delete": "FiTrash2",
        "delivery": "FiNavigation",
        "deposited": "FiCheckCircle",
        "device": "LuMonitorSmartphone",
        "docs": "FiBookOpen",
        "document": "FiFileText",
        "domain": "FiGlobe",
        "domains": "FiGlobe",
        "drivers": "LuCarFront",
        "duplicate": "FiCopy",
        "edit": "FiEdit2",
        "email": "FiMail",
        "empty": "FiInbox",
        "error": "FiAlertCircle",
        "events": "FiActivity",
        "expand": "FiChevronDown",
        "export": "FiDownload",
        "external": "FiExternalLink",
        "file": "FiFile",
        "fileArchive": "LuFileArchive",
        "filter": "FiFilter",
        "forward": "FiArrowRight",
        "fulfilment": "LuPackageCheck",
        "goodsDigital": "FiDownloadCloud",
        "goodsPhysical": "FiPackage",
        "goodsPod": "LuShirt",
        "goodsServices": "FiCalendar",
        "grid": "FiGrid",
        "grow": "FiTrendingUp",
        "held": "LuLandmark",
        "impersonate": "FiLogIn",
        "import": "FiUpload",
        "inTransit": "LuHourglass",
        "info": "FiInfo",
        "integrations": "FiLayers",
        "invoices": "FiFileText",
        "languages": "LuLanguages",
        "leaving": "LuArrowUpFromLine",
        "ledgerEntry": "LuBookOpenText",
        "ledgerbook": "LuNotebookTabs",
        "link": "FiLink",
        "list": "FiList",
        "loading": "LuLoaderCircle",
        "locations": "FiMapPin",
        "locked": "FiLock",
        "marketing": "LuMegaphone",
        "markets": "FiMap",
        "media": "FiImage",
        "more": "FiMoreHorizontal",
        "next": "FiChevronRight",
        "notifications": "FiBell",
        "onItsWay": "LuHourglass",
        "onboarding": "FiUserPlus",
        "orders": "FiShoppingCart",
        "pages": "FiFile",
        "passkey": "LuFingerprint",
        "password": "LuKeySquare",
        "payments": "LuWallet",
        "payouts": "LuBanknote",
        "pending": "LuHourglass",
        "period": "LuCalendarRange",
        "permissions": "LuShieldCheck",
        "phone": "FiSmartphone",
        "plan": "LuGem",
        "play": "FiPlayCircle",
        "policies": "LuScale",
        "preorders": "LuCalendarClock",
        "prev": "FiChevronLeft",
        "print": "FiPrinter",
        "products": "FiShoppingBag",
        "profile": "FiUser",
        "questions": "FiHelpCircle",
        "reconcile": "LuRoute",
        "redirects": "FiCornerDownRight",
        "referral": "FiGift",
        "refresh": "FiRefreshCw",
        "refunds": "FiRotateCcw",
        "reports": "FiBarChart2",
        "reserve": "FiLock",
        "resources": "LuLibraryBig",
        "returns": "LuPackageX",
        "reveal": "FiEye",
        "revenue": "FiTrendingUp",
        "reviews": "FiStar",
        "roadmap": "FiMessageSquare",
        "scheduleCall": "FiPhoneCall",
        "search": "FiSearch",
        "sellInPerson": "LuBuilding2",
        "sellMarketplace": "LuStore",
        "sellNotYet": "LuSparkles",
        "sellOwnSite": "FiGlobe",
        "seo": "FiTrendingUp",
        "settings": "FiSettings",
        "settlement": "LuArrowDownToLine",
        "setupGuide": "PiSlidersHorizontal",
        "share": "FiShare2",
        "shipping": "FiTruck",
        "sidebarToggle": "FiSidebar",
        "signOut": "FiLogOut",
        "spreadsheet": "LuFileSpreadsheet",
        "status": "FiActivity",
        "storefront": "LuStore",
        "success": "FiCheckCircle",
        "support": "FiHelpCircle",
        "supportPin": "FiKey",
        "taskAvailability": "LuCalendarCheck",
        "taskDelivery": "FiTruck",
        "taskEmail": "LuMailCheck",
        "taskFiles": "LuFileDown",
        "taskPayment": "FiCreditCard",
        "taskProduct": "LuPackagePlus",
        "taskStore": "LuStore",
        "taskVendor": "LuUserRoundPlus",
        "taxOwed": "LuLandmark",
        "taxes": "LuReceipt",
        "team": "FiUsers",
        "themeDark": "FiMoon",
        "themeLight": "FiSun",
        "themeSystem": "FiMonitor",
        "themes": "FiSliders",
        "todo": "FiCircle",
        "twoStep": "LuShieldCheck",
        "unlock": "LuLockOpen",
        "users": "FiUsers",
        "vendorPayouts": "LuHandCoins",
        "vendors": "FiUser",
        "video": "FiYoutube",
        "visitors": "FiEye",
        "warning": "FiAlertTriangle",
        "webhooks": "LuWebhook",
        "whereItWent": "LuRoute",
        "yours": "LuCoins",
      }
    `)
  })
})

describe("Icon in right-to-left layouts", () => {
  const icons = () => [...document.querySelectorAll('[data-slot="icon"]')]

  it("mirrors the directional names", () => {
    expect(MIRRORED_ICONS).toEqual([
      "back",
      "forward",
      "prev",
      "next",
      "redirects",
      "impersonate",
      "signOut",
      "sidebarToggle",
      "list",
    ])
  })

  it("mirrors a directional icon under dir=rtl and not in LTR", async () => {
    render(
      <>
        <div dir="rtl">
          {MIRRORED_ICONS.map((name) => (
            <Icon key={name} name={name} />
          ))}
        </div>
        <div dir="ltr">
          <Icon name="back" />
        </div>
        <Icon name="next" />
      </>
    )
    await applyTailwind()
    expect(icons().map(isMirrored)).toEqual([
      ...MIRRORED_ICONS.map(() => true),
      false,
      false,
    ])
  })

  it("mirrors under DirectionProvider dir=rtl where no ancestor sets dir, as in a portal", async () => {
    render(
      <DirectionProvider dir="rtl">
        <Icon name="back" />
      </DirectionProvider>
    )
    await applyTailwind()
    expect(isMirrored(icons()[0])).toBe(true)
  })

  it("mirrors in server-rendered markup, with no effect to run", async () => {
    const markup = [
      html(
        <DirectionProvider dir="rtl">
          <Icon name="forward" />
        </DirectionProvider>
      ),
      html(<Icon name="forward" />),
    ]
    render(
      <>
        <div dangerouslySetInnerHTML={{ __html: markup[0] }} />
        <div dir="rtl" dangerouslySetInnerHTML={{ __html: markup[1] }} />
        <div dangerouslySetInnerHTML={{ __html: markup[1] }} />
      </>
    )
    await applyTailwind()
    expect(icons().map(isMirrored)).toEqual([true, true, false])
  })

  it("never mirrors a non-directional icon", async () => {
    const names = NAMES.filter((name) => !MIRRORED_ICONS.includes(name))
    render(
      <DirectionProvider dir="rtl">
        <div dir="rtl">
          {names.map((name) => (
            <Icon key={name} name={name} />
          ))}
        </div>
      </DirectionProvider>
    )
    await applyTailwind()
    expect(icons()).toHaveLength(names.length)
    for (const icon of icons()) {
      expect(isMirrored(icon)).toBe(false)
      expect(icon.hasAttribute("data-mirror")).toBe(false)
    }
  })

  it("keeps a directional icon as drawn, with the markup it always had, when mirror={false}", async () => {
    render(
      <DirectionProvider dir="rtl">
        <div dir="rtl">
          {MIRRORED_ICONS.map((name) => (
            <Icon key={name} name={name} mirror={false} />
          ))}
        </div>
      </DirectionProvider>
    )
    await applyTailwind()
    expect(icons().map(isMirrored)).toEqual(MIRRORED_ICONS.map(() => false))
    for (const name of MIRRORED_ICONS) {
      const Glyph = ICONS[name]
      expect(html(<Icon name={name} mirror={false} />)).toBe(
        html(
          <Glyph
            data-slot="icon"
            data-icon-name={name}
            size={16}
            strokeWidth={2}
            className="shrink-0"
            aria-hidden
          />
        )
      )
    }
  })

  it("mirrors once when an app still flips it with rtl:-scale-x-100, and keeps mirroring a swapped glyph", async () => {
    render(
      <IconProvider glyphs={{ forward: ICONS.next }}>
        <DirectionProvider dir="rtl">
          <div dir="rtl">
            <Icon name="back" className="rtl:-scale-x-100" />
            <Icon name="forward" />
          </div>
        </DirectionProvider>
        <div dir="rtl">
          <Icon name="prev" className="rtl:-scale-x-100" />
        </div>
      </IconProvider>
    )
    await applyTailwind()
    expect(icons().map(isMirrored)).toEqual([true, true, true])
  })
})

describe("IconProvider", () => {
  it("draws the names in glyphs with their override and every other name as before", () => {
    for (const name of NAMES) {
      const glyph = P3_GLYPHS[name]
      expect(
        html(
          <IconProvider glyphs={P3_GLYPHS}>
            <Icon name={name} />
          </IconProvider>
        )
      ).toBe(glyph ? drawn(glyph, name) : drawn(ICONS[name], name, 2))
    }
  })

  it("draws the P3 set through P3IconProvider, which takes no props", () => {
    for (const name of NAMES) {
      expect(
        html(
          <P3IconProvider>
            <Icon name={name} />
          </P3IconProvider>
        )
      ).toBe(
        html(
          <IconProvider glyphs={P3_GLYPHS}>
            <Icon name={name} />
          </IconProvider>
        )
      )
    }
  })

  it("lays an inner provider's glyphs over the P3 set", () => {
    const Cart = ICONS.abandonedCart
    render(
      <P3IconProvider>
        <IconProvider glyphs={{ products: Cart }}>
          <Icon name="products" />
          <Icon name="customers" />
          <Icon name="dashboard" />
        </IconProvider>
      </P3IconProvider>
    )
    expect(icon("products")).toBe(drawn(Cart, "products"))
    expect(icon("customers")).toBe(drawn(P3_GLYPHS.customers!, "customers"))
    expect(icon("dashboard")).toBe(drawn(ICONS.dashboard, "dashboard", 2))
  })

  it("stacks on an outer provider, the inner one winning", () => {
    const Cart = ICONS.abandonedCart
    render(
      <IconProvider glyphs={P3_GLYPHS}>
        <IconProvider glyphs={{ orders: Cart }}>
          <Icon name="orders" />
          <Icon name="products" />
          <Icon name="dashboard" />
        </IconProvider>
      </IconProvider>
    )
    expect(icon("orders")).toBe(drawn(Cart, "orders"))
    expect(icon("products")).toBe(drawn(P3_GLYPHS.products!, "products"))
    expect(icon("dashboard")).toBe(drawn(ICONS.dashboard, "dashboard", 2))
  })

  it("reaches the icons the library draws inside its own parts", () => {
    render(
      <IconProvider glyphs={P3_GLYPHS}>
        <SettingsNav
          groups={[
            {
              id: "money",
              label: "Money",
              items: [
                {
                  id: "payments",
                  label: "Payments",
                  href: "#payments",
                  icon: "payments",
                },
              ],
            },
          ]}
        />
      </IconProvider>
    )
    expect(
      document.querySelector('[data-icon-name="payments"]')?.outerHTML
    ).toBe(drawn(P3_GLYPHS.payments!, "payments"))
  })
})

describe("P3_GLYPHS", () => {
  it("lists only the 75 names whose P3 glyph differs from the default", () => {
    const names = Object.keys(P3_GLYPHS) as IconName[]
    expect(names).toHaveLength(75)
    for (const name of names) {
      expect(NAMES).toContain(name)
      expect(P3_GLYPHS[name]).not.toBe(ICONS[name])
    }
  })

  it("draws the FlyCommerce glyphs with the Icon contract: size, class, title, label and stroke width", () => {
    render(
      <IconProvider glyphs={P3_GLYPHS}>
        <Icon name="bank" className="text-primary" />
        <Icon name="customers" label="Customers" size={20} strokeWidth={1.5} />
        <Icon name="products" size="1.25rem" title="Products" />
      </IconProvider>
    )
    const bank = document.querySelector('[data-icon-name="bank"]')!
    expect(bank.getAttribute("data-slot")).toBe("icon")
    expect(bank.getAttribute("aria-hidden")).toBe("true")
    expect(bank.getAttribute("class")).toBe("shrink-0 text-primary")
    expect(bank.getAttribute("width")).toBe("16")
    expect(bank.getAttribute("stroke-width")).toBe("0.8")

    const customers = screen.getByRole("img", { name: "Customers" })
    expect(customers.getAttribute("data-icon-name")).toBe("customers")
    expect(customers.getAttribute("width")).toBe("20")
    expect(customers.getAttribute("stroke-width")).toBe("1.5")
    expect(customers.querySelector("[stroke-width]")).toBeNull()

    const products = document.querySelector('[data-icon-name="products"]')!
    expect(products.getAttribute("height")).toBe("1.25rem")
    expect(products.querySelector("title")?.textContent).toBe("Products")
  })

  it("draws each FlyCommerce glyph at its own stroke width and a Feather glyph at 2, unless the app passes one", () => {
    const root = (node: React.ReactNode) =>
      html(<IconProvider glyphs={P3_GLYPHS}>{node}</IconProvider>).match(
        /^<svg[^>]*>/
      )![0]
    for (const [name, width] of [
      ["collections", "0.59"],
      ["customers", "0.97"],
      ["delivery", "1.78"],
      ["bank", "0.8"],
      ["products", "1.8"],
    ] as const) {
      expect(root(<Icon name={name} />)).toContain(`stroke-width="${width}"`)
      expect(root(<Icon name={name} strokeWidth={1.5} />)).toContain(
        'stroke-width="1.5"'
      )
    }
    expect(root(<Icon name="categories" />)).toContain('stroke-width="2"')
    expect(root(<Icon name="orders" />)).toContain('stroke-width="2"')
    expect(root(<Icon name="payments" strokeWidth={1.5} />)).toContain(
      'stroke="none"'
    )
  })

  it("passes axe with every name labelled", async () => {
    const { container } = render(
      <IconProvider glyphs={P3_GLYPHS}>
        {NAMES.map((name) => (
          <Icon key={name} name={name} label={name} />
        ))}
      </IconProvider>
    )
    expect(screen.getAllByRole("img")).toHaveLength(NAMES.length)
    const { violations } = await axe.run(container)
    expect(violations.map((v) => v.id)).toEqual([])
  })
})

describe("FlyCommerce glyphs", () => {
  const GLYPHS = "@/components/icon/fly-glyphs"

  afterEach(() => {
    vi.doUnmock(GLYPHS)
    vi.resetModules()
  })

  it("load with P3IconProvider and never with Icon or IconProvider", async () => {
    const factory = vi.fn(async (importOriginal: () => Promise<unknown>) =>
      importOriginal()
    )
    vi.doMock(GLYPHS, factory)
    vi.resetModules()

    await import("@/components/icon")
    expect(factory).not.toHaveBeenCalled()

    await import("@/components/p3-icon-provider")
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
