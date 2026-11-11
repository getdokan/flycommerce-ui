import { PreviewFrame, PreviewStage } from "@/index"

export function PreviewFrameDemo() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <PreviewStage className="rounded-lg">
        <PreviewFrame
          src="https://picsum.photos/seed/fc-theme/1440/900"
          alt="The Ravelli theme on the live store"
          address="maisonoriel.com"
          aspectRatio="16 / 10"
        />
      </PreviewStage>
      <PreviewStage className="rounded-lg">
        <PreviewFrame
          src="https://picsum.photos/seed/fc-theme-2/1440/900"
          alt="ChicNest"
          chrome="none"
          aspectRatio="16 / 10"
        />
      </PreviewStage>
      <div className="w-48 max-w-full">
        <PreviewFrame
          src="https://picsum.photos/seed/fc-theme-3/1440/900"
          alt="Ravelli on a long store domain"
          address="the-very-long-store-name-of-maison-oriel.flycommerce.store"
          aspectRatio="16 / 10"
        />
      </div>
      <PreviewFrame
        src="https://example.invalid/missing-theme.png"
        alt="Theme picture that failed to load"
        address="nordic-living.com"
      />
    </div>
  )
}
