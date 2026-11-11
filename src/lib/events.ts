import type * as React from "react"

/** A left click with no modifier, the only one a client-side router should take over. */
function isPlainClick(event: React.MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

export { isPlainClick }
