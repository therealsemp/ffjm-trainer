import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { StatsSummary } from "./StatsSummary"
import type { Stats } from "../types/trainingSession"

function stats(partial: Partial<Stats>): Stats {
  const empty = { skipped: 0, found: 0, notFound: 0 }
  return { CE: empty, CM: empty, C1: empty, C2: empty, "L1/GP": empty, "L2/HC": empty, ...partial }
}

const SAMPLE = stats({
  CE: { skipped: 2, found: 14, notFound: 1 },
  CM: { skipped: 0, found: 0, notFound: 2 },
  C1: { skipped: 1, found: 2, notFound: 0 },
})

describe("StatsSummary", () => {
  test("tiles show the success rate, found and not found totals", () => {
    render(<StatsSummary stats={SAMPLE} />)
    expect(screen.getByText("84 %")).toBeInTheDocument() // 16 / 19
    expect(screen.getByText("Réussite")).toBeInTheDocument()
    expect(screen.getByText("16")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  test("skipped questions only appear in the discreet summary line", () => {
    render(<StatsSummary stats={SAMPLE} />)
    expect(screen.getByText("19 questions répondues, 3 passées")).toBeInTheDocument()
  })

  test("one row per level with answers, value at the tip as found / answered", () => {
    render(<StatsSummary stats={SAMPLE} />)
    expect(screen.getByText("CE")).toBeInTheDocument()
    expect(screen.getByText("14 / 15")).toBeInTheDocument()
    expect(screen.getByText("0 / 2")).toBeInTheDocument()
    expect(screen.getByText("2 / 2")).toBeInTheDocument()
    expect(screen.queryByText("C2")).not.toBeInTheDocument()
  })

  test("the three tiles share one equal-width grid", () => {
    render(<StatsSummary stats={SAMPLE} />)
    expect(screen.getByText("Réussite").closest(".grid")).toHaveClass("grid-cols-3")
  })

  test("bars keep absolute lengths relative to the busiest level", () => {
    const { container } = render(<StatsSummary stats={SAMPLE} />)
    const ratios = Array.from(container.querySelectorAll<HTMLElement>("[data-ratio]")).map((bar) =>
      Number(bar.dataset.ratio),
    )
    expect(ratios[0]).toBe(1)
    expect(ratios[1]).toBeCloseTo(2 / 15)
    expect(ratios[2]).toBeCloseTo(2 / 15)
  })

  test("segments carry found / not-found tooltips, no skipped segment", () => {
    const { container } = render(<StatsSummary stats={stats({ CE: { skipped: 4, found: 3, notFound: 1 } })} />)
    const titles = Array.from(container.querySelectorAll("[title]")).map((element) => element.getAttribute("title"))
    expect(titles).toEqual(["Trouvées : 3", "Non trouvées : 1"])
  })

  test("with levels given (session view), every level gets a row, even with nothing answered", () => {
    render(<StatsSummary stats={stats({ CE: { skipped: 1, found: 2, notFound: 0 } })} levels={["CE", "CM"]} />)
    expect(screen.getByText("CE")).toBeInTheDocument()
    expect(screen.getByText("CM")).toBeInTheDocument()
    expect(screen.getByText("0 / 0")).toBeInTheDocument()
  })

  test("the success-rate tile shows a dash when nothing was answered yet (tiles stay three)", () => {
    render(<StatsSummary stats={stats({ CE: { skipped: 2, found: 0, notFound: 0 } })} />)
    expect(screen.getByText("Réussite").previousElementSibling).toHaveTextContent("-")
    expect(screen.getByText("0 question répondue, 2 passées")).toBeInTheDocument()
  })
})
