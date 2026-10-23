import { defaultScreenReaderInstructions } from "@dnd-kit/core"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OptionListEditor } from "@/index"

const description = (element: Element) =>
  document
    .getElementById(element.getAttribute("aria-describedby")!)
    ?.textContent?.replace(/\s+/g, " ")
    .trim()

describe("OptionListEditor", () => {
  it("keeps dnd-kit's English role and instructions on its drag handles", async () => {
    render(
      <OptionListEditor value={["Red", "Blue"]} onValueChange={() => {}} />
    )
    const handle = screen.getByRole("button", { name: "Reorder Red" })
    expect(handle.getAttribute("aria-roledescription")).toBe("sortable")
    await waitFor(() =>
      expect(description(handle)).toBe(
        defaultScreenReaderInstructions.draggable.replace(/\s+/g, " ").trim()
      )
    )
  })

  it("takes a translated role and instructions", async () => {
    render(
      <OptionListEditor
        value={["Kırmızı", "Mavi"]}
        onValueChange={() => {}}
        labels={{
          reorder: (value) => `${value} değerini taşı`,
          dragHandleRole: "sıralanabilir",
          dragInstructions:
            "Taşımak için boşluk tuşuna basın, ok tuşlarıyla ilerleyin ve yeniden boşluk tuşuna basın.",
        }}
      />
    )
    const handle = screen.getByRole("button", {
      name: "Kırmızı değerini taşı",
    })
    expect(handle.getAttribute("aria-roledescription")).toBe("sıralanabilir")
    await waitFor(() =>
      expect(description(handle)).toBe(
        "Taşımak için boşluk tuşuna basın, ok tuşlarıyla ilerleyin ve yeniden boşluk tuşuna basın."
      )
    )
  })
})
