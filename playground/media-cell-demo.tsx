import {
  ImageWithFallback,
  MediaCell,
  MediaFileGlyph,
  MediaPlayMark,
} from "@/index"

export function MediaCellDemo() {
  return (
    <ul className="flex w-full max-w-md flex-col divide-y divide-border-subtle rounded-xl border bg-card">
      <li className="p-3">
        <MediaCell
          size={40}
          src="https://picsum.photos/seed/fcm-0/80/80"
          title="sneaker-red.jpg"
          description="JPG image"
        />
      </li>
      <li className="p-3">
        <MediaCell
          size={40}
          media={
            <>
              <ImageWithFallback
                src="https://picsum.photos/seed/fcm-video/80/80"
                alt=""
                containerClassName="size-full rounded-none"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <MediaPlayMark size="sm" />
                <span className="sr-only">Video</span>
              </span>
            </>
          }
          title="unboxing.mp4"
          description="YouTube video"
        />
      </li>
      <li className="p-3">
        <MediaCell
          size={40}
          media={<MediaFileGlyph name="size-guide.pdf" className="size-6" />}
          title="size-guide.pdf"
          description="PDF document"
        />
      </li>
      <li className="p-3">
        <MediaCell
          size={40}
          src="https://example.invalid/lookbook.jpg"
          title="lookbook-missing.jpg"
          description="The image failed to load"
        />
      </li>
    </ul>
  )
}
