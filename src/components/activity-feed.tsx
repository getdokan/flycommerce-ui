"use client"

import * as React from "react"
import { cn } from "cn"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Field, FieldError, FieldLabel } from "./ui/field"
import { Separator } from "./ui/separator"
import { Textarea } from "./ui/textarea"
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  type TimelineTone,
} from "./timeline"

type ActivityFeedEntry = {
  id: string
  title: React.ReactNode
  /** As shown, e.g. "Oct 14, 10:02 AM". */
  time: React.ReactNode
  /** ISO moment for the `<time>` element. */
  dateTime?: string
  description?: React.ReactNode
  tone?: TimelineTone
  icon?: React.ReactNode
  /** Something a person wrote: the text sits in its own shaded box. */
  note?: boolean
}

type ActivityFeedLabels = {
  title?: React.ReactNode
  noteLabel?: string
  notePlaceholder?: string
  addNote?: string
  addingNote?: string
  noteRequired?: string
  noteTooLong?: (max: number) => string
  noteCount?: (count: number, max: number) => string
  addNoteError?: string
  empty?: React.ReactNode
}

const DEFAULT_LABELS: Required<ActivityFeedLabels> = {
  title: "Activity",
  noteLabel: "Add a note",
  notePlaceholder: "Add a note for your team",
  addNote: "Add note",
  addingNote: "Adding",
  noteRequired: "Write a note first.",
  noteTooLong: (max: number) => `Keep notes to ${max} characters or fewer.`,
  noteCount: (count: number, max: number) => `${count} / ${max}`,
  addNoteError: "The note couldn't be added. Try again.",
  empty: "No activity yet.",
}

// `0` is content; only nothing, false and "" mean there is no text to show.
const present = (node: React.ReactNode) =>
  node != null && node !== false && node !== ""

type ActivityFeedProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Shown in the order given; most activity logs pass newest first. */
  entries: ActivityFeedEntry[]
  description?: React.ReactNode
  /** Shows the note box. It clears on resolve; on reject it shows `labels.addNoteError` and keeps the text. */
  onAddNote?: (text: string) => void | Promise<unknown>
  noteMaxLength?: number
  /** The title's heading level, to fit the page's outline. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** Turns the note box off, e.g. while the record is locked. */
  disabled?: boolean
  labels?: ActivityFeedLabels
}

/** A record's history with an optional note box: order activity, customer or vendor logs. */
function ActivityFeed({
  entries,
  description,
  onAddNote,
  noteMaxLength = 500,
  headingLevel = 2,
  disabled = false,
  labels: labelsProp,
  className,
  ...props
}: ActivityFeedProps) {
  const labels: Required<ActivityFeedLabels> = {
    ...DEFAULT_LABELS,
    ...labelsProp,
  }
  const titleId = React.useId()

  return (
    <Card data-slot="activity-feed" className={className} {...props}>
      <CardHeader>
        <CardTitle id={titleId} role="heading" aria-level={headingLevel}>
          {labels.title}
        </CardTitle>
        {present(description) && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      {onAddNote && (
        <>
          <CardContent>
            <NoteComposer
              onAddNote={onAddNote}
              maxLength={noteMaxLength}
              disabled={disabled}
              labels={labels}
              customCount={Boolean(labelsProp?.noteCount)}
            />
          </CardContent>
          <Separator />
        </>
      )}
      <CardContent>
        {entries.length ? (
          <Timeline aria-labelledby={titleId}>
            {entries.map((entry) => (
              <TimelineItem
                key={entry.id}
                tone={entry.tone ?? (entry.note ? "primary" : "default")}
                icon={entry.icon}
              >
                <TimelineHeader>
                  <TimelineTitle>{entry.title}</TimelineTitle>
                  <TimelineTime dateTime={entry.dateTime}>
                    {entry.time}
                  </TimelineTime>
                </TimelineHeader>
                {present(entry.description) && (
                  <TimelineDescription
                    data-note={entry.note || undefined}
                    className={cn(
                      entry.note &&
                        "mt-1 rounded-lg bg-muted px-3 py-2 whitespace-pre-wrap text-foreground-secondary"
                    )}
                  >
                    {entry.description}
                  </TimelineDescription>
                )}
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        )}
      </CardContent>
    </Card>
  )
}

function NoteComposer({
  onAddNote,
  maxLength,
  disabled,
  labels,
  customCount,
}: {
  onAddNote: NonNullable<ActivityFeedProps["onAddNote"]>
  maxLength: number
  disabled: boolean
  labels: Required<ActivityFeedLabels>
  customCount: boolean
}) {
  const id = React.useId()
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [busy, setBusy] = React.useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const note = text.trim()
    if (!note) return setError(labels.noteRequired)
    // Measured like the count under the field, so the two never disagree.
    if (text.length > maxLength) return setError(labels.noteTooLong(maxLength))
    setBusy(true)
    try {
      await onAddNote(note)
      // Anything typed while it was sending stays.
      setText((current) => (current.trim() === note ? "" : current))
    } catch {
      setError(labels.addNoteError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      {/* relative: keeps the sr-only label positioned inside the component. */}
      <Field data-invalid={error ? true : undefined} className="relative">
        <FieldLabel htmlFor={id} className="sr-only">
          {labels.noteLabel}
        </FieldLabel>
        <Textarea
          id={id}
          rows={2}
          value={text}
          placeholder={labels.notePlaceholder}
          disabled={disabled}
          softLimit={maxLength}
          countLabel={(count, max = maxLength) =>
            customCount ? (
              labels.noteCount(count, max)
            ) : (
              // The built-in "0 / 500" reads backwards in RTL; a translated count keeps its language's order.
              <span dir="ltr">{labels.noteCount(count, max)}</span>
            )
          }
          overLimitLabel={labels.noteTooLong}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-status`}
          onChange={(event) => {
            setText(event.target.value)
            if (error) setError(undefined)
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <div id={`${id}-status`} className="min-w-0">
            {error && <FieldError>{error}</FieldError>}
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={disabled}
            loading={busy}
          >
            {busy ? labels.addingNote : labels.addNote}
          </Button>
        </div>
      </Field>
    </form>
  )
}

export {
  ActivityFeed,
  type ActivityFeedEntry,
  type ActivityFeedLabels,
  type ActivityFeedProps,
}
