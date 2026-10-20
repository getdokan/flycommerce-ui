import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dropzone } from "@/index"

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
})
