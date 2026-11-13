import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScaledFrame } from "@/index"

let boxWidth = 320
let contentHeight = 0
const observers: { callback: () => void; targets: Element[] }[] = []

class RecordingObserver {
  targets: Element[] = []
  callback: () => void
  constructor(callback: () => void) {
    this.callback = callback
    observers.push(this)
  }
  observe(target: Element) {
    this.targets.push(target)
  }
  unobserve() {}
  disconnect() {
    this.targets = []
  }
}

const resizeAll = () =>
  act(() => {
    for (const observer of observers) observer.callback()
  })

const slot = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-slot="${name}"]`)!

beforeEach(() => {
  boxWidth = 320
  contentHeight = 0
  observers.length = 0
  vi.stubGlobal("ResizeObserver", RecordingObserver)
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.slot === "scaled-frame-box" ? boxWidth : 0
    }
  )
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.slot === "scaled-frame-content" ? contentHeight : 0
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("ScaledFrame", () => {
  it("scales a 640 email down to a 320 box and reserves the scaled height", () => {
    const { container } = render(
      <ScaledFrame
        width={640}
        height={1000}
        srcDoc="<p>Hi</p>"
        title="Order confirmed"
      />
    )
    const content = slot(container, "scaled-frame-content")
    expect(content.style.width).toBe("640px")
    expect(content.style.transform).toBe("translateX(0px) scale(0.5)")
    expect(slot(container, "scaled-frame-box").style.height).toBe("500px")
    expect(container.querySelector("iframe")!.style.height).toBe("1000px")
  })

  it("only scales down by default, centring narrower content", () => {
    boxWidth = 1000
    const { container } = render(
      <ScaledFrame width={640} height={400} srcDoc="" title="Order confirmed" />
    )
    expect(slot(container, "scaled-frame-content").style.transform).toBe(
      "translateX(180px) scale(1)"
    )
    expect(slot(container, "scaled-frame-box").style.height).toBe("400px")
  })

  it("scales up to fill the box with upscale", () => {
    boxWidth = 1280
    const { container } = render(
      <ScaledFrame
        width={640}
        height={400}
        upscale
        srcDoc=""
        title="Order confirmed"
      />
    )
    expect(slot(container, "scaled-frame-content").style.transform).toBe(
      "translateX(0px) scale(2)"
    )
    expect(slot(container, "scaled-frame-box").style.height).toBe("800px")
  })

  it("measures children and re-scales when the box or content resizes", () => {
    contentHeight = 800
    boxWidth = 640
    const { container, getByText } = render(
      <ScaledFrame width={1280}>
        <p>Storefront</p>
      </ScaledFrame>
    )
    expect(getByText("Storefront")).toBeTruthy()
    expect(container.querySelector("iframe")).toBeNull()
    expect(slot(container, "scaled-frame-box").style.height).toBe("400px")

    boxWidth = 320
    contentHeight = 1200
    resizeAll()
    expect(slot(container, "scaled-frame-content").style.transform).toBe(
      "translateX(0px) scale(0.25)"
    )
    expect(slot(container, "scaled-frame-box").style.height).toBe("300px")
  })

  it("measures the document when it loads and again when it resizes", () => {
    const { container } = render(
      <ScaledFrame width={640} srcDoc="<p>Hi</p>" title="Order confirmed" />
    )
    const frame = container.querySelector("iframe")!
    const document = frame.contentDocument!
    let height = 900
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => height,
    })
    Object.assign(frame.contentWindow!, { ResizeObserver: RecordingObserver })
    expect(slot(container, "scaled-frame-box").style.height).toBe("0px")

    fireEvent.load(frame)
    expect(slot(container, "scaled-frame-box").style.height).toBe("450px")
    expect(frame.style.height).toBe("900px")
    expect(observers.at(-1)!.targets).toContain(document.documentElement)

    height = 500
    act(() => observers.at(-1)!.callback())
    expect(slot(container, "scaled-frame-box").style.height).toBe("250px")
  })

  it("measures the document with the frame collapsed, so a viewport-high page can't grow itself", () => {
    const { container } = render(
      <ScaledFrame width={640} srcDoc="<p>Hi</p>" title="Order confirmed" />
    )
    const frame = container.querySelector("iframe")!
    const seen: string[] = []
    Object.defineProperty(
      frame.contentDocument!.documentElement,
      "scrollHeight",
      {
        configurable: true,
        get: () => {
          seen.push(frame.style.height)
          return 700
        },
      }
    )

    fireEvent.load(frame)
    expect(seen).toContain("0px")
    expect(frame.style.height).toBe("700px")
  })

  it("keeps the last height when the frame moves to a page it can't read", () => {
    const { container } = render(
      <ScaledFrame width={640} srcDoc="<p>Hi</p>" title="Order confirmed" />
    )
    const frame = container.querySelector("iframe")!
    Object.defineProperty(
      frame.contentDocument!.documentElement,
      "scrollHeight",
      { configurable: true, get: () => 900 }
    )
    fireEvent.load(frame)
    expect(slot(container, "scaled-frame-box").style.height).toBe("450px")

    vi.spyOn(frame, "contentDocument", "get").mockReturnValue(null)
    fireEvent.load(frame)
    expect(slot(container, "scaled-frame-box").style.height).toBe("450px")
  })

  it("measures a document that finished loading before it mounted", () => {
    const loaded = {
      readyState: "complete",
      URL: "about:srcdoc",
      documentElement: { scrollHeight: 600 },
      body: { scrollHeight: 0 },
    }
    vi.spyOn(
      HTMLIFrameElement.prototype,
      "contentDocument",
      "get"
    ).mockReturnValue(loaded as unknown as Document)

    const { container } = render(
      <ScaledFrame width={640} srcDoc="<p>Hi</p>" title="Order confirmed" />
    )
    expect(slot(container, "scaled-frame-box").style.height).toBe("300px")
  })

  it("scales children, not an iframe, while the children are still undefined", () => {
    const { container } = render(
      <ScaledFrame width={640}>{undefined}</ScaledFrame>
    )
    expect(container.querySelector("iframe")).toBeNull()
  })

  it("sandboxes the iframe and sends no referrer", () => {
    const { container } = render(
      <ScaledFrame
        width={640}
        src="https://example.com/email"
        title="Order confirmed"
      />
    )
    const frame = container.querySelector("iframe")!
    expect(frame.getAttribute("title")).toBe("Order confirmed")
    expect(frame.getAttribute("sandbox")).toBe("allow-same-origin")
    expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer")
    expect(frame.getAttribute("src")).toBe("https://example.com/email")
  })

  it("caps the height with maxHeight and scrolls inside a focusable box", () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === "scaled-frame" ? 2000 : 0
      }
    )
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === "scaled-frame" ? 256 : 0
      }
    )
    const { container } = render(
      <ScaledFrame
        width={375}
        height={2000}
        maxHeight="16rem"
        srcDoc=""
        title="Order confirmed on a phone"
        aria-label="Order confirmed on a phone"
      />
    )
    const root = slot(container, "scaled-frame")
    expect(root.style.maxHeight).toBe("16rem")
    expect(root.tabIndex).toBe(0)
    expect(root.getAttribute("role")).toBe("region")
    expect(root.style.scrollbarGutter).toBe("stable")
    expect(root.className).toContain("overflow-y-auto")
  })

  it("doesn't take focus while capped content still fits", () => {
    const { container } = render(
      <ScaledFrame
        width={375}
        height={100}
        maxHeight="16rem"
        srcDoc=""
        title="Short email"
      />
    )
    const root = slot(container, "scaled-frame")
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(root.getAttribute("role")).toBe("region")
  })

  it("becomes focusable when the capped box shrinks under its content", () => {
    let visible = 2000
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === "scaled-frame" ? 1000 : 0
      }
    )
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === "scaled-frame" ? visible : 0
      }
    )
    const { container } = render(
      <ScaledFrame
        width={375}
        height={1000}
        maxHeight="50vh"
        srcDoc=""
        title="Order confirmed"
      />
    )
    const root = slot(container, "scaled-frame")
    expect(root.hasAttribute("tabindex")).toBe(false)

    visible = 400
    resizeAll()
    expect(root.tabIndex).toBe(0)
  })

  it("lets go of the document's observer once a height is given", () => {
    const { container, rerender } = render(
      <ScaledFrame width={640} srcDoc="<p>Hi</p>" title="Order confirmed" />
    )
    const frame = container.querySelector("iframe")!
    Object.assign(frame.contentWindow!, { ResizeObserver: RecordingObserver })
    fireEvent.load(frame)
    const documentObserver = observers.at(-1)!
    expect(documentObserver.targets.length).toBeGreaterThan(0)

    rerender(
      <ScaledFrame
        width={640}
        height={1000}
        srcDoc="<p>Hi</p>"
        title="Order confirmed"
      />
    )
    expect(documentObserver.targets).toEqual([])
  })

  it("watches the body's content, which grows while a viewport-high root stays still", () => {
    const { container } = render(
      <ScaledFrame width={640} srcDoc="<div>Hi</div>" title="Order confirmed" />
    )
    const frame = container.querySelector("iframe")!
    const document = frame.contentDocument!
    const wrapper = document.createElement("table")
    document.body.appendChild(wrapper)
    Object.assign(frame.contentWindow!, { ResizeObserver: RecordingObserver })

    fireEvent.load(frame)
    expect(observers.at(-1)!.targets).toEqual(
      expect.arrayContaining([document.documentElement, document.body, wrapper])
    )
  })

  it("stops measuring once a height is given", () => {
    const { container } = render(
      <ScaledFrame
        width={640}
        height={1000}
        srcDoc="<p>Hi</p>"
        title="Order confirmed"
      />
    )
    const frame = container.querySelector("iframe")!
    const reads = vi.fn(() => 300)
    Object.defineProperty(
      frame.contentDocument!.documentElement,
      "scrollHeight",
      { configurable: true, get: reads }
    )
    fireEvent.load(frame)
    expect(reads).not.toHaveBeenCalled()
    expect(slot(container, "scaled-frame-box").style.height).toBe("500px")
  })

  it("renders the titled iframe while its document is still on the way", () => {
    const { container } = render(
      <ScaledFrame width={640} srcDoc={undefined} title="Order confirmed" />
    )
    expect(container.querySelector("iframe")?.getAttribute("title")).toBe(
      "Order confirmed"
    )
  })

  it("doesn't take focus without maxHeight", () => {
    const { container } = render(
      <ScaledFrame width={640}>
        <p>Storefront</p>
      </ScaledFrame>
    )
    expect(slot(container, "scaled-frame").hasAttribute("tabindex")).toBe(false)
    expect(slot(container, "scaled-frame").hasAttribute("role")).toBe(false)
  })

  it("asks for a title with a document and refuses one with children", () => {
    // @ts-expect-error a document needs a title
    const untitled = <ScaledFrame width={640} srcDoc="" />
    // @ts-expect-error children don't take a title
    const titled = <ScaledFrame width={640} title="x" children={<p />} />
    expect([untitled, titled]).toHaveLength(2)
  })
})
