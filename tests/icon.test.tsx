import { render, screen } from "@testing-library/react"
import axe from "axe-core"
import type { IconType } from "react-icons"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  Icon,
  IconProvider,
  ICONS,
  P3_GLYPHS,
  SettingsNav,
  type IconName,
} from "@/index"

const NAMES = Object.keys(ICONS) as IconName[]
const html = (node: React.ReactNode) => renderToStaticMarkup(node)
const drawn = (Glyph: IconType, name: IconName) =>
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

describe("Icon without an IconProvider", () => {
  it("draws every name with its built-in glyph and the props it always passed", () => {
    for (const name of NAMES) {
      expect(html(<Icon name={name} />)).toBe(drawn(ICONS[name], name))
      expect(
        html(
          <IconProvider>
            <Icon name={name} />
          </IconProvider>
        )
      ).toBe(drawn(ICONS[name], name))
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
        "barChart": "FiBarChart2",
        "billing": "FiCreditCard",
        "blogs": "LuNewspaper",
        "brandAppearance": "LuPalette",
        "brands": "FiTag",
        "cash": "LuBanknote",
        "categories": "LuFolderTree",
        "changelog": "FiGift",
        "chargeback": "LuShieldAlert",
        "check": "FiCheck",
        "circleDashed": "FiCircle",
        "close": "FiX",
        "collapse": "FiChevronUp",
        "collections": "FiLayers",
        "columns": "FiColumns",
        "comingUp": "LuCalendarClock",
        "commission": "FiPercent",
        "conceal": "FiEyeOff",
        "coupons": "LuTicket",
        "currency": "FiDollarSign",
        "customer": "FiUser",
        "customers": "FiUsers",
        "dashboard": "FiHome",
        "delete": "FiTrash2",
        "delivery": "FiNavigation",
        "deposited": "FiCheckCircle",
        "device": "LuMonitorSmartphone",
        "docs": "FiBookOpen",
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
        "filter": "FiFilter",
        "forward": "FiArrowRight",
        "fulfilment": "LuPackageCheck",
        "goodsDigital": "FiDownloadCloud",
        "goodsPhysical": "FiPackage",
        "goodsPod": "LuShirt",
        "goodsServices": "FiCalendar",
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
        "lifeBuoy": "FiLifeBuoy",
        "listChecks": "FiList",
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
        "twoStep": "LuShieldCheck",
        "unlock": "LuLockOpen",
        "users": "FiUsers",
        "vendorPayouts": "LuHandCoins",
        "vendors": "FiUser",
        "visitors": "FiEye",
        "warning": "FiAlertTriangle",
        "webhooks": "LuWebhook",
        "whereItWent": "LuRoute",
        "yours": "LuCoins",
      }
    `)
  })
})

describe("IconProvider", () => {
  it("draws the names in glyphs with their override and every other name as before", () => {
    for (const name of NAMES) {
      expect(
        html(
          <IconProvider glyphs={P3_GLYPHS}>
            <Icon name={name} />
          </IconProvider>
        )
      ).toBe(drawn(P3_GLYPHS[name] ?? ICONS[name], name))
    }
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
    const icon = (name: IconName) =>
      document.querySelector(`[data-icon-name="${name}"]`)?.outerHTML
    expect(icon("orders")).toBe(drawn(Cart, "orders"))
    expect(icon("products")).toBe(drawn(P3_GLYPHS.products!, "products"))
    expect(icon("dashboard")).toBe(drawn(ICONS.dashboard, "dashboard"))
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
    expect(bank.getAttribute("stroke")).toBe("none")
    expect(bank.getAttribute("stroke-width")).toBe("2")

    const customers = screen.getByRole("img", { name: "Customers" })
    expect(customers.getAttribute("data-icon-name")).toBe("customers")
    expect(customers.getAttribute("width")).toBe("20")
    expect(customers.getAttribute("stroke-width")).toBe("1.5")
    expect(customers.querySelector("[stroke-width]")).toBeNull()

    const products = document.querySelector('[data-icon-name="products"]')!
    expect(products.getAttribute("height")).toBe("1.25rem")
    expect(products.querySelector("title")?.textContent).toBe("Products")
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
