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
} from "@/index"
import { SEED } from "./media-demos"

export function MediaLibraryGridDemo() {
  const [selected, setSelected] = React.useState<string[]>([])
  const items = SEED.filter((item) => !item.isPrivate)

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
            {items.length} files
          </span>
        )}
      </div>
      <MediaGrid
        className="p-5"
        items={items}
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
