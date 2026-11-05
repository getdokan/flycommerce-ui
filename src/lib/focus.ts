import * as React from "react"

type FocusTarget =
  | HTMLElement
  | null
  | React.RefObject<HTMLElement | null>
  | (() => HTMLElement | null | undefined)

function resolveFocusTarget(target: FocusTarget | undefined) {
  if (!target) return null
  if (typeof target === "function") return target() ?? null
  if ("current" in target) return target.current
  return target
}

/** When the component leaves the page with focus inside `rootRef`, focus goes to `target`, read at that moment. */
function useReturnFocus(
  rootRef: React.RefObject<HTMLElement | null>,
  target: FocusTarget | undefined
) {
  const targetRef = React.useRef(target)
  React.useEffect(() => {
    targetRef.current = target
  })
  const hadFocus = React.useRef(false)
  // A layout effect's cleanup runs before the node is removed, while focus is still inside.
  React.useLayoutEffect(() => {
    const root = rootRef.current
    return () => {
      hadFocus.current = root?.contains(document.activeElement) ?? false
    }
  }, [rootRef])
  React.useEffect(
    () => () => {
      if (!hadFocus.current) return
      hadFocus.current = false
      const element = resolveFocusTarget(targetRef.current)
      if (element?.isConnected) element.focus()
    },
    []
  )
}

export { resolveFocusTarget, useReturnFocus, type FocusTarget }
