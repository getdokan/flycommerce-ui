"use client"

import * as React from "react"
import { cn } from "cn"

type ScaledFrameBaseProps = Omit<
  React.ComponentProps<"div">,
  "children" | "title"
> & {
  /** The design width the content is laid out at, in CSS pixels, e.g. 640 for an email or 375 for a phone. */
  width: number
  /** The content's design height; measured from the content when omitted. Set it for a cross-origin `src`, which can't be measured. */
  height?: number
  /** Scale up past the design width when the box is wider; by default it only scales down. */
  upscale?: boolean
  /** Caps the box's height on screen; taller content scrolls inside it. */
  maxHeight?: React.CSSProperties["maxHeight"]
}

type ScaledFrameContentProps = ScaledFrameBaseProps & {
  children: React.ReactNode
  srcDoc?: never
  src?: never
  title?: never
  sandbox?: never
}

type ScaledFrameDocumentProps = ScaledFrameBaseProps & {
  /** An HTML document to render in a sandboxed iframe, e.g. an email. */
  srcDoc?: string
  /** A page to render in a sandboxed iframe. */
  src?: string
  /** Names the iframe for screen readers, e.g. "Order confirmed preview". */
  title: string
  /** The iframe's sandbox; `allow-same-origin` lets the frame measure the document's height. Never add `allow-scripts` to it for HTML you don't trust: together they let the document lift its own sandbox. */
  sandbox?: string
  children?: never
}

type ScaledFrameProps = ScaledFrameContentProps | ScaledFrameDocumentProps

function useSize<T extends Element>(
  ref: React.RefObject<T | null> | null,
  read: (element: T) => number
) {
  const [size, setSize] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const element = ref?.current
    if (!element || typeof ResizeObserver === "undefined") return
    const measure = () => setSize(read(element) || null)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, read])

  return size
}

const readWidth = (element: HTMLElement) => element.clientWidth
const readHeight = (element: HTMLElement) => element.offsetHeight

// Measured with the frame collapsed, so a document sized to its viewport (height: 100%, 100vh) can't feed its own height back.
function documentHeight(frame: HTMLIFrameElement) {
  const document = frame.contentDocument
  if (!document?.documentElement) return 0
  const height = frame.style.height
  frame.style.height = "0px"
  const measured = Math.max(
    document.documentElement.scrollHeight,
    document.body?.scrollHeight ?? 0
  )
  frame.style.height = height
  return Math.ceil(measured)
}

/** Lays content out at a design width and scales it to fit its box, reserving the scaled height. */
function ScaledFrame({
  width,
  height,
  upscale = false,
  maxHeight,
  srcDoc,
  src,
  title,
  sandbox = "allow-same-origin",
  children,
  className,
  style,
  ...props
}: ScaledFrameProps) {
  const box = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLIFrameElement>(null)
  const isDocument =
    title !== undefined || srcDoc !== undefined || src !== undefined
  const boxWidth = useSize(box, readWidth)
  const childrenHeight = useSize(isDocument ? null : content, readHeight)
  const [frameHeight, setFrameHeight] = React.useState<number | null>(null)
  const watcher = React.useRef<ResizeObserver | null>(null)
  const [overflows, setOverflows] = React.useState(false)

  React.useEffect(() => () => watcher.current?.disconnect(), [])

  const watchDocument = React.useCallback(() => {
    watcher.current?.disconnect()
    watcher.current = null
    const element = frame.current
    if (!element || height !== undefined) return
    const measure = () => {
      const measured = documentHeight(element)
      if (measured) setFrameHeight(measured)
    }
    measure()
    const view = element.contentWindow as
      (Window & { ResizeObserver?: typeof ResizeObserver }) | null
    const document = element.contentDocument
    const Observer = view?.ResizeObserver
    if (!document?.documentElement || !Observer) return
    const observer = new Observer(measure)
    watcher.current = observer
    // A page sized to its viewport keeps its root and body still as content grows, so watch the content too.
    for (const target of [
      document.documentElement,
      ...(document.body ? [document.body, ...document.body.children] : []),
    ])
      observer.observe(target)
  }, [height])

  React.useLayoutEffect(() => {
    const document = frame.current?.contentDocument
    const loaded =
      document?.readyState === "complete" && document.URL !== "about:blank"
    if (loaded || height !== undefined) watchDocument()
  }, [watchDocument, height])

  const designWidth = width > 0 ? width : 1
  const fit = boxWidth ? boxWidth / designWidth : 1
  const scale = upscale ? fit : Math.min(1, fit)
  const designHeight =
    height ?? (isDocument ? frameHeight : childrenHeight) ?? 0
  const offset = boxWidth
    ? Math.max(0, (boxWidth - designWidth * scale) / 2)
    : 0
  const scrolls = maxHeight !== undefined

  React.useLayoutEffect(() => {
    const root = box.current?.parentElement
    if (!scrolls || !root) {
      setOverflows(false)
      return
    }
    const check = () => setOverflows(root.scrollHeight > root.clientHeight + 1)
    check()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(check)
    observer.observe(root)
    return () => observer.disconnect()
  }, [scrolls, maxHeight, designHeight, scale])

  return (
    <div
      data-slot="scaled-frame"
      role={scrolls ? "region" : undefined}
      tabIndex={overflows ? 0 : undefined}
      className={cn(
        "w-full min-w-0",
        scrolls
          ? "overflow-y-auto rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          : "overflow-hidden",
        className
      )}
      style={{
        maxHeight,
        scrollbarGutter: scrolls ? "stable" : undefined,
        ...style,
      }}
      {...props}
    >
      <div
        ref={box}
        data-slot="scaled-frame-box"
        className="relative w-full overflow-hidden"
        style={{ height: designHeight * scale }}
      >
        <div
          ref={content}
          data-slot="scaled-frame-content"
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: designWidth,
            transform: `translateX(${offset}px) scale(${scale})`,
          }}
        >
          {isDocument ? (
            <iframe
              ref={frame}
              title={title}
              srcDoc={srcDoc}
              src={src}
              sandbox={sandbox}
              referrerPolicy="no-referrer"
              onLoad={watchDocument}
              className="block w-full border-0 bg-white"
              style={{ height: designHeight }}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}

export { ScaledFrame, type ScaledFrameProps }
