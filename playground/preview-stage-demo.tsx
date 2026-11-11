import {
  PreviewStage,
  PreviewStageDocument,
  PreviewStageImage,
  PreviewStageVideo,
} from "@/index"

export function PreviewStageDemo() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <PreviewStage className="rounded-lg">
        <PreviewStageImage
          src="https://picsum.photos/seed/fcm-0/1600/1200"
          alt="Red sneaker on a white floor"
          width={1600}
          height={1200}
        />
      </PreviewStage>
      <PreviewStage className="rounded-lg">
        <PreviewStageImage
          src="https://picsum.photos/seed/fcm-3/800/1200"
          alt="Leather bag"
          width={800}
          height={1200}
        />
      </PreviewStage>
      <PreviewStage className="rounded-lg">
        <PreviewStageVideo
          poster="https://picsum.photos/seed/fcm-video/1280/720"
          name="Unboxing"
          href="https://www.youtube.com/watch?v=aqz-KE-bpKQ"
        />
      </PreviewStage>
      <PreviewStage className="rounded-lg">
        <PreviewStageDocument name="size-guide.pdf" />
      </PreviewStage>
    </div>
  )
}
