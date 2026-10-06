import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card, CardContent } from "@/index"

describe("CardContent", () => {
  it("marks flush content with data-flush, and only flush content", () => {
    render(
      <Card>
        <CardContent>Padded</CardContent>
        <CardContent flush>Edge to edge</CardContent>
        <CardContent flush={false}>Not flush</CardContent>
      </Card>
    )
    expect(screen.getByText("Padded").hasAttribute("data-flush")).toBe(false)
    expect(screen.getByText("Edge to edge").hasAttribute("data-flush")).toBe(
      true
    )
    expect(screen.getByText("Not flush").hasAttribute("data-flush")).toBe(false)
  })
})
