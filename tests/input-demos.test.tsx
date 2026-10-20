import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@/index"
import { ImageUploadFieldDemo } from "../playground/input-demos"

const png = (name: string) =>
  new File([new Uint8Array(64)], name, { type: "image/png" })

let created: string[]
let revoked: string[]

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  created = []
  revoked = []
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
    created.push(`blob:preview-${created.length + 1}`)
    return created[created.length - 1]
  })
  vi.spyOn(URL, "revokeObjectURL").mockImplementation((url) => {
    revoked.push(url)
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const setup = () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const view = render(
    <TooltipProvider>
      <ImageUploadFieldDemo />
    </TooltipProvider>
  )
  const upload = async (input: HTMLElement, file: File) => {
    await user.upload(input, file)
    await act(() => vi.advanceTimersByTimeAsync(1200))
  }
  return { user, upload, ...view }
}

describe("ImageUploadFieldDemo", () => {
  it("revokes each preview URL when it is replaced, removed or unmounted", async () => {
    const { user, upload, unmount } = setup()

    await upload(screen.getByLabelText("Upload image, Icon"), png("icon.png"))
    expect(created).toEqual(["blob:preview-1"])
    expect(revoked).toEqual([])

    await upload(screen.getByLabelText("Change image, Icon"), png("new.png"))
    expect(revoked).toEqual(["blob:preview-1"])

    await user.click(screen.getByRole("button", { name: "Remove image, Icon" }))
    expect(revoked).toEqual(["blob:preview-1", "blob:preview-2"])

    await upload(screen.getByLabelText("Upload image, Icon"), png("last.png"))
    unmount()
    expect(revoked).toEqual(created)
    expect(created).toHaveLength(3)
  })

  it("creates no URL when it unmounts during the upload", async () => {
    const { user, unmount } = setup()

    await user.upload(
      screen.getByLabelText("Upload image, Icon"),
      png("icon.png")
    )
    unmount()
    await act(() => vi.advanceTimersByTimeAsync(1200))

    expect(created).toEqual([])
  })
})
