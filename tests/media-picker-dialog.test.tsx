import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { MediaPickerDialog, type MediaPickerDialogProps } from "@/index"

const png = () =>
  new File([new Uint8Array(1024)], "kapak.png", { type: "image/png" })

function Picker(props: Partial<MediaPickerDialogProps>) {
  return (
    <MediaPickerDialog
      open
      onOpenChange={() => {}}
      items={[]}
      onConfirm={() => {}}
      upload={() => new Promise(() => {})}
      {...props}
    />
  )
}

describe("MediaPickerDialog", () => {
  it("keeps the English names of its close button, drop zone, queue and search", async () => {
    const user = userEvent.setup()
    render(<Picker />)
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()

    await user.upload(screen.getByLabelText("Upload files"), png())
    expect(screen.getByText("Uploading…")).toBeTruthy()
    expect(screen.getByText("0 B of 1 KB")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Cancel kapak.png" })
    ).toBeTruthy()

    await user.click(screen.getByRole("tab", { name: "Media Library" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "kupa")
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy()
  })

  it("takes translations for them", async () => {
    const user = userEvent.setup()
    render(
      <Picker
        locale="tr"
        labels={{
          close: "Kapat",
          libraryTab: "Medya kitaplığı",
          dropInput: "Dosya yükle",
          search: "Ara",
          clearSearch: "Aramayı temizle",
          queue: {
            uploading: "Yükleniyor…",
            of: (loaded, total) => `${loaded} / ${total}`,
            cancel: (name) => `${name} yüklemesini iptal et`,
          },
        }}
      />
    )
    expect(screen.getByRole("button", { name: "Kapat" })).toBeTruthy()

    await user.upload(screen.getByLabelText("Dosya yükle"), png())
    expect(screen.getByText("Yükleniyor…")).toBeTruthy()
    expect(screen.getByText("0 B / 1 KB")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "kapak.png yüklemesini iptal et" })
    ).toBeTruthy()

    await user.click(screen.getByRole("tab", { name: "Medya kitaplığı" }))
    await user.type(screen.getByRole("searchbox", { name: "Ara" }), "kupa")
    expect(screen.getByRole("button", { name: "Aramayı temizle" })).toBeTruthy()
  })
})
