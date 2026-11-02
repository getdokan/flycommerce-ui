"use client"

import * as React from "react"
import { cn } from "cn"

type StepMeterLabels = {
  /** Read after a finished step's name. */
  complete?: string
  /** Read after the name of a step still to come. */
  upcoming?: string
}

const DEFAULT_LABELS: Required<StepMeterLabels> = {
  complete: "completed",
  upcoming: "not completed",
}

type StepMeterState = "complete" | "current" | "upcoming"

type StepMeterProps = Omit<React.ComponentProps<"ol">, "children"> & {
  /** The steps' names, in order. Name the list itself with `aria-label`. */
  steps: readonly string[]
  /** The index of the step the user is on; steps before it are complete. Past the last step, every step is complete. */
  current: number
  labels?: StepMeterLabels
}

/** Where the user is in a short flow, such as an import sheet: a bar per step, its name under it. */
function StepMeter({
  steps,
  current,
  labels: labelsProp,
  className,
  ...props
}: StepMeterProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  // A fraction from arithmetic still marks a step; NaN marks none.
  const at = Number.isNaN(current) ? -1 : Math.floor(current)

  return (
    <ol
      data-slot="step-meter"
      // Safari drops list semantics from a list without markers unless the role is explicit.
      role="list"
      className={cn(
        "grid list-none auto-cols-fr grid-flow-col gap-2 p-0",
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const state: StepMeterState =
          index < at ? "complete" : index === at ? "current" : "upcoming"
        return (
          <li
            key={index}
            data-slot="step-meter-step"
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className="min-w-0"
          >
            <span
              aria-hidden
              className={cn(
                "block h-1 rounded-full",
                state === "upcoming" ? "bg-border" : "bg-primary"
              )}
            />
            <span
              // relative keeps the sr-only state word inside the step.
              className={cn(
                "relative mt-2 block text-xs break-words",
                state === "upcoming"
                  ? "text-muted-foreground"
                  : "text-foreground",
                state === "current" && "font-semibold"
              )}
            >
              {step}
              {state !== "current" && (
                <span className="sr-only">
                  , {state === "complete" ? labels.complete : labels.upcoming}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export {
  StepMeter,
  type StepMeterLabels,
  type StepMeterProps,
  type StepMeterState,
}
