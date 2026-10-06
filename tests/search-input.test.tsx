import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SearchInput, type SearchInputProps } from "@/index"

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

const setup = (props: SearchInputProps) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<SearchInput {...props} />)
  return { user, input: screen.getByRole("searchbox") }
}

describe("SearchInput", () => {
  it("searches after typing pauses by default", async () => {
    const onSearch = vi.fn()
    const { user, input } = setup({ onSearch })

    await user.type(input, "shoes")
    expect(onSearch).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(300))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith("shoes")
  })

  it('never searches while typing when searchOn="enter"', async () => {
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    const { user, input } = setup({
      searchOn: "enter",
      onSearch,
      onValueChange,
    })

    await user.type(input, "shoes")
    act(() => vi.advanceTimersByTime(1000))
    expect(onValueChange).toHaveBeenLastCalledWith("shoes")
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('searches once on Enter when searchOn="enter"', async () => {
    const onSearch = vi.fn()
    const { user, input } = setup({ searchOn: "enter", onSearch })

    await user.type(input, "shoes{Enter}")
    act(() => vi.advanceTimersByTime(1000))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith("shoes")
  })

  it.each(["debounce", "enter"] as const)(
    "clears with the clear button and calls onClear (searchOn=%s)",
    async (searchOn) => {
      const onSearch = vi.fn()
      const onClear = vi.fn()
      const { user, input } = setup({
        searchOn,
        defaultValue: "shoes",
        onSearch,
        onClear,
      })

      await user.click(screen.getByRole("button", { name: "Clear search" }))
      expect(input).toHaveProperty("value", "")
      expect(onSearch).toHaveBeenCalledTimes(1)
      expect(onSearch).toHaveBeenCalledWith("")
      expect(onClear).toHaveBeenCalledTimes(1)
    }
  )

  it.each(["debounce", "enter"] as const)(
    "clears on Esc and calls onClear (searchOn=%s)",
    async (searchOn) => {
      const onSearch = vi.fn()
      const onClear = vi.fn()
      const { user, input } = setup({
        searchOn,
        defaultValue: "shoes",
        onSearch,
        onClear,
      })

      await user.type(input, "{Escape}")
      expect(input).toHaveProperty("value", "")
      expect(onSearch).toHaveBeenCalledTimes(1)
      expect(onSearch).toHaveBeenCalledWith("")
      expect(onClear).toHaveBeenCalledTimes(1)

      await user.type(input, "{Escape}")
      expect(onClear).toHaveBeenCalledTimes(1)
    }
  )
})
