import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DropdownMenuItem, SaveBar, type SaveBarProps } from "@/index"

const renderBar = (props: Partial<SaveBarProps> = {}) => {
  const handlers = { onSave: vi.fn(), onDiscard: vi.fn() }
  render(<SaveBar open {...handlers} {...props} />)
  return {
    ...handlers,
    bar: screen.getByRole("region", { name: "Unsaved changes" }),
    discard: screen.getByRole("button", { name: "Discard" }),
    save: screen.getByRole("button", { name: "Save changes" }),
  }
}

describe("SaveBar", () => {
  it("keeps the outlined Discard, standard Save and xl width by default", () => {
    const { bar, discard, save } = renderBar()

    expect(bar.getAttribute("data-shape")).toBeNull()
    expect(bar.classList.contains("xl:max-w-4xl")).toBe(true)
    expect(bar.classList.contains("rounded-lg")).toBe(true)
    expect(discard.getAttribute("data-variant")).toBe("outline")
    expect(discard.getAttribute("data-shape")).toBeNull()
    expect(discard.classList.contains("border-inverse-foreground")).toBe(true)
    expect(discard.classList.contains("h-10")).toBe(true)
    expect(save.getAttribute("data-variant")).toBe("default")
    expect(save.getAttribute("data-shape")).toBeNull()
    expect(save.classList.contains("rounded-control")).toBe(true)
    expect(save.classList.contains("h-10")).toBe(true)
  })

  it('shape="pill" makes both actions 36px pills and Discard quiet', () => {
    const { bar, discard, save } = renderBar({ shape: "pill" })

    expect(bar.getAttribute("data-shape")).toBe("pill")
    expect(bar.classList.contains("xl:max-w-4xl")).toBe(false)
    expect(bar.classList.contains("lg:max-w-3xl")).toBe(true)
    expect(bar.classList.contains("rounded-xl")).toBe(true)

    for (const button of [discard, save]) {
      expect(button.getAttribute("data-shape")).toBe("pill")
      expect(button.classList.contains("rounded-full")).toBe(true)
      expect(button.classList.contains("h-9")).toBe(true)
      expect(button.classList.contains("h-11")).toBe(false)
      expect(button.classList.contains("font-semibold")).toBe(true)
    }

    expect(discard.getAttribute("data-variant")).not.toBe("outline")
    expect(discard.classList.contains("border-inverse-foreground")).toBe(false)
    expect(discard.classList.contains("border-inverse-foreground/20")).toBe(
      true
    )
    expect(save.getAttribute("data-variant")).toBe("default")
  })

  it('shape="pill" keeps the labels, clicks and loading behaviour', async () => {
    const user = userEvent.setup()
    const { onSave, onDiscard, discard, save } = renderBar({ shape: "pill" })

    await user.click(discard)
    await user.click(save)
    expect(onDiscard).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('shape="pill" while loading disables Discard and busies Save', async () => {
    const user = userEvent.setup()
    const { onSave, discard, save } = renderBar({
      shape: "pill",
      loading: true,
    })

    expect(discard.hasAttribute("disabled")).toBe(true)
    expect(save.getAttribute("aria-busy")).toBe("true")
    expect(save.querySelector("svg")).not.toBeNull()
    save.focus()
    await user.keyboard("{Enter}")
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shape="pill" disables only Save', () => {
    const { discard, save } = renderBar({ shape: "pill", disabled: true })

    expect(save.hasAttribute("disabled")).toBe(true)
    expect(discard.hasAttribute("disabled")).toBe(false)
  })

  it('shape="pill" makes the save-menu chevron a matching pill half', () => {
    renderBar({
      shape: "pill",
      saveMenu: <DropdownMenuItem>Save and publish</DropdownMenuItem>,
    })
    const save = screen.getByRole("button", { name: "Save changes" })
    const chevron = screen.getByRole("button", { name: "More save options" })

    expect(save.classList.contains("rounded-e-none")).toBe(true)
    expect(chevron.getAttribute("data-shape")).toBe("pill")
    expect(chevron.classList.contains("size-9")).toBe(true)
    expect(chevron.classList.contains("rounded-s-none")).toBe(true)
  })

  it("keeps the halves of a split pill Save from shrinking apart on press", () => {
    render(
      <SaveBar
        open
        shape="pill"
        message="Unsaved changes"
        onDiscard={() => {}}
        onSave={() => {}}
        saveMenu={<span>Save as draft</span>}
      />
    )
    const save = screen.getByRole("button", { name: "Save changes" })
    const chevron = screen.getByRole("button", { name: "More save options" })
    for (const half of [save, chevron])
      expect(half.classList.contains("active:scale-100")).toBe(true)
  })
})
