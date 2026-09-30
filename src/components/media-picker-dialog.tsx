"use client"

import * as React from "react"
import { UploadCloudIcon } from "lucide-react"

import { Dropzone, type FileRejection } from "@/components/dropzone"
import {
  MediaDetailsPanel,
  type MediaDetailsPanelLabels,
} from "@/components/media-details-panel"
import { MediaGrid, type MediaGridLabels } from "@/components/media-grid"
import { MediaTile, type MediaItem } from "@/components/media-tile"
import { SearchInput } from "@/components/search-input"
import { UploadQueue, type UploadQueueItem } from "@/components/upload-queue"
import {
  VideoUrlList,
  type VideoUrlListLabels,
} from "@/components/video-url-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MediaPickerTab = "upload" | "library"

type UploadFn = (
  file: File,
  options: { signal: AbortSignal; onProgress: (percent: number) => void }
) => Promise<MediaItem>

type MediaPickerLabels = {
  title?: string
  uploadTab?: string
  libraryTab?: string
  dropTitle?: React.ReactNode
  dropDescription?: React.ReactNode
  chooseExisting?: string
  chooseFile?: string
  search?: string
  allDates?: string
  cancel?: string
  save?: string
  select?: string
  uploadFailed?: string
  grid?: MediaGridLabels
  details?: MediaDetailsPanelLabels
  video?: VideoUrlListLabels
}

type MediaPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current selection; the picker edits a copy until the user confirms. */
  value?: MediaItem[]
  onConfirm: (items: MediaItem[]) => void
  multiple?: boolean
  max?: number
  defaultTab?: MediaPickerTab

  /** Upload one file; resolve with the stored item. Uploaded items are selected. */
  upload?: UploadFn
  accept?: string
  maxSize?: number
  onReject?: (rejections: FileRejection[]) => void
  /** Files dropped elsewhere (e.g. on the product form) to upload on open. */
  initialFiles?: File[]

  /** Library items for the current search and date. */
  items: MediaItem[]
  loading?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  onSearch?: (query: string) => void
  dateOptions?: { value: string; label: string }[]
  date?: string | null
  onDateChange?: (value: string | null) => void
  onUpdate?: (item: MediaItem, patch: Pick<MediaItem, "alt" | "title">) => void
  onEdit?: (item: MediaItem) => void
  onDelete?: (item: MediaItem) => void | Promise<void>
  onPreview?: (item: MediaItem) => void

  /** Shows the "Video Url" rows on the upload tab. */
  videoUrls?: string[]
  onVideoUrlsChange?: (urls: string[]) => void

  locale?: string
  labels?: MediaPickerLabels
}

const DEFAULT_LABELS = {
  title: "Add Media",
  uploadTab: "Upload File",
  libraryTab: "Media Library",
  dropTitle: (
    <>
      <span className="font-semibold text-primary-ink">Drag &amp; Drop</span> your
      image here
    </>
  ),
  dropDescription: "JPG, PNG or WebP (Max 5MB Each)",
  chooseExisting: "Choose Existing",
  chooseFile: "Choose Image",
  search: "Search",
  allDates: "All Dates",
  cancel: "Cancel",
  save: "Save Now",
  select: "Select",
  uploadFailed: "Upload failed",
}

const ALL_DATES = "__all__"

const openInNewTab = (item: MediaItem) =>
  window.open(item.videoUrl || item.url, "_blank", "noopener,noreferrer")

/** Figma "Add Media": upload or pick from the library, with details and video links. */
function MediaPickerDialog({
  open,
  onOpenChange,
  ...props
}: MediaPickerDialogProps) {
  const controllers = React.useRef(new Map<string, AbortController>())
  const close = () => {
    for (const controller of controllers.current.values()) controller.abort()
    controllers.current.clear()
    onOpenChange(false)
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
        else onOpenChange(true)
      }}
    >
      {/* Mounted per opening, so every visit starts from the current value. */}
      {open && (
        <PickerContent {...props} controllers={controllers} onClose={close} />
      )}
    </Dialog>
  )
}

