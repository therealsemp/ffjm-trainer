import { render, screen, within } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { RankCountsSummary } from "./RankCountsSummary"

describe("RankCountsSummary", () => {
  test("shows only obtained ranks, highest first, letter and count", () => {
    render(<RankCountsSummary counts={{ C: 1, A: 2, S: 1 }} />)
    const items = screen.getAllByRole("listitem")
    expect(items.map((item) => item.textContent)).toEqual(["S1 session", "A2 sessions", "C1 session"])
    expect(within(items[0]).queryByText("Excellent")).not.toBeInTheDocument()
  })

  test("ignores ranks stored at zero", () => {
    render(<RankCountsSummary counts={{ "S+": 0, B: 3 }} />)
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
  })

  test("renders nothing when no session has been ranked", () => {
    const { container } = render(<RankCountsSummary counts={{}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
