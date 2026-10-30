import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

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

  it("reads Added for a finished link and shows its thumbnail", () => {
    const { container } = render(
      <UploadQueue
        items={[
          {
            id: "1",
            name: "YouTube video aBcDeFgHiJk",
            size: 0,
            progress: 100,
            status: "done",
            kind: "link",
            thumbnailUrl: "https://img.youtube.com/vi/aBcDeFgHiJk/0.jpg",
          },
        ]}
      />
    )
    expect(screen.getByText("Added")).toBeTruthy()
    expect(screen.queryByText("Complete")).toBeNull()
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://img.youtube.com/vi/aBcDeFgHiJk/0.jpg"
    )
  })

  it("falls back to the same glyph when a thumbnail fails to load", () => {
    const { container } = render(
      <UploadQueue
        items={[
          {
            id: "1",
            name: "kapak.jpg",
            size: MB,
            progress: 100,
            status: "done",
            thumbnailUrl: "https://example.invalid/kapak.jpg",
          },
        ]}
      />
    )
    fireEvent.error(container.querySelector("img")!)
    const glyph = container.querySelector("li [aria-hidden=true]")!
    expect(glyph.closest("[data-slot=image]")?.className).not.toContain(
      "bg-muted"
    )
    expect(glyph.getAttribute("class")).toContain("size-full")
  })

  it("doesn't clip the fallback glyph's badge when a thumbnail fails to load", () => {
    const { container } = render(
      <UploadQueue
        items={[
          {
            id: "1",
            name: "brief.docx",
            size: MB,
            progress: 100,
            status: "done",
            thumbnailUrl: "https://example.invalid/brief.jpg",
          },
        ]}
      />
    )
    const box = container.querySelector("[data-slot=image]")!
    expect(box.className).toContain("overflow-hidden")
    fireEvent.error(container.querySelector("img")!)
    expect(box.hasAttribute("data-failed")).toBe(true)
    expect(box.className).toContain("data-failed:overflow-visible")
    expect(box.textContent).toBe("DOCX")
  })

  it("keeps the glyph of a file without a thumbnail as it was", () => {
    const { container } = render(
      <UploadQueue
        items={[
          {
            id: "1",
            name: "brief.docx",
            size: MB,
            progress: 40,
            status: "uploading",
          },
        ]}
      />
    )
    expect(container.querySelector("[data-slot=image]")).toBeNull()
    const glyph = container.querySelector("li > [aria-hidden=true]")!
    expect(glyph.getAttribute("class")).toContain("mt-0.5 size-9")
    expect(glyph.textContent).toBe("DOCX")
  })

  describe('variant="compact"', () => {
    const rows: UploadQueueItem[] = [
      {
        id: "1",
        name: "kapak.jpg",
        size: 2 * MB,
        progress: 40,
        status: "uploading",
        thumbnailUrl: "blob:kapak",
      },
      { id: "2", name: "katalog.pdf", size: MB, progress: 100, status: "done" },
      {
        id: "3",
        name: "YouTube video aBcDeFgHiJk",
        size: 0,
        progress: 100,
        status: "done",
        kind: "link",
      },
      {
        id: "4",
        name: "clip.mp4",
        size: MB,
        progress: 0,
        status: "error",
        error: "clip.mp4 isn't a supported file type.",
      },
    ]

    it("builds each row's status from the item", () => {
      render(
        <UploadQueue
          variant="compact"
          items={rows}
          onCancel={noop}
          onRemove={noop}
        />
      )
      const list = screen.getByRole("list", { name: "Uploads" })
      expect(list.dataset.variant).toBe("compact")
      expect(within(list).getByText("2 MB · 40%")).toBeTruthy()
      expect(
        within(list).getByRole("progressbar", { name: "kapak.jpg" })
      ).toBeTruthy()
      expect(within(list).getByText("Uploaded · 1 MB")).toBeTruthy()
      expect(within(list).getByText("Added")).toBeTruthy()
      expect(
        within(list).getByText("clip.mp4 isn't a supported file type.")
      ).toBeTruthy()
      expect(
        list.querySelector("li:first-child img")?.getAttribute("src")
      ).toBe("blob:kapak")
    })

    it("cancels uploading rows and removes refused ones, not finished ones", async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      const onRemove = vi.fn()
      render(
        <UploadQueue
          variant="compact"
          items={rows}
          onCancel={onCancel}
          onRemove={onRemove}
        />
      )
      expect(screen.getAllByRole("button")).toHaveLength(2)
      await user.click(screen.getByRole("button", { name: "Cancel kapak.jpg" }))
      await user.click(screen.getByRole("button", { name: "Remove clip.mp4" }))
      expect(onCancel).toHaveBeenCalledWith("1")
      expect(onRemove).toHaveBeenCalledWith("4")
    })

    it("takes keyboard focus only when the list scrolls", () => {
      const { rerender } = render(
        <UploadQueue variant="compact" items={rows} />
      )
      const list = screen.getByRole("list", { name: "Uploads" })
      expect(list.hasAttribute("tabindex")).toBe(false)

      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
        500
      )
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
        288
      )
      rerender(
        <UploadQueue
          variant="compact"
          items={[...rows, { ...rows[1], id: "5" }]}
        />
      )
      expect(list.getAttribute("tabindex")).toBe("0")
      vi.restoreAllMocks()
    })

    it("doesn't clip the glyph drawn in place of a thumbnail", () => {
      const { container } = render(
        <UploadQueue
          variant="compact"
          items={[{ ...rows[1], name: "brief.docx" }]}
        />
      )
      const box = container.querySelector("[data-slot=image]")!
      expect(box.hasAttribute("data-failed")).toBe(true)
      expect(box.className).toContain("data-failed:overflow-visible")
      expect(
        box.querySelector("[aria-hidden=true]")!.getAttribute("class")
      ).toContain("size-3/5")
    })

    it("takes keyboard focus when a row grows past the height", () => {
      const observers: { targets: Element[]; callback: () => void }[] = []
      vi.stubGlobal(
        "ResizeObserver",
        class {
          entry
          constructor(callback: () => void) {
            this.entry = { targets: [] as Element[], callback }
            observers.push(this.entry)
          }
          observe(target: Element) {
            this.entry.targets.push(target)
          }
          unobserve() {}
          disconnect() {
            this.entry.targets = []
          }
        }
      )
      const failed: UploadQueueItem = {
        ...rows[3],
        error: "clip.mp4 is over 25 MB, which is the limit for videos.",
      }
      const { rerender } = render(
        <UploadQueue variant="compact" items={[rows[0], rows[3]]} />
      )
      const list = screen.getByRole("list", { name: "Uploads" })
      expect(list.hasAttribute("tabindex")).toBe(false)

      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
        300
      )
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
        288
      )
      rerender(<UploadQueue variant="compact" items={[rows[0], failed]} />)
      const row = within(list).getAllByRole("listitem")[1]
      act(() => {
        for (const observer of observers)
          if (observer.targets.includes(row)) observer.callback()
      })
      expect(list.getAttribute("tabindex")).toBe("0")
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })

    it("shows the media slot in place of the thumbnail", () => {
      render(
        <UploadQueue
          variant="compact"
          items={[{ ...rows[1], media: <svg data-testid="pdf-icon" /> }]}
        />
      )
      expect(screen.getByTestId("pdf-icon")).toBeTruthy()
    })

    it("takes translated labels and formats sizes and percents for locale", () => {
      render(
        <UploadQueue
          variant="compact"
          items={rows}
          onCancel={noop}
          onRemove={noop}
          locale="tr"
          labels={{
            list: "Yüklemeler",
            progress: (size, percent) => `${size} · ${percent}`,
            uploaded: (size) => `Yüklendi · ${size}`,
            added: "Eklendi",
          }}
        />
      )
      const list = screen.getByRole("list", { name: "Yüklemeler" })
      expect(within(list).getByText("2 MB · %40")).toBeTruthy()
      expect(within(list).getByText("Yüklendi · 1 MB")).toBeTruthy()
      expect(within(list).getByText("Eklendi")).toBeTruthy()
    })
  })
})
