import * as React from "react"
import { ImagePlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  Button,
  ConfirmDialog,
  MediaDetailsPanel,
  MediaGrid,
  MediaPickerDialog,
  MediaTile,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UploadQueue,
  type MediaItem,
  type UploadFn,
} from "@/index"

const NAMES = [
  "sneaker-red",
  "watch-steel",
  "tee-white",
  "bag-leather",
  "lamp-desk",
  "mug-ceramic",
  "phone-case",
  "headphones",
  "plant-pot",
  "sunglasses",
  "notebook",
  "candle",
]

const SEED: MediaItem[] = [
  ...NAMES.map((name, i) => ({
    id: `img-${i}`,
    name: `${name}.jpg`,
    url: `https://picsum.photos/seed/fcm-${i}/1920/1440`,
    thumbnailUrl: `https://picsum.photos/seed/fcm-${i}/360/300`,
    mimeType: "image/jpeg",
    size: 90_000 + i * 17_300,
    width: 1920,
    height: 1440,
    date: new Date(2026, 8 - (i % 3), 20 - i),
  })),
  {
    id: "video-1",
    name: "unboxing.mp4",
    url: "https://picsum.photos/seed/fcm-video/1920/1080",
    thumbnailUrl: "https://picsum.photos/seed/fcm-video/360/300",
    mimeType: "image/jpeg",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    date: new Date(2026, 7, 2),
  },
  {
    id: "pdf-1",
    name: "size-guide.pdf",
    url: "https://example.invalid/size-guide.pdf",
    mimeType: "application/pdf",
    size: 412_000,
    date: new Date(2026, 7, 1),
  },
  {
    id: "private-1",
    name: "ebook-final.pdf",
    url: "https://example.invalid/ebook.pdf",
    mimeType: "application/pdf",
    size: 2_400_000,
    isPrivate: true,
    date: new Date(2026, 6, 14),
  },
]

const DATES = [
  { value: "2026-09", label: "September 2026" },
  { value: "2026-08", label: "August 2026" },
  { value: "2026-07", label: "July 2026" },
]

const monthOf = (item: MediaItem) => {
  const d = new Date(item.date ?? 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Pretend upload: progress over ~1.5s; files named "fail…" reject. */
const fakeUpload: UploadFn = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 20
      onProgress(progress)
      if (progress < 100) return
      clearInterval(timer)
      if (file.name.toLowerCase().startsWith("fail")) {
        reject(new Error("The server rejected this file"))
        return
      }
      resolve({
        id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        mimeType: file.type,
        size: file.size,
        date: new Date(),
      })
    }, 300)
    signal.addEventListener("abort", () => clearInterval(timer))
  })

/** The app's side of the picker: library state, search, date, paging. */
function useFakeLibrary() {
  const [library, setLibrary] = React.useState(SEED)
  const [query, setQuery] = React.useState("")
  const [date, setDate] = React.useState<string | null>(null)
  const [pages, setPages] = React.useState(1)
  const [loadingMore, setLoadingMore] = React.useState(false)

  const filtered = library.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) &&
      (!date || monthOf(item) === date)
  )
  return {
    items: filtered.slice(0, pages * 9),
    hasMore: filtered.length > pages * 9,
    loadingMore,
    onLoadMore: () => {
      setLoadingMore(true)
      setTimeout(() => {
        setPages((p) => p + 1)
        setLoadingMore(false)
      }, 500)
    },
    onSearch: (q: string) => {
      setQuery(q)
      setPages(1)
    },
    dateOptions: DATES,
    date,
    onDateChange: (d: string | null) => {
      setDate(d)
      setPages(1)
    },
    onUpdate: (item: MediaItem, patch: Pick<MediaItem, "alt" | "title">) => {
      setLibrary((all) =>
        all.map((i) => (i.id === item.id ? { ...i, ...patch } : i))
      )
      toast.success("Saved")
    },
    onDelete: async (item: MediaItem) => {
      await new Promise((r) => setTimeout(r, 400))
      setLibrary((all) => all.filter((i) => i.id !== item.id))
      toast.success(`${item.name} deleted`)
    },
    onEdit: (item: MediaItem) => toast(`Open the cropper for ${item.name}`),
    add: (item: MediaItem) => setLibrary((all) => [item, ...all]),
  }
}