function PickerContent({
  controllers,
  onClose,
  value = [],
  onConfirm,
  multiple = false,
  max,
  defaultTab = "upload",
  upload,
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 5 * 1024 * 1024,
  onReject,
  initialFiles,
  items,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onSearch,
  dateOptions,
  date,
  onDateChange,
  onUpdate,
  onEdit,
  onDelete,
  onPreview = openInNewTab,
  videoUrls,
  onVideoUrlsChange,
  locale,
  labels: labelsProp,
}: Omit<MediaPickerDialogProps, "open" | "onOpenChange"> & {
  controllers: React.RefObject<Map<string, AbortController>>
  onClose: () => void
}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [tab, setTab] = React.useState<MediaPickerTab>(
    initialFiles?.length ? "upload" : defaultTab
  )
  const [draft, setDraft] = React.useState<MediaItem[]>(value)
  const [activeId, setActiveId] = React.useState<string | null>(
    value.at(-1)?.id ?? null
  )
  const [queue, setQueue] = React.useState<UploadQueueItem[]>([])
  const fileInput = React.useRef<HTMLInputElement>(null)
  const limit = multiple ? max : 1
  const uploading = queue.some((row) => row.status === "uploading")

  // Picked items stay known even when they scroll out of the current page.
  const known = React.useMemo(() => {
    const map = new Map<string, MediaItem>()
    for (const item of [...draft, ...items]) map.set(item.id, item)
    return map
  }, [draft, items])

  const addToDraft = (item: MediaItem) =>
    setDraft((current) => {
      if (current.some((i) => i.id === item.id)) return current
      if (!multiple) return [item]
      if (max !== undefined && current.length >= max) return current
      return [...current, item]
    })

  const startUploads = (files: File[]) => {
    if (!upload) return
    const accepted = multiple ? files : files.slice(0, 1)
    for (const file of accepted) {
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`
      const controller = new AbortController()
      controllers.current.set(id, controller)
      setQueue((q) => [
        ...q,
        {
          id,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading",
        },
      ])
      const patch = (next: Partial<UploadQueueItem>) =>
        setQueue((q) =>
          q.map((row) => (row.id === id ? { ...row, ...next } : row))
        )
      upload(file, {
        signal: controller.signal,
        onProgress: (progress) => patch({ progress: Math.min(progress, 99) }),
      })
        .then((item) => {
          // A finished upload leaves the queue and joins the selection as a tile.
          setQueue((q) => q.filter((row) => row.id !== id))
          addToDraft(item)
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          patch({
            status: "error",
            error: error instanceof Error ? error.message : labels.uploadFailed,
          })
        })
        .finally(() => controllers.current.delete(id))
    }
  }

  // Guarded so Strict Mode's double effect doesn't upload twice.
  const started = React.useRef(false)
  React.useEffect(() => {
    if (started.current || !initialFiles?.length) return
    started.current = true
    startUploads(initialFiles)
    // Once per opening: the content remounts every time the picker opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUploadFiles = (files: File[]) => {
    if (limit !== undefined) {
      const room =
        limit === 1 ? 1 : Math.max(limit - draft.length - queue.length, 0)
      startUploads(files.slice(0, room))
    } else startUploads(files)
  }

  const hasVideo = videoUrls?.some((url) => url.trim() !== "") ?? false
  const canConfirm = !uploading && (draft.length > 0 || hasVideo)
  const activeItem = activeId ? (known.get(activeId) ?? null) : null
  const full = limit !== undefined && draft.length >= limit && multiple

  return (
    <DialogContent
      size={tab === "library" ? "2xl" : "lg"}
      className="gap-0 p-0"
    >
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle>{labels.title}</DialogTitle>
      </DialogHeader>
      <Tabs
        value={tab}
        onValueChange={(next) => setTab(next as MediaPickerTab)}
        className="min-h-0 gap-0"
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border px-6"
        >
          <TabsTrigger value="upload" className="flex-none px-6">
            {labels.uploadTab}
          </TabsTrigger>
          <TabsTrigger value="library" className="flex-none px-6">
            {labels.libraryTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="flex flex-col gap-6 p-6">
          {draft.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(140px,40%),1fr))] gap-3">
              {draft.map((item) => (
                <MediaTile
                  key={item.id}
                  item={item}
                  onPreview={() => onPreview(item)}
                  onRemove={() =>
                    setDraft((current) =>
                      current.filter((i) => i.id !== item.id)
                    )
                  }
                  labels={labels.grid}
                />
              ))}
              {upload && (!multiple || !full) && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex aspect-[6/5] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary bg-primary-subtle text-sm font-semibold text-primary-ink outline-none hover:bg-primary-subtle-2 focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <UploadCloudIcon className="size-6" aria-hidden="true" />
                  {labels.chooseFile}
                </button>
              )}
              <input
                ref={fileInput}
                type="file"
                hidden
                accept={accept}
                multiple={multiple}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  const ok = files.filter((f) => f.size <= maxSize)
                  const tooBig = files.filter((f) => f.size > maxSize)
                  if (tooBig.length)
                    onReject?.(
                      tooBig.map((file) => ({
                        file,
                        reason: "size" as const,
                      }))
                    )
                  onUploadFiles(ok)
                  event.target.value = ""
                }}
              />
            </div>
          ) : (
            <Dropzone
              accept={accept}
              maxSize={maxSize}
              multiple={multiple}
              disabled={!upload}
              title={labels.dropTitle}
              description={labels.dropDescription}
              browseLabel={upload ? labels.chooseFile : undefined}
              actions={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTab("library")}
                >
                  {labels.chooseExisting}
                </Button>
              }
              onFiles={onUploadFiles}
              onReject={onReject}
            />
          )}
          <UploadQueue
            items={queue}
            locale={locale}
            onCancel={(id) => {
              controllers.current.get(id)?.abort()
              setQueue((q) => q.filter((row) => row.id !== id))
            }}
            onRemove={(id) => setQueue((q) => q.filter((row) => row.id !== id))}
          />
          {videoUrls && onVideoUrlsChange && (
            <VideoUrlList
              value={videoUrls}
              onValueChange={onVideoUrlsChange}
              labels={labels.video}
            />
          )}
        </TabsContent>

        <TabsContent
          value="library"
          className="flex min-h-0 flex-col gap-4 p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              containerClassName="min-w-0 flex-1"
              placeholder={labels.search}
              aria-label={labels.search}
              onSearch={onSearch}
            />
            {dateOptions && onDateChange && (
              <Select
                value={date ?? ALL_DATES}
                onValueChange={(next) =>
                  onDateChange(next === ALL_DATES ? null : next)
                }
              >
                <SelectTrigger
                  aria-label={labels.allDates}
                  className="w-full sm:w-36"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DATES}>{labels.allDates}</SelectItem>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid min-h-0 gap-4 md:grid-cols-[minmax(0,1fr)_292px]">
            <MediaGrid
              items={items}
              loading={loading}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={onLoadMore}
              multiple={multiple}
              max={max}
              selected={draft.map((item) => item.id)}
              onSelectedChange={(ids) =>
                setDraft(
                  ids
                    .map((id) => known.get(id))
                    .filter((item): item is MediaItem => Boolean(item))
                )
              }
              activeId={activeId}
              onActiveChange={setActiveId}
              labels={labels.grid}
              className="md:max-h-[min(60dvh,608px)] md:overflow-y-auto md:pe-1"
            />
            <MediaDetailsPanel
              item={activeItem}
              locale={locale}
              onUpdate={onUpdate}
              onEdit={onEdit}
              onDelete={
                onDelete
                  ? async (item) => {
                      await onDelete(item)
                      setDraft((current) =>
                        current.filter((i) => i.id !== item.id)
                      )
                      setActiveId(null)
                    }
                  : undefined
              }
              labels={labels.details}
              className="md:max-h-[min(60dvh,608px)] md:overflow-y-auto"
            />
          </div>
        </TabsContent>
      </Tabs>
      <DialogFooter className="bottom-0 mx-0 mb-0">
        <DialogClose asChild>
          <Button variant="outline">{labels.cancel}</Button>
        </DialogClose>
        <Button
          disabled={!canConfirm}
          loading={uploading}
          onClick={() => {
            onConfirm(draft)
            onClose()
          }}
        >
          {tab === "library" ? labels.select : labels.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export {
  MediaPickerDialog,
  type MediaPickerDialogProps,
  type MediaPickerLabels,
  type MediaPickerTab,
  type UploadFn,
}
