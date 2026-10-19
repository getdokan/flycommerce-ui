import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CopyField, Field, FieldLabel } from "@/index"

const URL_VALUE = "https://maisonoriel.com/sitemap.xml"

describe("CopyField", () => {
  it("shows the value read-only with an icon-only copy button", () => {
    render(<CopyField aria-label="Sitemap URL" value={URL_VALUE} mono />)

    const input = screen.getByRole("textbox", { name: "Sitemap URL" })
    expect(input).toHaveProperty("value", URL_VALUE)
    expect(input).toHaveProperty("readOnly", true)
    expect(
      input.closest("[data-slot=copy-field]")?.hasAttribute("data-mono")
    ).toBe(true)

    const button = screen.getByRole("button", { name: "Copy" })
    expect(button.textContent).toBe("")
  })

  it("copies the value and announces it", async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(
      <CopyField
        aria-label="Sitemap URL"
        value={URL_VALUE}
        copyLabel="Copy sitemap URL"
        copiedLabel="Copied to clipboard"
        onCopy={onCopy}
      />
    )

    await user.click(screen.getByRole("button", { name: "Copy sitemap URL" }))

    const button = await screen.findByRole("button", {
      name: "Copied to clipboard",
    })
    expect(await navigator.clipboard.readText()).toBe(URL_VALUE)
    expect(onCopy).toHaveBeenCalledWith(URL_VALUE)
    expect(button.querySelector("[aria-live=polite]")?.textContent).toBe(
      "Copied to clipboard"
    )
  })

  it("renders a visible label tied to the field", () => {
    render(<CopyField label="Callback URL" value={URL_VALUE} />)
    expect(screen.getByLabelText("Callback URL")).toHaveProperty(
      "value",
      URL_VALUE
    )
  })

  it("works inside a Field with its own label", () => {
    render(
      <Field>
        <FieldLabel htmlFor="cname">CNAME target</FieldLabel>
        <CopyField id="cname" value="cname.flycom.shop" />
      </Field>
    )
    expect(screen.getByLabelText("CNAME target")).toHaveProperty(
      "value",
      "cname.flycom.shop"
    )
  })

  it("reaches the copy button by keyboard and copies with Enter", async () => {
    const user = userEvent.setup()
    render(<CopyField aria-label="Sitemap URL" value={URL_VALUE} />)

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Sitemap URL" })
    )
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Copy" })
    )
    await user.keyboard("{Enter}")

    expect(await screen.findByRole("button", { name: "Copied" })).toBeTruthy()
    expect(await navigator.clipboard.readText()).toBe(URL_VALUE)
  })

  it("disables the field and the button together", () => {
    render(<CopyField aria-label="Signing secret" value="whsec_1" disabled />)
    expect(screen.getByRole("textbox")).toHaveProperty("disabled", true)
    expect(screen.getByRole("button", { name: "Copy" })).toHaveProperty(
      "disabled",
      true
    )
  })
})
