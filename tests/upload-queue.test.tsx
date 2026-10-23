import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { UploadQueue, type UploadQueueItem } from "@/index"

const noop = () => {}
const MB = 1024 * 1024

const items = (size: number): UploadQueueItem[] => [
  { id: "1", name: "kapak.jpg", size, progress: 50, status: "uploading" },
  { id: "2", name: "katalog.pdf", size, progress: 100, status: "done" },
  { id: "3", name: "bozuk.png", size, progress: 100, status: "error" },
]

describe("UploadQueue", () => {
  it("keeps its English labels and number format by default", () => {
    render(
      <UploadQueue items={items(2 * MB)} onCancel={noop} onRemove={noop} />
    )
    expect(screen.getByText("1 MB of 2 MB")).toBeTruthy()
    expect(screen.getByText("50%")).toBeTruthy()
    expect(screen.getByText("100%")).toBeTruthy()
    expect(screen.getByText("Uploading…")).toBeTruthy()
    expect(screen.getByText("Complete")).toBeTruthy()
    expect(screen.getByText("Failed")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Cancel kapak.jpg" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Remove katalog.pdf" })
    ).toBeTruthy()
  })

  it("takes translated labels and formats sizes and percents for locale", () => {
    render(
      <UploadQueue
        items={items(1.5 * MB)}
        onCancel={noop}
        onRemove={noop}
        locale="tr"
        labels={{
          uploading: "Yükleniyor…",
          done: "Tamamlandı",
          failed: "Başarısız",
          of: (loaded, total) => `${loaded} / ${total}`,
          cancel: (name) => `${name} yüklemesini iptal et`,
          remove: (name) => `${name} dosyasını kaldır`,
        }}
      />
    )
    expect(screen.getByText("768 KB / 1,5 MB")).toBeTruthy()
    expect(screen.getByText("%50")).toBeTruthy()
    expect(screen.getByText("%100")).toBeTruthy()
    expect(screen.getByText("Yükleniyor…")).toBeTruthy()
    expect(screen.getByText("Tamamlandı")).toBeTruthy()
    expect(screen.getByText("Başarısız")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "kapak.jpg yüklemesini iptal et" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "katalog.pdf dosyasını kaldır" })
    ).toBeTruthy()
  })
})
