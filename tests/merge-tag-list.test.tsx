import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  MergeTagChip,
  MergeTagList,
  TooltipProvider,
  type MergeTag,
} from "@/index"

const TAGS: MergeTag[] = [
  { tag: "order_number", description: "The order number", sample: "#1043" },
  { tag: "store_name" },
]

const renderWithTips = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>)

describe("MergeTagList", () => {
  it("shows each tag in braces, named for inserting it", () => {
    renderWithTips(<MergeTagList tags={TAGS} onInsert={() => {}} />)

    const chip = screen.getByRole("button", { name: "Insert {{order_number}}" })
    expect(chip.textContent).toBe("{{order_number}}")
    expect(chip.getAttribute("dir")).toBe("ltr")
    expect(chip.getAttribute("translate")).toBe("no")
    expect(
      screen.getByRole("button", { name: "Insert {{store_name}}" })
    ).toBeTruthy()
  })

  it("calls onInsert with the tag and its token on click, Enter and Space", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    renderWithTips(<MergeTagList tags={TAGS} onInsert={onInsert} />)

    const chip = screen.getByRole("button", { name: "Insert {{order_number}}" })
    await user.click(chip)
    chip.focus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")

    expect(onInsert).toHaveBeenCalledTimes(3)
    expect(onInsert).toHaveBeenLastCalledWith(TAGS[0], "{{order_number}}")
  })

  it("explains the tag and its sample when focused", async () => {
    const user = userEvent.setup()
    renderWithTips(<MergeTagList tags={TAGS} onInsert={() => {}} />)

    await user.tab()

    const tip = await screen.findByRole("tooltip")
    expect(tip.textContent).toContain("The order number")
    expect(tip.textContent).toContain("Example: #1043")
  })

  it("adds no tooltip to a tag with nothing to explain", () => {
    renderWithTips(<MergeTagList tags={[TAGS[1]]} onInsert={() => {}} />)

    expect(
      screen
        .getByRole("button", { name: "Insert {{store_name}}" })
        .hasAttribute("data-state")
    ).toBe(false)
  })

  it("stops inserting when disabled but still explains each tag", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    renderWithTips(<MergeTagList tags={TAGS} onInsert={onInsert} disabled />)

    for (const chip of screen.getAllByRole("button")) {
      expect(chip.getAttribute("aria-disabled")).toBe("true")
      await user.click(chip)
    }
    screen.getAllByRole("button")[0].focus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onInsert).not.toHaveBeenCalled()

    await user.tab({ shift: true })
    await user.tab()
    expect((await screen.findByRole("tooltip")).textContent).toContain(
      "Example: #1043"
    )
  })

  it("keeps a disabled chip's tooltip open when it's clicked", async () => {
    const user = userEvent.setup()
    renderWithTips(
      <MergeTagList tags={[TAGS[0]]} onInsert={() => {}} disabled />
    )

    const chip = screen.getByRole("button")
    await user.hover(chip)
    await screen.findByRole("tooltip")
    await user.click(chip)

    expect(chip.getAttribute("data-state")).not.toBe("closed")
  })

  it("titles a chip that has no tooltip, so a cut-off tag can still be read", () => {
    renderWithTips(
      <MergeTagList
        tags={[...TAGS, { tag: "cart_url", description: "  ", sample: true }]}
        onInsert={() => {}}
      />
    )

    for (const name of ["store_name", "cart_url"]) {
      const chip = screen.getByRole("button", { name: `Insert {{${name}}}` })
      expect(chip.getAttribute("title")).toBe(`{{${name}}}`)
      expect(chip.hasAttribute("data-state")).toBe(false)
    }
    expect(
      screen
        .getByRole("button", { name: "Insert {{order_number}}" })
        .hasAttribute("title")
    ).toBe(false)
  })

  it("lets a wrapping trigger's click run alongside the insert", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    const onClick = vi.fn()
    renderWithTips(
      <MergeTagChip tag={TAGS[1]} onInsert={onInsert} onClick={onClick} />
    )

    await user.click(screen.getByRole("button"))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onInsert).toHaveBeenCalledWith(TAGS[1], "{{store_name}}")
  })

  it("names the list", () => {
    renderWithTips(<MergeTagList tags={TAGS} onInsert={() => {}} />)
    expect(screen.getByRole("group", { name: "Merge tags" })).toBeTruthy()

    renderWithTips(
      <MergeTagList
        tags={TAGS}
        onInsert={() => {}}
        aria-label="Order email tags"
      />
    )
    expect(screen.getByRole("group", { name: "Order email tags" })).toBeTruthy()
  })

  it("adds no tooltip for an empty description and falls back to tags for empty groups", () => {
    renderWithTips(
      <MergeTagList
        tags={[{ tag: "cart_url", description: "", sample: false }]}
        groups={[]}
        onInsert={() => {}}
        labels={{ insert: undefined, example: undefined }}
      />
    )

    expect(
      screen
        .getByRole("button", { name: "Insert {{cart_url}}" })
        .hasAttribute("data-state")
    ).toBe(false)
  })

  it("renders labelled groups", () => {
    renderWithTips(
      <MergeTagList
        groups={[
          { label: "Order", tags: [TAGS[0]] },
          { label: "Store", tags: [TAGS[1]] },
        ]}
        onInsert={() => {}}
      />
    )

    const order = screen.getByRole("group", { name: "Order" })
    expect(order.textContent).toContain("{{order_number}}")
    expect(order.textContent).not.toContain("{{store_name}}")
    expect(screen.getByRole("group", { name: "Store" })).toBeTruthy()
  })

  it("takes the app's words for the name and the sample", async () => {
    const user = userEvent.setup()
    renderWithTips(
      <MergeTagList
        tags={[TAGS[0]]}
        onInsert={() => {}}
        labels={{
          insert: (token) => `${token} einfügen`,
          example: (sample) => <>Beispiel: {sample}</>,
        }}
      />
    )

    await user.tab()

    expect(
      screen.getByRole("button", { name: "{{order_number}} einfügen" })
    ).toBeTruthy()
    expect((await screen.findByRole("tooltip")).textContent).toContain(
      "Beispiel: #1043"
    )
  })
  it("shows and inserts a tag that already has its braces as written", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    const tag: MergeTag = { tag: "{{order_number}}" }
    renderWithTips(<MergeTagList tags={[tag]} onInsert={onInsert} />)

    const chip = screen.getByRole("button", { name: "Insert {{order_number}}" })
    expect(chip.textContent).toBe("{{order_number}}")
    expect(chip.getAttribute("title")).toBe("{{order_number}}")

    await user.click(chip)
    expect(onInsert).toHaveBeenCalledWith(tag, "{{order_number}}")
  })

  it("shows a block tag by its label and inserts its own text", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    const block: MergeTag = {
      tag: "{{#products}}…{{/products}}",
      insert: "{{#products}}\n{{name}}\n{{/products}}",
    }
    const named: MergeTag = {
      tag: "refund_items",
      label: "{{#refund_items}}…{{/refund_items}}",
      insert: "{{#refund_items}}{{/refund_items}}",
    }
    renderWithTips(<MergeTagList tags={[block, named]} onInsert={onInsert} />)

    const chip = screen.getByRole("button", {
      name: "Insert {{#products}}…{{/products}}",
    })
    expect(chip.textContent).toBe("{{#products}}…{{/products}}")
    await user.click(chip)
    expect(onInsert).toHaveBeenLastCalledWith(
      block,
      "{{#products}}\n{{name}}\n{{/products}}"
    )

    const namedChip = screen.getByRole("button", {
      name: "Insert {{#refund_items}}…{{/refund_items}}",
    })
    expect(namedChip.textContent).toBe("{{#refund_items}}…{{/refund_items}}")
    await user.click(namedChip)
    expect(onInsert).toHaveBeenLastCalledWith(
      named,
      "{{#refund_items}}{{/refund_items}}"
    )
  })

  it("works out an insert function for the list's locale, English by default", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    const offer = vi.fn((locale: string) => `{{#offer}}${locale}{{/offer}}`)
    const tag: MergeTag = { tag: "offer", insert: offer }
    const { rerender } = renderWithTips(
      <MergeTagList tags={[tag]} onInsert={onInsert} />
    )

    const chip = screen.getByRole("button", { name: "Insert {{offer}}" })
    expect(chip.textContent).toBe("{{offer}}")
    await user.click(chip)
    expect(onInsert).toHaveBeenLastCalledWith(tag, "{{#offer}}en{{/offer}}")

    rerender(
      <TooltipProvider>
        <MergeTagList tags={[tag]} onInsert={onInsert} locale="de" />
      </TooltipProvider>
    )
    await user.click(screen.getByRole("button", { name: "Insert {{offer}}" }))
    expect(onInsert).toHaveBeenLastCalledWith(tag, "{{#offer}}de{{/offer}}")
    expect(offer).toHaveBeenLastCalledWith("de")
  })

  it("treats an empty label or insert as unset", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    const tag: MergeTag = { tag: "order_number", label: "", insert: "" }
    const blank: MergeTag = { tag: "store_name", insert: () => "" }
    renderWithTips(<MergeTagList tags={[tag, blank]} onInsert={onInsert} />)

    const chip = screen.getByRole("button", { name: "Insert {{order_number}}" })
    expect(chip.textContent).toBe("{{order_number}}")
    await user.click(chip)
    expect(onInsert).toHaveBeenLastCalledWith(tag, "{{order_number}}")

    await user.click(
      screen.getByRole("button", { name: "Insert {{store_name}}" })
    )
    expect(onInsert).toHaveBeenLastCalledWith(blank, "{{store_name}}")
  })
})

