import * as React from "react"
import { toast } from "sonner"

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  MediaGrid,
  type MediaItem,
} from "@/index"

const ITEMS: MediaItem[] = [
  ...["sneaker-red", "watch-steel", "tee-white", "bag-leather"].map(
    (name, index) => ({
      id: name,
      name: `${name}.jpg`,
      url: `https://picsum.photos/seed/fcm-${index}/900/900`,
      thumbnailUrl: `https://picsum.photos/seed/fcm-${index}/300/300`,
      mimeType: "image/jpeg",
      size: 240_000 + index * 91_000,
    })
  ),
  {
    id: "unboxing",
    name: "unboxing.mp4",
    url: "https://picsum.photos/seed/fcm-video/900/900",
    thumbnailUrl: "https://picsum.photos/seed/fcm-video/300/300",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "size-guide",
    name: "size-guide.pdf",
    url: "https://example.com/size-guide.pdf",
    mimeType: "application/pdf",
    size: 86_016,
  },
]

export function MediaLibraryGridDemo() {
  const [selected, setSelected] = React.useState<string[]>([])

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-1">
      <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-3">
        {selected.length > 0 ? (
          <>
            <span className="text-sm font-[560]">
              {selected.length} selected
            </span>
            <Button variant="link" size="sm" onClick={() => setSelected([])}>
              Clear
            </Button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {ITEMS.length} files
          </span>
        )}
      </div>
      <MediaGrid
        className="p-5"
        items={ITEMS}
        multiple
        selected={selected}
        onSelectedChange={setSelected}
        onOpen={(item) => toast(`Open the details of ${item.name}`)}
        actions={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Actions for ${item.name}`}
              >
                <Icon name="more" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Copy URL</DropdownMenuItem>
              {!item.videoUrl && <DropdownMenuItem>Download</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        caption
        description={(item) => (item.videoUrl ? "YouTube video" : undefined)}
        aspect="square"
        columns="responsive"
      />
    </div>
  )
}
