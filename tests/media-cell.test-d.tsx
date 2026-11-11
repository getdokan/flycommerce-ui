import { MediaCell } from "@/index"

export const accepted = [
  <MediaCell title="Silk twill scarf, ivory" />,
  <MediaCell
    title={<a href="/admin/products/101/edit">Silk twill scarf, ivory</a>}
    description="MO-AC-SCRF-IVR"
  />,
  <MediaCell
    title="Silk twill scarf, ivory"
    href="/admin/products/101/edit"
    onNavigate={() => {}}
  />,
]

export const rejected = [
  // @ts-expect-error a title is required
  <MediaCell />,
  // @ts-expect-error a plain object isn't a node
  <MediaCell title={{ text: "Scarf" }} />,
  // @ts-expect-error onNavigate takes no arguments
  <MediaCell title="Scarf" href="/x" onNavigate={(path: string) => path} />,
]