describe("MergeTagChip", () => {
  it("keys chips apart when labels, inserts or tags repeat", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    renderWithTips(
      <MergeTagList
        tags={[
          { tag: "first_name", label: "Name" },
          { tag: "last_name", label: "Name" },
          { tag: "total", insert: "{{order_total}}" },
          { tag: "order_total", label: "{{order_total}}" },
          { tag: "total" },
        ]}
        onInsert={() => {}}
      />
    )

    expect(screen.getAllByRole("button")).toHaveLength(5)
    expect(
      error.mock.calls.some((args) => String(args[0]).includes("same key"))
    ).toBe(false)
    error.mockRestore()
  })

  it("keys chips that share a tag by their label or insert", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    renderWithTips(
      <MergeTagList
        tags={[
          { tag: "items", label: "{{#items}}…{{/items}}", insert: "a" },
          { tag: "items", label: "{{^items}}…{{/items}}", insert: "b" },
        ]}
        onInsert={() => {}}
      />
    )

    expect(screen.getAllByRole("button")).toHaveLength(2)
    expect(
      error.mock.calls.some((args) => String(args[0]).includes("same key"))
    ).toBe(false)
    error.mockRestore()
  })

  it("runs a callback ref's cleanup on unmount", () => {
    const cleanup = vi.fn()
    const ref = vi.fn(() => cleanup)
    const { unmount } = renderWithTips(
      <MergeTagChip ref={ref} tag={{ tag: "store_name" }} />
    )

    expect(ref).toHaveBeenCalledWith(screen.getByRole("button"))
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(ref).not.toHaveBeenCalledWith(null)
  })

  it.each([
    [
      "with a tooltip",
      { tag: "order_number", description: "The order number" },
    ],
    ["without a tooltip", { tag: "store_name" }],
  ])("passes a consumer's ref to the button, %s", (_case, tag) => {
    const ref = { current: null as HTMLButtonElement | null }
    renderWithTips(<MergeTagChip ref={ref} tag={tag} />)

    expect(ref.current).toBe(screen.getByRole("button"))
  })

  it("works on its own", async () => {
    const user = userEvent.setup()
    const onInsert = vi.fn()
    renderWithTips(<MergeTagChip tag={TAGS[1]} onInsert={onInsert} />)

    await user.click(
      screen.getByRole("button", { name: "Insert {{store_name}}" })
    )

    expect(onInsert).toHaveBeenCalledWith(TAGS[1], "{{store_name}}")
  })
})