export function MediaPickerDemo() {
  const { add, ...library } = useFakeLibrary()
  const [openMany, setOpenMany] = React.useState(false)
  const [openOne, setOpenOne] = React.useState(false)
  const [images, setImages] = React.useState<MediaItem[]>([])
  const [categoryImage, setCategoryImage] = React.useState<MediaItem[]>([])
  const [videos, setVideos] = React.useState<string[]>([])

  const upload: UploadFn = async (file, options) => {
    const item = await fakeUpload(file, options)
    add(item)
    return item
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Upload any image (name it “fail.png” to see an error), or pick from the
        library. The library tab shows Attachment Details for the last tile you
        pick.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpenMany(true)}>
          <ImagePlusIcon /> Product images (multiple, max 5)
        </Button>
        <Button variant="outline" onClick={() => setOpenOne(true)}>
          Category image (single)
        </Button>
      </div>

      <MediaPickerDialog
        open={openMany}
        onOpenChange={setOpenMany}
        multiple
        max={5}
        value={images}
        onConfirm={setImages}
        upload={upload}
        videoUrls={videos}
        onVideoUrlsChange={setVideos}
        onReject={(rejections) =>
          rejections.forEach(({ file, reason }) =>
            toast.error(
              `${file.name}: ${reason === "size" ? "over 5 MB" : "unsupported type"}`
            )
          )
        }
        {...library}
      />
      <MediaPickerDialog
        open={openOne}
        onOpenChange={setOpenOne}
        defaultTab="library"
        value={categoryImage}
        onConfirm={setCategoryImage}
        upload={upload}
        {...library}
      />

      {(images.length > 0 || categoryImage.length > 0) && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(120px,40%),1fr))] gap-3">
          {[...images, ...categoryImage].map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              onRemove={() => {
                setImages((all) => all.filter((i) => i.id !== item.id))
                setCategoryImage((all) => all.filter((i) => i.id !== item.id))
              }}
            />
          ))}
        </div>
      )}
      {videos.filter(Boolean).length > 0 && (
        <p className="text-sm text-muted-foreground">
          Videos: {videos.filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  )
}

export function MediaPageDemo() {
  const { add, ...library } = useFakeLibrary()
  const [type, setType] = React.useState("all")
  const [selected, setSelected] = React.useState<string[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [deleted, setDeleted] = React.useState<Set<string>>(new Set())

  const items = library.items.filter(
    (item) =>
      !deleted.has(item.id) &&
      (type === "all" ||
        (type === "videos" ? Boolean(item.videoUrl) : !item.videoUrl))
  )
  const active = items.find((item) => item.id === activeId) ?? null

  return (
    <Tabs
      value={type}
      onValueChange={setType}
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList variant="line">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <Button onClick={() => setAdding(true)}>
          <ImagePlusIcon /> Add media
        </Button>
      </div>

      <TabsContent
        value={type}
        className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-1"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-4">
          {selected.length > 0 ? (
            <>
              <span className="text-sm font-[560]">
                {selected.length} selected
              </span>
              <Button variant="link" size="sm" onClick={() => setSelected([])}>
                Clear
              </Button>
              <ConfirmDialog
                destructive
                title={`Delete ${selected.length} ${selected.length === 1 ? "file" : "files"}?`}
                description="They're removed from the library and from everywhere they're used."
                confirmLabel="Delete"
                onConfirm={() => {
                  setDeleted((prev) => new Set([...prev, ...selected]))
                  setSelected([])
                  setActiveId(null)
                  toast.success("Files deleted")
                }}
                trigger={
                  <Button variant="destructive" size="sm" className="ms-auto">
                    <Trash2Icon /> Delete
                  </Button>
                }
              />
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {items.length} files
              </span>
              <div className="flex w-full flex-col gap-2 sm:ms-auto sm:w-auto sm:flex-row">
                <SearchInput
                  containerClassName="sm:w-64"
                  placeholder="Search media"
                  onSearch={library.onSearch}
                />
                <Select
                  value={library.date ?? "all"}
                  onValueChange={(v) =>
                    library.onDateChange(v === "all" ? null : v)
                  }
                >
                  <SelectTrigger aria-label="Date" className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All dates</SelectItem>
                    {DATES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <MediaGrid
            items={items}
            multiple
            selected={selected}
            onSelectedChange={setSelected}
            activeId={activeId}
            onActiveChange={setActiveId}
            hasMore={library.hasMore}
            loadingMore={library.loadingMore}
            onLoadMore={library.onLoadMore}
          />
          <MediaDetailsPanel
            item={active}
            onUpdate={library.onUpdate}
            onEdit={library.onEdit}
            onDelete={async (item) => {
              await library.onDelete(item)
              setSelected((s) => s.filter((id) => id !== item.id))
              setActiveId(null)
            }}
            className="self-start"
          />
        </div>
      </TabsContent>

      <MediaPickerDialog
        open={adding}
        onOpenChange={setAdding}
        multiple
        upload={async (file, options) => {
          const item = await fakeUpload(file, options)
          add(item)
          return item
        }}
        onConfirm={(picked) => toast.success(`${picked.length} files ready`)}
        {...library}
      />
    </Tabs>
  )
}

export function MediaPartsDemo() {
  const tile = (overrides: Partial<MediaItem>): MediaItem => ({
    ...SEED[0],
    ...overrides,
  })
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(130px,40%),1fr))] gap-3">
        <MediaTile
          item={tile({ id: "a" })}
          onClick={() => {}}
          onPreview={() => {}}
          onRemove={() => {}}
        />
        <MediaTile
          item={tile({ id: "b" })}
          selected
          active
          onClick={() => {}}
        />
        <MediaTile item={SEED[12]} onClick={() => {}} />
        <MediaTile item={SEED[13]} onClick={() => {}} />
        <MediaTile item={SEED[14]} onClick={() => {}} />
        <MediaTile
          item={tile({
            id: "c",
            url: "https://example.invalid/broken.jpg",
            thumbnailUrl: undefined,
            name: "broken.jpg",
          })}
          onClick={() => {}}
        />
        <MediaTile item={tile({ id: "d" })} disabled onClick={() => {}} />
      </div>
      <UploadQueue
        className="max-w-xl"
        onCancel={() => {}}
        onRemove={() => {}}
        items={[
          {
            id: "1",
            name: "444.jpg",
            size: 204_800,
            progress: 80,
            status: "uploading",
          },
          {
            id: "2",
            name: "banner.png",
            size: 1_200_000,
            progress: 100,
            status: "done",
          },
          {
            id: "3",
            name: "fail.png",
            size: 50_000,
            progress: 100,
            status: "error",
            error: "The server rejected this file",
          },
        ]}
      />
    </div>
  )
}
