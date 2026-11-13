import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

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

  it("draws no close button without onDismiss", () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect(screen.queryByRole("button")).toBeNull()
    expect(alert.hasAttribute("data-dismissible")).toBe(false)
  })

  it("calls onDismiss from a named close button, by click and keyboard", async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(
      <Alert onDismiss={onDismiss}>
        <svg />
        <AlertTitle>Essential emails now always send</AlertTitle>
      </Alert>
    )
    const close = screen.getByRole("button", { name: "Dismiss" })
    expect(slot(close)).toBe("alert-dismiss")
    expect(close.getAttribute("type")).toBe("button")
    await user.tab()
    expect(document.activeElement).toBe(close)
    await user.keyboard("{Enter}")
    await user.click(close)
    expect(onDismiss).toHaveBeenCalledTimes(2)
    expect(onDismiss.mock.calls).toEqual([[], []])
    expect(screen.getByRole("alert").isConnected).toBe(true)
  })

  it("keeps the content clear of the close button when the caller sets padding", () => {
    render(
      <Alert onDismiss={() => {}} className="px-4">
        <AlertTitle>Title</AlertTitle>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect(alert.hasAttribute("data-dismissible")).toBe(true)
    expect(alert.className).toContain("px-4")
    expect(alert.className).toContain("data-dismissible:pe-9")
  })

  it("takes its name from dismissLabel and sits after the content with an action", () => {
    render(
      <Alert onDismiss={() => {}} dismissLabel="Close notice">
        <svg data-testid="icon" />
        <AlertTitle>Title</AlertTitle>
        <AlertAction>
          <Button size="sm">Act</Button>
        </AlertAction>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect(alert.hasAttribute("data-dismissible")).toBe(true)
    expect(
      [...alert.children].map((child) => slot(child) ?? child.tagName)
    ).toEqual(["svg", "alert-content", "alert-dismiss"])
    expect(screen.getByRole("button", { name: "Close notice" })).toBe(
      alert.lastElementChild
    )
  })
})
