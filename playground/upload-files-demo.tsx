import * as React from "react"

import {
  Dropzone,
  Icon,
  UploadQueue,
  type FileRejection,
  type UploadQueueItem,
} from "@/index"

const MB = 1024 * 1024
const isImageFile = (file: File) => file.type.startsWith("image/")
const sizeLimit = (file: File) => (isImageFile(file) ? 5 * MB : 25 * MB)

const refusal = ({ file, reason }: FileRejection) => {
  if (reason === "type") return `${file.name} isn't a supported file type.`
  if (reason === "count") return `${file.name} is one file too many.`
  return isImageFile(file)
    ? `${file.name} is over 5 MB. Images can be up to 5 MB.`
    : `${file.name} is over 25 MB. Documents can be up to 25 MB.`
}

const UPLOAD_SEED: UploadQueueItem[] = [
  {
    id: "seed-1",
    name: "pivoine-50ml.jpg",
    size: 1_900_000,
    progress: 62,
    status: "uploading",
    thumbnailUrl: "https://picsum.photos/seed/fcm-0/360/300",
  },
  {
    id: "seed-2",
    name: "size-guide.pdf",
    size: 412_000,
    progress: 100,
    status: "done",
  },
  {
    id: "seed-3",
    name: "YouTube video aBcDeFgHiJk",
    size: 0,
    progress: 100,
    status: "done",
    kind: "link",
    thumbnailUrl: "https://picsum.photos/seed/fcm-video/360/300",
  },
  {
    id: "seed-4",
    name: "lookbook.mp4",
    size: 48_000_000,
    progress: 0,
    status: "error",
    error: "lookbook.mp4 isn't a supported file type.",
  },
]

/** Pretend upload: progress over ~1.5s; files named "fail…" reject. */
const fakeUpload = (
  file: File,
  {
    signal,
    onProgress,
  }: { signal: AbortSignal; onProgress: (progress: number) => void }
) =>
  new Promise<void>((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 20
      onProgress(progress)
      if (progress < 100) return
      clearInterval(timer)
      if (file.name.toLowerCase().startsWith("fail"))
        reject(new Error("The server rejected this file"))
      else resolve()
    }, 300)
    signal.addEventListener("abort", () => clearInterval(timer))
  })

export function UploadFilesDemo() {
  const [items, setItems] = React.useState(UPLOAD_SEED)
  const uploads = React.useRef(new Map<string, AbortController>())
  const previews = React.useRef(new Map<string, string>())

  React.useEffect(() => {
    const running = uploads.current
    const urls = previews.current
    return () => {
      running.forEach((upload) => upload.abort())
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const patch = (id: string, next: Partial<UploadQueueItem>) =>
    setItems((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...next } : row))
    )

  const start = (files: File[]) =>
    files.forEach((file) => {
      const id = crypto.randomUUID()
      const upload = new AbortController()
      uploads.current.set(id, upload)
      const preview = isImageFile(file) ? URL.createObjectURL(file) : undefined
      if (preview) previews.current.set(id, preview)
      setItems((rows) => [
        ...rows,
        {
          id,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading",
          thumbnailUrl: preview,
        },
      ])
      fakeUpload(file, {
        signal: upload.signal,
        onProgress: (progress) => patch(id, { progress }),
      }).then(
        () => patch(id, { status: "done", progress: 100 }),
        (error: Error) => patch(id, { status: "error", error: error.message })
      )
    })

  const refuse = (rejections: FileRejection[]) =>
    setItems((rows) => [
      ...rows,
      ...rejections.map((rejection) => ({
        id: crypto.randomUUID(),
        name: rejection.file.name,
        size: rejection.file.size,
        progress: 0,
        status: "error" as const,
        error: refusal(rejection),
      })),
    ])

  const drop = (id: string) => {
    uploads.current.get(id)?.abort()
    uploads.current.delete(id)
    const preview = previews.current.get(id)
    if (preview) URL.revokeObjectURL(preview)
    previews.current.delete(id)
    setItems((rows) => rows.filter((row) => row.id !== id))
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Dropzone
        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.csv,.zip"
        maxSize={sizeLimit}
        icon={<Icon name="import" size={24} className="text-primary-ink" />}
        title={
          <>
            Drag files here or{" "}
            <span className="font-semibold text-primary-ink underline underline-offset-4">
              browse
            </span>
          </>
        }
        dragTitle="Drop to upload"
        description="Pick as many as you like."
        onFiles={start}
        onReject={refuse}
      />
      <p className="text-sm text-muted-foreground">
        JPG, PNG, WebP or GIF images up to 5 MB. PDF, CSV or ZIP up to 25 MB.
      </p>
      <UploadQueue
        variant="compact"
        items={items}
        onCancel={drop}
        onRemove={drop}
      />
    </div>
  )
}
