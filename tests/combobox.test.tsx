import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxInput,
  ComboboxValue,
} from "@/index"

function Categories({
  removeLabel,
}: {
  removeLabel?: (item: string) => string
}) {
  return (
    <Combobox
      multiple
      items={["Apparel", "Toys"]}
      defaultValue={["Apparel", "Toys"]}
    >
      <ComboboxChips>
        <ComboboxValue>
          {(values: string[]) =>
            values.map((item) => (
              <ComboboxChip key={item} removeLabel={removeLabel?.(item)}>
                {item}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label="Categories" />
      </ComboboxChips>
    </Combobox>
  )
}

describe("ComboboxChip", () => {
  it("names its remove button, in English by default", () => {
    render(<Categories />)
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2)
  })

  it("takes a translated, per-chip remove label", async () => {
    const user = userEvent.setup()
    render(<Categories removeLabel={(item) => `Quitar ${item}`} />)

    await user.click(screen.getByRole("button", { name: "Quitar Apparel" }))
    expect(screen.queryByRole("button", { name: "Quitar Apparel" })).toBeNull()
    expect(screen.getByRole("button", { name: "Quitar Toys" })).toBeTruthy()
  })
})

describe("ComboboxInput", () => {
  it("names its buttons in English by default and takes translations", () => {
    const { unmount } = render(
      <Combobox items={["Türkiye"]} defaultValue="Türkiye">
        <ComboboxInput aria-label="Country" showClear />
      </Combobox>
    )
    expect(screen.getByRole("button", { name: "Show options" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy()
    unmount()

    render(
      <Combobox items={["Türkiye"]} defaultValue="Türkiye">
        <ComboboxInput
          aria-label="Ülke"
          showClear
          triggerLabel="Seçenekleri göster"
          clearLabel="Temizle"
        />
      </Combobox>
    )
    expect(
      screen.getByRole("button", { name: "Seçenekleri göster" })
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Temizle" })).toBeTruthy()
  })
})
