import { MediaTile, type MediaItem } from "@/index"

const item: MediaItem = { id: "1", name: "a.jpg", url: "/a.jpg" }

export const accepted = [
  <MediaTile item={item} />,
  <MediaTile item={item} onClick={() => {}} />,
  <MediaTile item={item} onOpen={() => {}} />,
  <MediaTile item={item} onSelectedChange={() => {}} />,
  <MediaTile item={item} onOpen={() => {}} onSelectedChange={() => {}} />,
]

export const rejected = [
  // @ts-expect-error onOpen would silently beat onClick
  <MediaTile item={item} onClick={() => {}} onOpen={() => {}} />,
  // @ts-expect-error the checkbox would silently replace onClick
  <MediaTile item={item} onClick={() => {}} onSelectedChange={() => {}} />,
]
