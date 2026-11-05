import * as React from "react"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StepMeter,
} from "@/index"

const IMPORT_STEPS = ["Upload", "Map columns", "Import"]

export function StepMeterDemo() {
  const [current, setCurrent] = React.useState(1)
  const done = current >= IMPORT_STEPS.length

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Import products</CardTitle>
        <CardDescription>
          A step meter above a sheet's steps. Finished steps read as completed
          to a screen reader.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StepMeter
          steps={IMPORT_STEPS}
          current={current}
          aria-label="Import steps"
        />
        <p className="text-sm text-muted-foreground">
          {done ? "Every step is complete." : `On “${IMPORT_STEPS[current]}”.`}
        </p>
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((step) => step - 1)}
          >
            Back
          </Button>
          <Button
            disabled={done}
            onClick={() => setCurrent((step) => step + 1)}
          >
            {current === IMPORT_STEPS.length - 1 ? "Finish" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
