import type * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/index"

function Invite(props: React.ComponentProps<typeof SheetContent>) {
  return (
    <Sheet open>
      <SheetContent {...props}>
        <SheetTitle>Invite a team member</SheetTitle>
        <SheetDescription>They get an email with a link.</SheetDescription>
      </SheetContent>
    </Sheet>
  )
}

const sheet = () => screen.getByRole("dialog", { name: "Invite a team member" })

describe("SheetContent", () => {
  it("is a small right sheet unless told otherwise", () => {
    render(<Invite />)
    expect(sheet().getAttribute("data-side")).toBe("right")
    expect(sheet().getAttribute("data-size")).toBe("sm")
  })

  it("takes a size", () => {
    render(<Invite size="2xl" />)
    expect(sheet().getAttribute("data-size")).toBe("2xl")
  })
})
