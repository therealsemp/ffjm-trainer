import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { ZoomableImage } from "./ZoomableImage"

describe("ZoomableImage", () => {
  test("renders nothing when src is missing", () => {
    const { container } = render(<ZoomableImage alt="no source" />)
    expect(container).toBeEmptyDOMElement()
  })

  test("renders a thumbnail, plus a closed (not accessibly visible) dialog", () => {
    render(<ZoomableImage src="/fig.png" alt="a figure" />)
    // The dialog starts closed — jsdom (like real browsers) applies
    // `dialog:not([open]) { display: none }`, so only the thumbnail is
    // exposed to the accessibility tree until it's opened.
    expect(screen.getAllByRole("img", { name: "a figure" })).toHaveLength(1)
    expect(document.querySelector("dialog")).not.toBeNull()
    expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(false)
  })

  test("clicking the thumbnail opens the dialog, revealing its own image", async () => {
    const user = userEvent.setup()
    render(<ZoomableImage src="/fig.png" alt="a figure" />)
    await user.click(screen.getAllByRole("img", { name: "a figure" })[0])
    expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(true)
    expect(screen.getAllByRole("img", { name: "a figure" })).toHaveLength(2)
  })

  test("clicking inside the open dialog closes it", async () => {
    const user = userEvent.setup()
    render(<ZoomableImage src="/fig.png" alt="a figure" />)
    await user.click(screen.getAllByRole("img", { name: "a figure" })[0])
    const dialog = document.querySelector("dialog")!
    await user.click(dialog)
    expect(dialog.hasAttribute("open")).toBe(false)
  })
})
