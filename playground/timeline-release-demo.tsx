import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/index"

const THEME_RELEASES = [
  {
    version: "1.0.4",
    date: "Oct 21, 2026",
    at: "2026-10-21",
    notes: "Sticky header on phones, and faster product images.",
  },
  {
    version: "1.0.3",
    date: "Oct 2, 2026",
    at: "2026-10-02",
    notes: "Fixes the cart drawer on right-to-left stores.",
  },
  {
    version: "1.0.2",
    date: "Sep 12, 2026",
    at: "2026-09-12",
    notes: "Adds a size guide block to product pages.",
  },
  {
    version: "1.0.1",
    date: "Aug 28, 2026",
    at: "2026-08-28",
    notes: "First release.",
  },
]
const INSTALLED_VERSION = "1.0.2"

export function TimelineReleaseHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Release history</CardTitle>
        <CardDescription>
          Newest first, with the installed version highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline>
          {THEME_RELEASES.map((release, index) => {
            const installed = release.version === INSTALLED_VERSION
            return (
              <TimelineItem
                key={release.version}
                tone={index === 0 ? "primary" : "default"}
                highlighted={installed}
                highlightedLabel="Your version"
              >
                <TimelineHeader>
                  <TimelineTitle className="flex flex-wrap items-center gap-2">
                    {release.version}
                    {index === 0 && <Badge variant="success">Latest</Badge>}
                    {installed && (
                      <Badge variant="outline" aria-hidden>
                        Your version
                      </Badge>
                    )}
                  </TimelineTitle>
                  <TimelineTime dateTime={release.at}>
                    {release.date}
                  </TimelineTime>
                </TimelineHeader>
                <TimelineDescription>{release.notes}</TimelineDescription>
              </TimelineItem>
            )
          })}
        </Timeline>
      </CardContent>
    </Card>
  )
}
