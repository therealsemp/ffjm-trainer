import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { StatsSummary } from "./StatsSummary"
import type { Stats } from "../types/trainingSession"

function stats(partial: Partial<Stats>): Stats {
  const empty = { skipped: 0, found: 0, notFound: 0 }
  return { CE: empty, CM: empty, C1: empty, C2: empty, "L1/GP": empty, "L2/HC": empty, ...partial }
}

describe("StatsSummary — skipped questions left out of the per-level detail", () => {
  test("the overall totals still include the skipped count", () => {
    render(<StatsSummary stats={stats({ CE: { skipped: 4, found: 3, notFound: 1 } })} />)
    expect(screen.getByText("Ignorées").previousElementSibling).toHaveTextContent("4")
  })

  test("per-level figures show found · not found only", () => {
    render(<StatsSummary stats={stats({ CE: { skipped: 4, found: 3, notFound: 1 } })} />)
    expect(screen.getByText("3 · 1")).toBeInTheDocument()
    expect(screen.queryByText("4 · 3 · 1")).not.toBeInTheDocument()
  })

  test("bars have no skipped segment, and the legend doesn't list it", () => {
    const { container } = render(<StatsSummary stats={stats({ CE: { skipped: 4, found: 3, notFound: 1 } })} />)
    const segmentTitles = Array.from(container.querySelectorAll("[title]")).map((element) => element.getAttribute("title"))
    expect(segmentTitles).toEqual(["Trouvées : 3", "Non trouvées : 1"])
    expect(screen.getAllByText("Ignorées")).toHaveLength(1)
  })

  test("lifetime view: a level with only skipped questions gets no row", () => {
    render(
      <StatsSummary
        stats={stats({ CE: { skipped: 5, found: 0, notFound: 0 }, CM: { skipped: 0, found: 2, notFound: 0 } })}
      />,
    )
    expect(screen.queryByText("CE")).not.toBeInTheDocument()
    expect(screen.getByText("CM")).toBeInTheDocument()
  })

  test("session view: every selected level gets a row, even with only skips", () => {
    render(<StatsSummary stats={stats({ CE: { skipped: 5, found: 0, notFound: 0 } })} levels={["CE", "CM"]} />)
    expect(screen.getByText("CE")).toBeInTheDocument()
    expect(screen.getByText("CM")).toBeInTheDocument()
  })
})
