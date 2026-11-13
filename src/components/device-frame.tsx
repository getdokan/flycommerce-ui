"use client"

import * as React from "react"
import { cn } from "cn"

type DeviceFrameProps = React.ComponentProps<"figure"> & {
  /** The device drawn around the preview; only `phone` for now. */
  device?: "phone"
  /** Names the preview, e.g. "Phone preview"; the frame is then a `figure`. */
  label?: string
  /** `card` follows the theme; `white` stays white in dark mode, for content that brings its own colours, such as an email. */
  screen?: "card" | "white"
  screenClassName?: string
}

function useScrolls(ref: React.RefObject<HTMLDivElement | null>) {
  const [scrolls, setScrolls] = React.useState(false)

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    // Stays focusable while focused, so a shrinking preview doesn't drop focus to the page.
    const measure = () =>
      setScrolls(
        element.scrollHeight > element.clientHeight ||
          element.ownerDocument.activeElement === element
      )
    const sizes =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    const watch = () => {
      if (!sizes) return
      sizes.disconnect()
      sizes.observe(element)
      for (const child of Array.from(element.children)) sizes.observe(child)
    }
    const changes =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((records) => {
            if (records.some((r) => r.target === element)) watch()
            measure()
          })
    watch()
    measure()
    changes?.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    element.addEventListener("load", measure, true)
    element.addEventListener("blur", measure)
    element.ownerDocument.fonts?.ready.then(measure)
    return () => {
      sizes?.disconnect()
      changes?.disconnect()
      element.removeEventListener("load", measure, true)
      element.removeEventListener("blur", measure)
    }
  }, [ref])

  return scrolls
}

/** A phone around a live preview, up to `--device-frame-width` (20rem) wide; its content scrolls inside the screen. */
function DeviceFrame({
  device = "phone",
  label,
  screen = "card",
  screenClassName,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: DeviceFrameProps) {
  const content = React.useRef<HTMLDivElement>(null)
  const scrolls = useScrolls(content)
  const name = label || ariaLabel || undefined
  const labelledBy = props["aria-labelledby"]
  const Root = name || labelledBy ? "figure" : "div"
  const white = screen === "white"

  return (
    <Root
      data-slot="device-frame"
      data-device={device}
      data-screen={screen}
      className={cn("device-frame my-0 min-w-0", className)}
      {...(props as React.ComponentProps<"div">)}
      aria-label={name}
    >
      <div
        data-slot="device-frame-bezel"
        className="rounded-(--device-frame-radius) bg-device-bezel p-(--device-frame-bezel) shadow-device forced-colors:outline"
      >
        <div
          data-slot="device-frame-screen"
          className={cn(
            "flex aspect-6/13 flex-col overflow-hidden rounded-(--device-frame-screen-radius) contain-layout",
            white
              ? "bg-white text-on-light scheme-light"
              : "bg-card text-card-foreground",
            screenClassName
          )}
        >
          <div
            ref={content}
            data-slot="device-frame-content"
            tabIndex={scrolls ? 0 : undefined}
            role={scrolls && (name || labelledBy) ? "group" : undefined}
            aria-label={scrolls ? name : undefined}
            aria-labelledby={scrolls && !name ? labelledBy : undefined}
            className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-(--device-frame-screen-radius) outline-hidden focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring focus-visible:outline-solid"
          >
            {children}
          </div>
          <div aria-hidden="true" className="flex shrink-0 justify-center py-2">
            <span
              data-slot="device-frame-home-bar"
              className={cn(
                "block h-1 w-1/3 rounded-full forced-colors:bg-[CanvasText]",
                white ? "bg-device-home-bar" : "bg-foreground/20"
              )}
            />
          </div>
        </div>
      </div>
    </Root>
  )
}

export { DeviceFrame, type DeviceFrameProps }
