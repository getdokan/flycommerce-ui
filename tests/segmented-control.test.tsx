import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  DirectionProvider,
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlProps,
} from "@/index"

function Units({
  value,
  ...props
}: Omit<SegmentedControlProps, "value" | "defaultValue"> & {
  value?: string
}) {
  return (
    <SegmentedControl
      aria-label="Unit system"
      {...props}
      {...(value === undefined ? { defaultValue: "metric" } : { value })}
    >
      <SegmentedControlItem value="metric">Metric</SegmentedControlItem>
      <SegmentedControlItem value="imperial">Imperial</SegmentedControlItem>
      <SegmentedControlItem value="mixed">Mixed</SegmentedControlItem>
    </SegmentedControl>
  )
}

const radio = (name: string) => screen.getByRole("radio", { name })

async function press(user: ReturnType<typeof userEvent.setup>, key: string) {
  await user.keyboard(`{${key}>}`)
  await user.keyboard(`{/${key}}`)
}

describe("SegmentedControl", () => {
  it("requires a value or defaultValue, so it never starts empty", () => {
    // @ts-expect-error neither value nor defaultValue
    expect(() => render(<SegmentedControl aria-label="Empty" />)).not.toThrow()
  })

  it("is a labelled radio group with the default value checked", () => {
    render(<Units />)
    expect(screen.getByRole("radiogroup", { name: "Unit system" })).toBeTruthy()
    expect(radio("Metric").getAttribute("aria-checked")).toBe("true")
    expect(radio("Imperial").getAttribute("aria-checked")).toBe("false")
  })

  it("moves and selects with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Units onValueChange={onValueChange} />)

    await user.tab()
    expect(document.activeElement).toBe(radio("Metric"))

    await press(user, "ArrowRight")
    expect(document.activeElement).toBe(radio("Imperial"))
    expect(radio("Imperial").getAttribute("aria-checked")).toBe("true")
    expect(onValueChange).toHaveBeenLastCalledWith("imperial")

    await press(user, "ArrowLeft")
    await press(user, "ArrowLeft")
    expect(document.activeElement).toBe(radio("Mixed"))
    expect(radio("Mixed").getAttribute("aria-checked")).toBe("true")
    expect(onValueChange).toHaveBeenLastCalledWith("mixed")
  })

  it("follows the reading direction in RTL", async () => {
    const user = userEvent.setup()
    render(
      <DirectionProvider dir="rtl">
        <Units />
      </DirectionProvider>
    )

    await user.tab()
    await press(user, "ArrowLeft")
    expect(radio("Imperial").getAttribute("aria-checked")).toBe("true")
  })

  it("can't be emptied by clicking or pressing the checked option", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Units onValueChange={onValueChange} />)

    await user.click(radio("Metric"))
    await user.keyboard(" ")
    expect(radio("Metric").getAttribute("aria-checked")).toBe("true")
    expect(
      screen
        .getAllByRole("radio")
        .filter((r) => r.getAttribute("aria-checked") === "true")
    ).toHaveLength(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("selects on click and stays controlled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Units value="metric" onValueChange={onValueChange} />)

    await user.click(radio("Imperial"))
    expect(onValueChange).toHaveBeenCalledWith("imperial")
    expect(radio("Metric").getAttribute("aria-checked")).toBe("true")
  })

  it("skips disabled options and ignores a disabled group", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { unmount } = render(
      <SegmentedControl
        aria-label="Weight unit"
        defaultValue="g"
        onValueChange={onValueChange}
      >
        <SegmentedControlItem value="g">g</SegmentedControlItem>
        <SegmentedControlItem value="kg" disabled>
          kg
        </SegmentedControlItem>
        <SegmentedControlItem value="lb">lb</SegmentedControlItem>
      </SegmentedControl>
    )
    await user.tab()
    await press(user, "ArrowRight")
    expect(radio("lb").getAttribute("aria-checked")).toBe("true")
    unmount()

    onValueChange.mockClear()
    render(<Units disabled onValueChange={onValueChange} />)
    await user.click(radio("Imperial"))
    expect(radio("Metric").getAttribute("aria-checked")).toBe("true")
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
