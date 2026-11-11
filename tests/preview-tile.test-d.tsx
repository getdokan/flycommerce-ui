import { PreviewTile } from "@/index"

export const accepted = [
  <PreviewTile alt="Lumen" />,
  <PreviewTile alt="Lumen" onOpen={() => {}} />,
  <PreviewTile alt="Lumen" onOpen={undefined} openLabel="Look inside" />,
  <PreviewTile alt="Lumen" href="/themes/lumen" />,
  <PreviewTile alt="Lumen" href="/themes/lumen" onNavigate={() => {}} />,
]

export const rejected = [
  // @ts-expect-error with href, a plain click calls onNavigate
  <PreviewTile alt="Lumen" href="/themes/lumen" onOpen={() => {}} />,
  // @ts-expect-error onNavigate needs a link to follow
  <PreviewTile alt="Lumen" onNavigate={() => {}} />,
  // @ts-expect-error label is text; an icon goes in labelIcon
  <PreviewTile alt="Lumen" label={<svg />} onOpen={() => {}} />,
]
