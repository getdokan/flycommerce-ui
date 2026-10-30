import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dropzone } from "@/index"

const files = { dataTransfer: { types: ["Files"] } }

const file = (name: string, type: string, bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type })

describe("Dropzone", () => {
  it("shows the upload icon unless icon is null", () => {
    const { container, rerender } = render(<Dropzone onFiles={() => {}} />)
    const zone = container.querySelector("[data-slot=dropzone]")!
    expect(zone.querySelector(":scope > svg")).not.toBeNull()

    rerender(<Dropzone onFiles={() => {}} icon={null} />)
    expect(zone.querySelector(":scope > svg")).toBeNull()
  })

  it("sorts files by type, size and count", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onFiles = vi.fn()
    const onReject = vi.fn()
    render(
      <Dropzone
        accept="image/*,.pdf"
        maxSize={100}
        maxFiles={1}
        inputLabel="Upload files"
        onFiles={onFiles}
        onReject={onReject}
      />
    )

    await user.upload(screen.getByLabelText("Upload files"), [
      file("photo.png", "image/png"),
      file("guide.pdf", "application/pdf"),
      file("notes.txt", "text/plain"),
      file("poster.jpg", "image/jpeg", 200),
    ])

    expect(onFiles).toHaveBeenCalledWith([
      expect.objectContaining({ name: "photo.png" }),
    ])
    expect(
      onReject.mock.calls[0][0].map(
        (r: { file: File; reason: string }) => `${r.file.name}:${r.reason}`
      )
    ).toEqual(["guide.pdf:count", "notes.txt:type", "poster.jpg:size"])
  })

  it("takes a size limit per file", async () => {
    const user = userEvent.setup()
    const onFiles = vi.fn()
    const onReject = vi.fn()
    render(
      <Dropzone
        maxSize={(f) => (f.type.startsWith("image/") ? 100 : 1000)}
        inputLabel="Upload files"
        onFiles={onFiles}
        onReject={onReject}
      />
    )

    await user.upload(screen.getByLabelText("Upload files"), [
      file("small.png", "image/png", 50),
      file("big.png", "image/png", 500),
      file("guide.pdf", "application/pdf", 500),
    ])

    expect(onFiles.mock.calls[0][0].map((f: File) => f.name)).toEqual([
      "small.png",
      "guide.pdf",
    ])
    expect(onReject.mock.calls[0][0]).toEqual([
      expect.objectContaining({ reason: "size" }),
    ])
    expect(onReject.mock.calls[0][0][0].file.name).toBe("big.png")
  })

  it("shows dragTitle while files are dragged over it", () => {
    const { container } = render(
      <Dropzone
        title="Drag files here or browse"
        dragTitle="Drop to upload"
        onFiles={() => {}}
      />
    )
    const zone = container.querySelector("[data-slot=dropzone]")!
    expect(screen.getByText("Drag files here or browse")).toBeTruthy()

    fireEvent.dragEnter(zone, files)
    expect(screen.getByText("Drop to upload")).toBeTruthy()
    expect(screen.queryByText("Drag files here or browse")).toBeNull()

    fireEvent.dragLeave(zone)
    expect(screen.getByText("Drag files here or browse")).toBeTruthy()
  })

  it("keeps the title while dragging when there is no dragTitle", () => {
    const { container } = render(
      <Dropzone title="Drag files here" onFiles={() => {}} />
    )
    fireEvent.dragEnter(container.querySelector("[data-slot=dropzone]")!, files)
    expect(screen.getByText("Drag files here")).toBeTruthy()
  })

  it("ignores drags that carry no files, such as selected text", () => {
    const { container } = render(
      <Dropzone
        title="Drag files here"
        dragTitle="Drop to upload"
        onFiles={() => {}}
      />
    )
    const zone = container.querySelector("[data-slot=dropzone]")!
    fireEvent.dragEnter(zone, { dataTransfer: { types: ["text/plain"] } })
    expect(screen.getByText("Drag files here")).toBeTruthy()
    expect(zone.hasAttribute("data-dragging")).toBe(false)
  })
})
