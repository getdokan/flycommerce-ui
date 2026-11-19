import * as React from "react"
import { FiInfo as InfoIcon } from "react-icons/fi"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
} from "@/index"

export function AlertDismissDemo() {
  const [notice, setNotice] = React.useState(true)
  const [trial, setTrial] = React.useState(true)
  const choosePlan = React.useRef<HTMLButtonElement>(null)
  const showAgain = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="grid w-full gap-3">
      {notice && (
        <Alert
          variant="info"
          onDismiss={() => {
            setNotice(false)
            ;(trial ? choosePlan : showAgain).current?.focus()
          }}
          dismissLabel="Dismiss notice"
        >
          <InfoIcon />
          <AlertTitle>Essential emails now always send</AlertTitle>
          <AlertDescription>
            Order confirmations and password resets go out even if they were
            turned off before.
          </AlertDescription>
        </Alert>
      )}
      {trial && (
        <Alert
          variant="warning"
          onDismiss={() => {
            setTrial(false)
            showAgain.current?.focus()
          }}
          dismissLabel="Dismiss trial reminder"
        >
          <AlertTitle>Your free trial ends in 3 days</AlertTitle>
          <AlertDescription>
            Choose a plan to keep your store open.
          </AlertDescription>
          <AlertAction>
            <Button ref={choosePlan} size="sm">
              Choose a plan
            </Button>
          </AlertAction>
        </Alert>
      )}
      <Button
        ref={showAgain}
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          setNotice(true)
          setTrial(true)
        }}
      >
        Show the alerts again
      </Button>
    </div>
  )
}
