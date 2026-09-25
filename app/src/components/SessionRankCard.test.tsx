import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { SessionRankCard } from "./SessionRankCard"
import type { QuestionOutcome } from "../types/trainingSession"

function outcomes(found: number, notFound: number): QuestionOutcome[] {
  return [...Array<QuestionOutcome>(found).fill("found"), ...Array<QuestionOutcome>(notFound).fill("notFound")]
}

function dots(container: HTMLElement) {
  return Array.from(container.querySelectorAll(".rank-dot")) as HTMLElement[]
}

const HINT = /Les sessions d'au moins 10 questions permettent de débloquer des rangs supplémentaires/

describe("SessionRankCard", () => {
  test("shows the rank letter (accessibly) and its label", () => {
    render(<SessionRankCard outcomes={outcomes(7, 3)} target={10} skipped={0} />)
    expect(screen.getByRole("img", { name: "Rang A" })).toHaveTextContent("A")
    expect(screen.getByText("Solide")).toBeInTheDocument()
    expect(screen.getByText("7 trouvées sur 10")).toBeInTheDocument()
  })

  test("a perfect 10-question session shows S+ Légendaire, without the hint", () => {
    render(<SessionRankCard outcomes={outcomes(10, 0)} target={10} skipped={0} />)
    expect(screen.getByRole("img", { name: "Rang S+" })).toBeInTheDocument()
    expect(screen.getByText("Légendaire")).toBeInTheDocument()
    expect(screen.queryByText(HINT)).not.toBeInTheDocument()
  })

  test("a perfect 5-question session shows S with the longer-session hint", () => {
    render(<SessionRankCard outcomes={outcomes(5, 0)} target={5} skipped={0} />)
    expect(screen.getByRole("img", { name: "Rang S" })).toBeInTheDocument()
    expect(screen.getByText("Excellent")).toBeInTheDocument()
    expect(screen.getByText(HINT)).toBeInTheDocument()
  })

  test("a non-perfect 5-question session shows no hint", () => {
    render(<SessionRankCard outcomes={outcomes(4, 1)} target={5} skipped={0} />)
    expect(screen.queryByText(HINT)).not.toBeInTheDocument()
  })

  test("renders one dot per answered question, in order, colored by outcome", () => {
    const ordered: QuestionOutcome[] = ["found", "notFound", "found", "found", "notFound"]
    const { container } = render(<SessionRankCard outcomes={ordered} target={5} skipped={2} />)
    expect(dots(container).map((dot) => dot.style.backgroundColor)).toEqual([
      "var(--color-status-good)",
      "var(--color-status-warning)",
      "var(--color-status-good)",
      "var(--color-status-good)",
      "var(--color-status-warning)",
    ])
    expect(screen.getByRole("img", { name: "Réponses : 3 trouvées, 2 non trouvées" })).toBeInTheDocument()
  })

  test("the hint doesn't name the S+ rank", () => {
    render(<SessionRankCard outcomes={outcomes(5, 0)} target={5} skipped={0} />)
    expect(screen.getByText(HINT)).not.toHaveTextContent(/S\+|Légendaire/)
  })

  test("dots are laid out in rows of 5, and of 10 from the sm breakpoint when the session is longer than 5", () => {
    const { container, rerender } = render(<SessionRankCard outcomes={outcomes(5, 0)} target={5} skipped={0} />)
    const grid = () => container.querySelector(".rank-dot")!.parentElement!
    expect(grid()).toHaveClass("grid-cols-5")
    expect(grid()).not.toHaveClass("sm:grid-cols-10")
    rerender(<SessionRankCard outcomes={outcomes(10, 5)} target={15} skipped={0} />)
    expect(grid()).toHaveClass("grid-cols-5", "sm:grid-cols-10")
  })

  test("shows the skipped counter only when something was skipped", () => {
    const { rerender } = render(<SessionRankCard outcomes={outcomes(8, 2)} target={10} skipped={0} />)
    expect(screen.queryByText(/passée/)).not.toBeInTheDocument()
    rerender(<SessionRankCard outcomes={outcomes(8, 2)} target={10} skipped={1} />)
    expect(screen.getByText("1 question passée")).toBeInTheDocument()
    rerender(<SessionRankCard outcomes={outcomes(8, 2)} target={10} skipped={6} />)
    expect(screen.getByText("6 questions passées")).toBeInTheDocument()
  })

  test("skips don't change the rank", () => {
    render(<SessionRankCard outcomes={outcomes(8, 2)} target={10} skipped={6} />)
    expect(screen.getByRole("img", { name: "Rang S" })).toBeInTheDocument()
  })

  test("sparkles only for S and S+", () => {
    const { container, rerender } = render(<SessionRankCard outcomes={outcomes(10, 0)} target={10} skipped={0} />)
    expect(container.querySelectorAll(".rank-sparkle").length).toBeGreaterThan(0)
    rerender(<SessionRankCard outcomes={outcomes(7, 3)} target={10} skipped={0} />)
    expect(container.querySelectorAll(".rank-sparkle")).toHaveLength(0)
  })
})
