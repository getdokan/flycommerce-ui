import { FiExternalLink as ExternalLinkIcon } from "react-icons/fi"

import {
  Badge,
  Button,
  PreviewTile,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/index"

export function PreviewTileDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[
        {
          name: "Lumen",
          version: "2.4.0",
          src: "https://picsum.photos/seed/fc-theme-lumen/800/600",
          live: true,
          status: "Updated 3 days ago",
        },
        {
          name: "Atlas",
          version: "1.8.2",
          src: "https://picsum.photos/seed/fc-theme-atlas/800/600",
          status: "Free · 1,240 stores",
          installable: true,
        },
        {
          name: "Meridian",
          version: "3.0.1",
          src: "https://example.invalid/meridian.png",
          status: "Premium · $49",
        },
      ].map((theme) => (
        <PreviewTile
          key={theme.name}
          src={theme.src}
          alt={`${theme.name} home page`}
          label="Look inside"
          openLabel={`Look inside ${theme.name}`}
          onOpen={() => {}}
          highlighted={theme.live}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold">{theme.name}</div>
              <div className="text-xs text-muted-foreground">
                Version {theme.version}
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" asChild>
                  <a
                    href="#preview-tile"
                    aria-label={`${theme.name} in the theme store`}
                  >
                    <ExternalLinkIcon />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View in the theme store</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {theme.status}
            </span>
            {theme.live ? (
              <Badge variant="success" dot>
                Live on your store
              </Badge>
            ) : (
              theme.installable && (
                <Button size="sm" variant="outline">
                  Install
                </Button>
              )
            )}
          </div>
        </PreviewTile>
      ))}
    </div>
  )
}
