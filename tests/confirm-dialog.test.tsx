import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { ConfirmDialog, type ConfirmDialogProps } from "@/index"

const ACKNOWLEDGE = "I am sure I want to remove them"

function RemoveMember(props: Partial<ConfirmDialogProps>) {
  return (
    <ConfirmDialog
      trigger={<button type="button">Remove member</button>}
      title="Remove Amina Rahman?"
      description="They lose access straight away."
      acknowledgeLabel={ACKNOWLEDGE}
      confirmLabel="Yes, remove"
      destructive
      onConfirm={() => {}}
      {...props}
    />
  )
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Remove member" }))
}

function ControlledRemoveMember(props: Partial<ConfirmDialogProps>) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Remove member
      </button>
      <RemoveMember
        trigger={undefined}
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </>
  )
}

const confirmButton = () =>
  screen.getByRole<HTMLButtonElement>("button", { name: "Yes, remove" })
const checkbox = () => screen.getByRole("checkbox", { name: ACKNOWLEDGE })
const typedText = () => screen.getByRole<HTMLInputElement>("textbox").value

describe("ConfirmDialog acknowledgeLabel", () => {
  it("enables confirm only once the acknowledgement is ticked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<RemoveMember onConfirm={onConfirm} />)
    await open(user)

    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    expect(confirmButton().disabled).toBe(true)

    await user.click(screen.getByText(ACKNOWLEDGE))
    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    expect(confirmButton().disabled).toBe(false)

    await user.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("starts unticked and empty again after the dialog closes", async () => {
    const user = userEvent.setup()
    render(<RemoveMember confirmText="Amina" />)
    await open(user)
    await user.click(checkbox())
    await user.type(screen.getByRole("textbox"), "Amina")
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    await open(user)
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    expect(typedText()).toBe("")
    expect(confirmButton().disabled).toBe(true)
  })

  it("starts unticked and empty again after a controlled dialog closes through onOpenChange", async () => {
    const user = userEvent.setup()
    render(<ControlledRemoveMember confirmText="Amina" />)
    await open(user)
    await user.click(checkbox())
    await user.type(screen.getByRole("textbox"), "Amina")
    await user.keyboard("{Escape}")

    await open(user)
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    expect(typedText()).toBe("")
    expect(confirmButton().disabled).toBe(true)
  })

  it("starts unticked and empty again after a controlled dialog is closed through open", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <RemoveMember trigger={undefined} open confirmText="Amina" />
    )
    await user.click(checkbox())
    await user.type(screen.getByRole("textbox"), "Amina")
    expect(confirmButton().disabled).toBe(false)

    rerender(
      <RemoveMember trigger={undefined} open={false} confirmText="Amina" />
    )
    expect(screen.queryByRole("alertdialog")).toBeNull()
    rerender(<RemoveMember trigger={undefined} open confirmText="Amina" />)
    expect(checkbox().getAttribute("aria-checked")).toBe("false")
    expect(typedText()).toBe("")
    expect(confirmButton().disabled).toBe(true)
  })

  it("keeps the tick while a controlled dialog stays open", async () => {
    const user = userEvent.setup()
    render(<RemoveMember trigger={undefined} open onOpenChange={() => {}} />)
    await user.click(checkbox())
    await user.keyboard("{Escape}")

    expect(checkbox().getAttribute("aria-checked")).toBe("true")
    expect(confirmButton().disabled).toBe(false)
  })

  it("needs the typed text as well when confirmText is set", async () => {
    const user = userEvent.setup()
    render(<RemoveMember confirmText="Amina" />)
    await open(user)

    await user.click(checkbox())
    expect(confirmButton().disabled).toBe(true)

    await user.type(screen.getByRole("textbox"), "Amina")
    expect(confirmButton().disabled).toBe(false)

    await user.click(checkbox())
    expect(confirmButton().disabled).toBe(true)
  })

  it("adds no checkbox without an acknowledgeLabel", async () => {
    const user = userEvent.setup()
    render(<RemoveMember acknowledgeLabel={undefined} />)
    await open(user)

    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(confirmButton().disabled).toBe(false)
  })

  it("has no axe violations while open", async () => {
    const user = userEvent.setup()
    render(<RemoveMember />)
    await open(user)

    const results = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
        region: { enabled: false },
        "landmark-one-main": { enabled: false },
        "page-has-heading-one": { enabled: false },
      },
    })
    expect(results.violations.map((violation) => violation.id)).toEqual([])
  })
})

function RowMenu(props: Partial<ConfirmDialogProps>) {
  const more = React.useRef<HTMLButtonElement>(null)
  const [menu, setMenu] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)
  return (
    <>
      <button type="button">Elsewhere</button>
      <button ref={more} type="button" onClick={() => setMenu(true)}>
        More actions
      </button>
      {menu && (
        <button
          type="button"
          onClick={() => {
            // A menu item: it is gone once the dialog opens.
            setMenu(false)
            setConfirming(true)
          }}
        >
          Void invoice
        </button>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Void invoice INV-1002?"
        confirmLabel="Void"
        returnFocusTo={more}
        onConfirm={() => {}}
        {...props}
      />
    </>
  )
}

async function openFromMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "More actions" }))
  await user.click(screen.getByRole("button", { name: "Void invoice" }))
  await screen.findByRole("alertdialog")
}

describe("ConfirmDialog returnFocusTo", () => {
  it("returns focus to the element it names after Cancel", async () => {
    const user = userEvent.setup()
    render(<RowMenu />)
    await openFromMenu(user)
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "More actions" })
    )
  })

  it("returns focus after Confirm too", async () => {
    const user = userEvent.setup()
    render(<RowMenu />)
    await openFromMenu(user)
    await user.click(screen.getByRole("button", { name: "Void" }))
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "More actions" })
    )
  })

  it("takes an element or a function as well as a ref", async () => {
    const user = userEvent.setup()
    render(
      <RowMenu
        returnFocusTo={() => screen.getByRole("button", { name: "Elsewhere" })}
      />
    )
    await openFromMenu(user)
    await user.keyboard("{Escape}")
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Elsewhere" })
    )
  })

  it("lets onCloseAutoFocus place focus itself", async () => {
    const user = userEvent.setup()
    const onCloseAutoFocus = vi.fn((event: Event) => {
      event.preventDefault()
      screen.getByRole("button", { name: "Elsewhere" }).focus()
    })
    render(<RowMenu onCloseAutoFocus={onCloseAutoFocus} />)
    await openFromMenu(user)
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Elsewhere" })
    )
  })

  it("still returns focus to its own trigger without returnFocusTo", async () => {
    const user = userEvent.setup()
    render(<RemoveMember acknowledgeLabel={undefined} />)
    await open(user)
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Remove member" })
    )
  })
})
