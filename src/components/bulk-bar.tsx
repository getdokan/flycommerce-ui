"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type BulkBarPageState = "all" | "some" | "none"

type BulkBarLabels = {
  /** Names the page checkbox. */
  pageCheckbox?: string
  /** The count; `formatted` is `count` in the `locale`. */
  selected?: (count: number, formatted: string) => React.ReactNode
  /** The button that selects the rest of the page. */
  selectPage?: string
  clear?: string
}

const DEFAULT_LABELS: Required<BulkBarLabels> = {
  pageCheckbox: "Select all on this page",
  selected: (_count, formatted) => `${formatted} selected`,
  selectPage: "Select all on page",
  clear: "Clear",
}

type BulkBarFocusTarget =
  | HTMLElement
  | null
  | React.RefObject<HTMLElement | null>
  | (() => HTMLElement | null | undefined)

function resolveTarget(target: BulkBarFocusTarget | undefined) {
  if (!target) return null
  if (typeof target === "function") return target() ?? null
  if ("current" in target) return target.current
  return target
}

type BulkBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Every selected item, on this page and on others. */
  selectedCount: number
  /** How much of the current page is selected: the page checkbox is ticked, a dash, or empty. */
  pageState: BulkBarPageState
  /** The page checkbox changed: `true` selects every item on the page, `false` clears the page. */
  onPageCheckedChange: (checked: boolean) => void
  /** "Select all on page", shown until the whole page is selected. Defaults to `onPageCheckedChange(true)`. */
  onSelectPage?: () => void
  /** Clears the whole selection. */
  onClear: () => void
  /** Buttons at the end, before Clear, e.g. Download and Delete. */
  actions?: React.ReactNode
  /**
   * Where focus goes when the bar goes away with focus in it, e.g. after Clear: usually the toolbar's search, which
   * is back by then. An element, a ref, or a function read at that moment.
   */
  returnFocusTo?: BulkBarFocusTarget
  /** Formats the count; the browser's locale by default. */
  locale?: string
  labels?: BulkBarLabels
}

/** Stands in for a toolbar while items are selected: the page checkbox, "{n} selected", then actions and Clear. */
function BulkBar({
  selectedCount,
  pageState,
  onPageCheckedChange,
  onSelectPage,
  onClear,
  actions,
  returnFocusTo,
  locale,
  labels: labelsProp,
  className,
  ...props
}: BulkBarProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const format = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const checkboxRef = React.useRef<HTMLButtonElement>(null)
  const selectingPage = React.useRef(false)

  const selectPage = () => {
    selectingPage.current = true
    if (onSelectPage) onSelectPage()
    else onPageCheckedChange(true)
  }

  // Focus that fell out of a removed control lands on the page, or on a focus trap's container around the bar.
  const focusFell = () => {
    const active = document.activeElement
    const root = checkboxRef.current?.closest("[data-slot=bulk-bar]")
    return !active || (root != null && active.contains(root))
  }

  // The button goes once the page is selected, so the page checkbox takes its focus.
  // Any other change of the page forgets the click, so a page filled later in another way doesn't move focus.
  React.useEffect(() => {
    const selecting = selectingPage.current
    selectingPage.current = false
    if (pageState === "all" && selecting && focusFell())
      checkboxRef.current?.focus()
  }, [pageState])

  const returnFocusRef = React.useRef(returnFocusTo)
  React.useEffect(() => {
    returnFocusRef.current = returnFocusTo
  })
  // Read before the bar leaves the page: only focus that was in it goes to returnFocusTo.
  const hadFocus = React.useRef(false)
  React.useLayoutEffect(() => {
    const root = checkboxRef.current?.closest("[data-slot=bulk-bar]")
    return () => {
      hadFocus.current = root?.contains(document.activeElement) ?? false
    }
  }, [])
  React.useEffect(
    () => () => {
      if (!hadFocus.current) return
      hadFocus.current = false
      const target = resolveTarget(returnFocusRef.current)
      if (target?.isConnected) target.focus()
    },
    []
  )

  return (
    <div
      data-slot="bulk-bar"
      data-page-state={pageState}
      className={cn(
        "@container/bulk-bar border-b border-border-subtle bg-primary-subtle-2 px-5 py-3",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <Checkbox
            ref={checkboxRef}
            aria-label={labels.pageCheckbox}
            checked={
              pageState === "all"
                ? true
                : pageState === "some"
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(checked) => onPageCheckedChange(checked === true)}
          />
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-sm font-[560] tabular-nums"
          >
            {labels.selected(selectedCount, format.format(selectedCount))}
          </span>
          {pageState !== "all" && (
            <Button variant="ghost" size="sm" onClick={selectPage}>
              {labels.selectPage}
            </Button>
          )}
        </div>
        {/* On a narrow bar the buttons take their own line. */}
        <div className="flex basis-full flex-wrap items-center gap-2 @lg/bulk-bar:ms-auto @lg/bulk-bar:basis-auto">
          {actions}
          <Button variant="ghost" size="sm" onClick={onClear}>
            {labels.clear}
          </Button>
        </div>
      </div>
    </div>
  )
}

export {
  BulkBar,
  type BulkBarProps,
  type BulkBarPageState,
  type BulkBarLabels,
  type BulkBarFocusTarget,
}
