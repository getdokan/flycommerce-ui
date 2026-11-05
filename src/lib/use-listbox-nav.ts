import * as React from "react"

/** The highlight of a listbox driven from a search field or the list itself: arrows skip disabled rows and Enter chooses. */
function useListboxNav<Row extends { disabled?: boolean }>({
  rows,
  getKey,
  onChoose,
  initialKey,
  firstIndex = 0,
}: {
  rows: Row[]
  /** The highlight follows this, so it stays on its row when the rows change. */
  getKey: (row: Row) => string
  onChoose: (row: Row) => void
  initialKey?: string
  /** Where the highlight starts when no row holds it. */
  firstIndex?: number
}) {
  const [activeKey, setActiveKey] = React.useState(initialKey)
  // State, not a ref: a list in a portal mounts after the effect of the render that opened it.
  const [list, setList] = React.useState<HTMLElement | null>(null)

  const usable = (from: number, by: 1 | -1) => {
    for (let i = from; i >= 0 && i < rows.length; i += by) {
      if (!rows[i]!.disabled) return i
    }
    return -1
  }
  const found =
    activeKey === undefined
      ? -1
      : rows.findIndex((row) => getKey(row) === activeKey)
  const activeIndex =
    found >= 0 && !rows[found]!.disabled ? found : usable(firstIndex, 1)
  const current: Row | undefined = rows[activeIndex]
  const currentKey = current && getKey(current)

  React.useEffect(() => {
    list?.querySelector("[data-active]")?.scrollIntoView?.({ block: "nearest" })
  }, [list, currentKey, rows.length])

  const highlight = (index: number) => {
    if (index >= 0) setActiveKey(getKey(rows[index]!))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const by = event.key === "ArrowDown" ? 1 : -1
      highlight(
        activeIndex < 0
          ? usable(by > 0 ? 0 : rows.length - 1, by)
          : usable(activeIndex + by, by)
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (current) onChoose(current)
    }
  }

  return {
    activeIndex,
    current,
    /** The `ref` of the list, or an element around it. */
    setList,
    highlight,
    setActiveKey,
    onKeyDown,
  }
}

export { useListboxNav }
