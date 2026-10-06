import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
} from "@/index"

const slot = (element: Element | null) => element?.getAttribute("data-slot")

describe("Alert", () => {
  it("renders its children as they are when there is no action", () => {
    render(
      <Alert>
        <svg data-testid="icon" />
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect(alert.querySelector("[data-slot=alert-content]")).toBeNull()
    expect(
      [...alert.children].map((child) => slot(child) ?? child.tagName)
    ).toEqual(["svg", "alert-title", "alert-description"])
  })

  it("keeps the icon first and puts the text and action in one wrapping row", () => {
    render(
      <Alert>
        <svg data-testid="icon" />
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
        <AlertAction>
          <Button size="sm">Act</Button>
        </AlertAction>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    const [icon, content] = alert.children
    expect(alert.children).toHaveLength(2)
    expect(icon).toBe(screen.getByTestId("icon"))
    expect(slot(content)).toBe("alert-content")
    const [text, action] = content.children
    expect(slot(action)).toBe("alert-action")
    expect([...text.children].map(slot)).toEqual([
      "alert-title",
      "alert-description",
    ])
    expect(action.contains(screen.getByRole("button", { name: "Act" }))).toBe(
      true
    )
  })

  it("wraps the text and action without an icon", () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertAction>
          <Button size="sm">Act</Button>
        </AlertAction>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect([...alert.children].map(slot)).toEqual(["alert-content"])
    expect(
      [...alert.children[0].children].map(
        (child) => slot(child) ?? slot(child.firstElementChild)
      )
    ).toEqual(["alert-title", "alert-action"])
  })
})
