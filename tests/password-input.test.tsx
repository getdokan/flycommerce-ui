import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PasswordInput } from "@/index"

const describedBy = (input: HTMLElement) =>
  (input.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)

describe("PasswordInput", () => {
  it("keeps the placeholder and description without a saved secret", () => {
    const { container } = render(
      <>
        <span id="hint">At least 8 characters.</span>
        <PasswordInput
          aria-label="Password"
          placeholder="Enter a password"
          aria-describedby="hint"
        />
      </>
    )
    const input = screen.getByLabelText("Password")
    expect(input.getAttribute("placeholder")).toBe("Enter a password")
    expect(describedBy(input)).toEqual(["At least 8 characters."])
    expect(
      container.querySelector("[data-slot=password-input-saved]")
    ).toBeNull()
  })

  it("masks a saved secret's last characters and tells screen readers", () => {
    render(
      <>
        <span id="hint">From your Stripe dashboard.</span>
        <PasswordInput
          aria-label="Secret key"
          placeholder="sk_live_…"
          aria-describedby="hint"
          savedSuffix="4f2a"
        />
      </>
    )
    const input = screen.getByLabelText("Secret key")
    expect(input.getAttribute("placeholder")).toBe("••••••••4f2a")
    expect((input as HTMLInputElement).value).toBe("")
    expect(describedBy(input)).toEqual([
      "From your Stripe dashboard.",
      "Saved, ends in 4f2a. Leave blank to keep it.",
    ])
  })

  it("takes its own words and still reveals what is typed", async () => {
    const user = userEvent.setup()
    render(
      <PasswordInput
        aria-label="License key"
        savedSuffix="7Q2K"
        savedPlaceholder={(suffix) => `************${suffix}`}
        savedLabel={(suffix) => `Gespeichert, endet auf ${suffix}.`}
        showLabel="Show secret"
        hideLabel="Hide secret"
      />
    )
    const input = screen.getByLabelText("License key")
    expect(input.getAttribute("placeholder")).toBe("************7Q2K")
    expect(describedBy(input)).toEqual(["Gespeichert, endet auf 7Q2K."])

    await user.type(input, "new-key")
    await user.click(screen.getByRole("button", { name: "Show secret" }))
    expect(input.getAttribute("type")).toBe("text")
    expect((input as HTMLInputElement).value).toBe("new-key")
    expect(screen.getByRole("button", { name: "Hide secret" })).toBeTruthy()
  })

  it("keeps browsers and password managers from filling a saved secret", () => {
    const { rerender } = render(<PasswordInput aria-label="Password" />)
    const input = screen.getByLabelText("Password")
    expect(input.getAttribute("autocomplete")).toBe("current-password")
    expect(input.hasAttribute("data-1p-ignore")).toBe(false)
    expect(input.hasAttribute("data-lpignore")).toBe(false)

    rerender(<PasswordInput aria-label="Password" savedSuffix="4f2a" />)
    expect(input.getAttribute("autocomplete")).toBe("new-password")
    expect(input.hasAttribute("data-1p-ignore")).toBe(true)
    expect(input.getAttribute("data-lpignore")).toBe("true")

    rerender(
      <PasswordInput
        aria-label="Password"
        savedSuffix="4f2a"
        autoComplete="off"
      />
    )
    expect(input.getAttribute("autocomplete")).toBe("off")
  })

  it("offers to reveal a saved secret only once something is typed", async () => {
    const user = userEvent.setup()
    render(
      <PasswordInput
        aria-label="Secret key"
        savedSuffix="4f2a"
        showLabel="Show secret"
      />
    )
    const input = screen.getByLabelText("Secret key")
    expect(screen.queryByRole("button", { name: "Show secret" })).toBeNull()

    await user.type(input, "sk")
    expect(screen.getByRole("button", { name: "Show secret" })).toBeTruthy()

    await user.clear(input)
    expect(screen.queryByRole("button", { name: "Show secret" })).toBeNull()
  })

  it("follows a controlled value", () => {
    const { rerender } = render(
      <PasswordInput
        aria-label="Secret key"
        savedSuffix="4f2a"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.queryByRole("button", { name: "Show password" })).toBeNull()

    rerender(
      <PasswordInput
        aria-label="Secret key"
        savedSuffix="4f2a"
        value="sk_live"
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: "Show password" })).toBeTruthy()
  })

  it("always offers to reveal a password with nothing saved", () => {
    render(<PasswordInput aria-label="Password" />)
    expect(screen.getByRole("button", { name: "Show password" })).toBeTruthy()
  })
})
