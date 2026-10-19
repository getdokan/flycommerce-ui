import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  ImageUploadField,
  type ImageUploadFieldProps,
  type ImageUploadFieldValue,
} from "@/index"

const LOGO: ImageUploadFieldValue = {
  src: "https://cdn.example.com/maison-oriel-wordmark.svg",
  name: "maison-oriel-wordmark.svg",
  size: 48 * 1024,
}

const png = (name = "logo.png", bytes = 1024) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" })

const labels = {
  input: "Upload logo",
  remove: "Remove logo",
}

function Logo({
  initial = null,
  ...props
}: Partial<ImageUploadFieldProps> & {
  initial?: ImageUploadFieldValue | null
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <ImageUploadField
      value={value}
      onFiles={([file]) => setValue({ src: "blob:logo", name: file.name })}
      onRemove={() => setValue(null)}
      labels={labels}
      {...props}
    />
  )
}

const root = () =>
  document.querySelector<HTMLElement>("[data-slot=image-upload-field]")!

describe("ImageUploadField", () => {
  it("shows a drop zone with the image copy while empty", () => {
    render(
      <ImageUploadField
        maxSize={25 * 1024 * 1024}
        onFiles={() => {}}
        onChooseExisting={() => {}}
      />
    )
    expect(root().dataset.state).toBe("empty")
    expect(screen.getByText(/your image here/).textContent).toBe(
      "Drag and drop your image here"
    )
    expect(
      screen.getByText("PNG, JPG, SVG or WebP. Max file size: 25 MB")
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Upload image" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Media library" })).toBeTruthy()
  })

  it.each([
    ["image/png", 25 * 1024 * 1024, "PNG. Max file size: 25 MB"],
    [".png,.jpg,.jpeg", undefined, "PNG or JPG"],
    [
      "image/svg+xml,image/webp,image/gif",
      2048,
      "SVG, WebP or GIF. Max file size: 2 KB",
    ],
    ["image/*", 25 * 1024 * 1024, "Max file size: 25 MB"],
  ])("describes accept=%j in the drop zone", (accept, maxSize, text) => {
    render(
      <ImageUploadField accept={accept} maxSize={maxSize} onFiles={() => {}} />
    )
    expect(screen.getByText(text)).toBeTruthy()
  })

  it("adds its label to every button's name and keeps the visible text", () => {
    const { rerender } = render(
      <ImageUploadField
        label="Logo"
        onFiles={() => {}}
        onChooseExisting={() => {}}
      />
    )
    expect(screen.getByLabelText("Upload image, Logo")).toHaveProperty(
      "type",
      "file"
    )
    const upload = screen.getByRole("button", { name: "Upload image, Logo" })
    expect(upload.querySelector("[aria-hidden=true]")?.textContent).toBe(
      "Upload image"
    )
    expect(
      screen.getByRole("button", { name: "Media library, Logo" }).textContent
    ).toBe("Media library")

    rerender(
      <ImageUploadField
        label="Logo"
        value={LOGO}
        onFiles={() => {}}
        onRemove={() => {}}
        onChooseExisting={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: "Remove image, Logo" })
    ).toBeTruthy()
    expect(screen.getByLabelText("Change image, Logo")).toHaveProperty(
      "type",
      "file"
    )
    expect(screen.getByText("Change image")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Media library, Logo" }).textContent
    ).toBe("Media library")
  })

  it("keeps two fields' buttons apart by their labels", () => {
    render(
      <>
        <ImageUploadField
          label="Logo"
          value={LOGO}
          onFiles={() => {}}
          onRemove={() => {}}
        />
        <ImageUploadField
          label="Icon"
          value={LOGO}
          onFiles={() => {}}
          onRemove={() => {}}
        />
      </>
    )
    expect(
      screen.getAllByRole("button", { name: /^Remove image/ })
    ).toHaveLength(2)
    expect(
      screen.getByRole("button", { name: "Remove image, Logo" })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Remove image, Icon" })
    ).toBeTruthy()
    expect(screen.getByLabelText("Change image, Logo")).not.toBe(
      screen.getByLabelText("Change image, Icon")
    )
  })

  it("leaves out Media library without onChooseExisting", () => {
    render(<ImageUploadField onFiles={() => {}} />)
    expect(screen.queryByRole("button", { name: "Media library" })).toBeNull()
  })

  it("passes a chosen image on and rejects other files with the reason", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onFiles = vi.fn()
    const onReject = vi.fn()
    render(
      <ImageUploadField
        maxSize={2048}
        onFiles={onFiles}
        onReject={onReject}
        labels={labels}
      />
    )
    const input = screen.getByLabelText("Upload logo")

    await user.upload(input, png())
    expect(onFiles).toHaveBeenCalledWith([
      expect.objectContaining({ name: "logo.png" }),
    ])

    await user.upload(input, png("huge.png", 4096))
    expect(onReject).toHaveBeenLastCalledWith([
      expect.objectContaining({ reason: "size" }),
    ])

    await user.upload(
      input,
      new File(["gif"], "spinner.gif", { type: "image/gif" })
    )
    expect(onReject).toHaveBeenLastCalledWith([
      expect.objectContaining({ reason: "type" }),
    ])
    expect(onFiles).toHaveBeenCalledTimes(1)
  })

  it("shows the image, its name and size once filled", () => {
    render(
      <ImageUploadField
        value={LOGO}
        previewBackground="#1f2a44"
        onFiles={() => {}}
      />
    )
    expect(root().dataset.state).toBe("filled")
    const preview = document.querySelector<HTMLElement>(
      "[data-slot=image-upload-field-preview]"
    )!
    expect(preview.style.backgroundColor).toBe("rgb(31, 42, 68)")
    const img = preview.querySelector("img")!
    expect(img.getAttribute("src")).toBe(LOGO.src)
    expect(img.dataset.fit).toBe("cover")
    expect(screen.getByText("maison-oriel-wordmark.svg")).toBeTruthy()
    expect(screen.getByText("48 KB")).toBeTruthy()
  })

  it.each([
    ["#1f2a44", "dark"],
    ["#155dfc", "dark"],
    ["#f5e6c8", "light"],
    ["#C9A46A", "light"],
    ["#fff", "light"],
    ["var(--brand)", "dark"],
  ])(
    "puts dark or white text on a %s tile by its luminance",
    (colour, tone) => {
      render(
        <ImageUploadField
          value={{ name: "maison-oriel-wordmark.svg" }}
          preview={<span>Maison Oriel</span>}
          previewBackground={colour}
          onFiles={() => {}}
        />
      )
      expect(
        document.querySelector<HTMLElement>(
          "[data-slot=image-upload-field-preview]"
        )?.dataset.background
      ).toBe(tone)
    }
  )

  it("leaves the tile muted without a background", () => {
    render(<ImageUploadField value={LOGO} onFiles={() => {}} />)
    expect(
      document
        .querySelector("[data-slot=image-upload-field-preview]")
        ?.hasAttribute("data-background")
    ).toBe(false)
  })

  it("fits the image inside the tile with previewFit=contain", () => {
    render(
      <ImageUploadField value={LOGO} previewFit="contain" onFiles={() => {}} />
    )
    expect(document.querySelector("img")?.dataset.fit).toBe("contain")
  })

  it("draws a preview node in the tile instead of the image", () => {
    render(
      <ImageUploadField
        value={{ name: "maison-oriel-wordmark.svg", size: 48 * 1024 }}
        preview={<span data-testid="wordmark">Maison Oriel</span>}
        previewBackground="#1f2a44"
        onFiles={() => {}}
      />
    )
    const preview = document.querySelector<HTMLElement>(
      "[data-slot=image-upload-field-preview]"
    )!
    expect(preview.contains(screen.getByTestId("wordmark"))).toBe(true)
    expect(preview.querySelector("img")).toBeNull()
    expect(preview.style.backgroundColor).toBe("rgb(31, 42, 68)")
    expect(screen.getByText("48 KB")).toBeTruthy()
  })

  it("shows an icon in the tile when there is no image or preview", () => {
    render(<ImageUploadField value={{ name: "logo.png" }} onFiles={() => {}} />)
    const preview = document.querySelector(
      "[data-slot=image-upload-field-preview]"
    )!
    expect(preview.querySelector("img")).toBeNull()
    expect(preview.querySelector("svg")).not.toBeNull()
  })

  it("changes the image through its own file input, with the same checks", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onFiles = vi.fn()
    const onReject = vi.fn()
    render(
      <ImageUploadField
        value={LOGO}
        maxSize={2048}
        onFiles={onFiles}
        onReject={onReject}
      />
    )
    const change = screen.getByLabelText("Change image")

    await user.upload(change, png("new-logo.png"))
    expect(onFiles).toHaveBeenCalledWith([
      expect.objectContaining({ name: "new-logo.png" }),
    ])

    await user.upload(change, png("huge.png", 4096))
    expect(onReject).toHaveBeenLastCalledWith([
      expect.objectContaining({ reason: "size" }),
    ])
  })

  it("switches between empty and filled and keeps focus in the field", async () => {
    const user = userEvent.setup()
    render(<Logo />)
    expect(root().dataset.state).toBe("empty")

    await user.upload(screen.getByLabelText("Upload logo"), png())
    expect(root().dataset.state).toBe("filled")
    expect(screen.getByText("logo.png")).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText("Change image"))

    await user.click(screen.getByRole("button", { name: "Remove logo" }))
    expect(root().dataset.state).toBe("empty")
    expect(document.activeElement).toBe(screen.getByLabelText("Upload logo"))
  })

  it("can be used with the keyboard alone", async () => {
    const user = userEvent.setup()
    const onChooseExisting = vi.fn()
    render(<Logo initial={LOGO} onChooseExisting={onChooseExisting} />)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Remove logo" })
    )
    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText("Change image"))
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Media library" })
    )
    await user.keyboard("{Enter}")
    expect(onChooseExisting).toHaveBeenCalledTimes(1)

    await user.tab({ shift: true })
    await user.tab({ shift: true })
    await user.keyboard(" ")
    expect(root().dataset.state).toBe("empty")
    expect(document.activeElement).toBe(screen.getByLabelText("Upload logo"))
  })

  it("dims and blocks the field while loading", () => {
    render(
      <ImageUploadField
        value={LOGO}
        loading
        onFiles={() => {}}
        labels={{ uploading: "Uploading logo" }}
      />
    )
    expect(root().getAttribute("aria-busy")).toBe("true")
    expect(screen.getByRole("status").textContent).toBe("Uploading logo")
    expect(
      screen.getByLabelText("Change image").closest("[inert]")
    ).not.toBeNull()
  })

  it("marks the file input invalid", () => {
    const { rerender } = render(
      <ImageUploadField invalid onFiles={() => {}} labels={labels} />
    )
    expect(root().hasAttribute("data-invalid")).toBe(true)
    expect(
      screen.getByLabelText("Upload logo").getAttribute("aria-invalid")
    ).toBe("true")

    rerender(<ImageUploadField value={LOGO} invalid onFiles={() => {}} />)
    expect(
      screen.getByLabelText("Change image").getAttribute("aria-invalid")
    ).toBe("true")
  })

  it("disables every action", () => {
    render(
      <ImageUploadField
        value={LOGO}
        disabled
        onFiles={() => {}}
        onRemove={() => {}}
        onChooseExisting={() => {}}
        labels={labels}
      />
    )
    expect(
      screen
        .getByRole("button", { name: "Remove logo" })
        .hasAttribute("disabled")
    ).toBe(true)
    expect(screen.getByLabelText("Change image")).toHaveProperty(
      "disabled",
      true
    )
    expect(
      screen
        .getByRole("button", { name: "Media library" })
        .hasAttribute("disabled")
    ).toBe(true)
  })

  it("falls back to an icon when the image can't load", () => {
    render(<ImageUploadField value={LOGO} onFiles={() => {}} />)
    const preview = document.querySelector(
      "[data-slot=image-upload-field-preview]"
    )!
    fireEvent.error(preview.querySelector("img")!)
    expect(preview.querySelector("img")).toBeNull()
    expect(preview.querySelector("svg")).not.toBeNull()
  })

  it("ties a Field label to the file input with id", () => {
    render(
      <>
        <label htmlFor="logo">Logo</label>
        <ImageUploadField id="logo" onFiles={() => {}} />
      </>
    )
    expect(document.getElementById("logo")?.getAttribute("type")).toBe("file")
  })
})
