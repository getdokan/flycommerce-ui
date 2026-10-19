import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(cleanup)

// Browser APIs jsdom doesn't implement but Radix, cmdk, vaul, embla, recharts and ProseMirror expect.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IntersectionObserverStub {
  root = null
  rootMargin = ""
  thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
Object.assign(globalThis, {
  ResizeObserver: ResizeObserverStub,
  IntersectionObserver: IntersectionObserverStub,
})
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
URL.createObjectURL ??= () => "blob:test"
Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList
Range.prototype.getBoundingClientRect ??= () => new DOMRect()
