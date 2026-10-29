import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/index"
import { applyTailwind } from "./tailwind"

function FileDetail({
  padding,
  size,
}: Pick<React.ComponentProps<typeof DialogContent>, "padding" | "size">) {
  return (
    <Dialog open>
      <DialogContent size={size} padding={padding}>
        <div className="grid md:grid-cols-2">
          <div data-testid="preview">Preview</div>
          <div className="flex flex-col">
            <div className="flex flex-col gap-6 p-6">
              <DialogHeader>
                <DialogTitle>sneaker.jpg</DialogTitle>
                <DialogDescription>
                  https://cdn.example.com/a.jpg
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter>
              <Button>Save</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const content = () =>
  document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!
const footer = () =>
  document.querySelector<HTMLElement>('[data-slot="dialog-footer"]')!

describe("DialogContent", () => {
  it("takes a 3xl size, 960px from sm upward", () => {
    render(<FileDetail size="3xl" />)
    expect(content().getAttribute("data-size")).toBe("3xl")
    expect(content().className).toContain("data-[size=3xl]:sm:max-w-[960px]")
  })

  it("keeps the padding, the gap and the footer's bleed by default", () => {
    render(<FileDetail size="xl" />)
    expect(content().getAttribute("data-padding")).toBe("default")
    expect(content().className.split(" ")).toEqual(
      expect.arrayContaining(["p-6", "gap-6"])
    )
    expect(footer().className.split(" ")).toEqual(
      expect.arrayContaining(["-mx-6", "-mb-6", "-bottom-6"])
    )
  })

  it("runs edge to edge with padding none, and the footer sits flush", async () => {
    render(<FileDetail size="3xl" padding="none" />)
    await applyTailwind()
    expect(content().getAttribute("data-padding")).toBe("none")
    expect(getComputedStyle(content()).paddingTop).toBe("0px")
    expect(getComputedStyle(content()).gap).toBe("0px")
    // One shrinkable column, so a long name or link can't widen the dialog on a phone.
    expect(getComputedStyle(content()).gridTemplateColumns).toBe(
      "repeat(1, minmax(0, 1fr))"
    )
    expect(getComputedStyle(footer()).marginInline).toBe("0px")
    expect(getComputedStyle(footer()).marginBottom).toBe("0px")
    expect(getComputedStyle(footer()).bottom).toBe("0px")
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy()
    expect(screen.getByRole("dialog", { name: "sneaker.jpg" })).toBeTruthy()
  })

  it("lets className override the padding, the gap, the columns and the footer's place with padding none", async () => {
    render(
      <Dialog open>
        <DialogContent
          padding="none"
          className="grid-cols-[1fr_1fr] gap-[7px] p-[10px]"
          aria-describedby={undefined}
        >
          <DialogTitle>Export</DialogTitle>
          <DialogFooter className="bottom-[5px] mx-[3px] mb-[2px]">
            <Button>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    await applyTailwind()
    expect(getComputedStyle(content()).paddingTop).toBe("10px")
    expect(getComputedStyle(content()).gap).toBe("7px")
    expect(getComputedStyle(content()).gridTemplateColumns).toBe("1fr 1fr")
    expect(getComputedStyle(footer()).marginInline).toBe("3px")
    expect(getComputedStyle(footer()).marginBottom).toBe("2px")
    expect(getComputedStyle(footer()).bottom).toBe("5px")
  })
})
