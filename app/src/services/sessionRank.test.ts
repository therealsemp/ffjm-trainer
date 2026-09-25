import { describe, expect, test } from "vitest"
import { computeRank, computeRankFromOutcomes, isPerfectButTooShortForSPlus, RANK_LABELS, RANK_ORDER } from "./sessionRank"
import type { Rank } from "../types/trainingSession"

// Expected rank for every possible score, per session length — mirrors the
// table in specifications/002-training-mode/story-2.7-session-ranking.md.
function expectedRanks(target: number): Rank[] {
  return Array.from({ length: target + 1 }, (_, found) => {
    const rate = found / target
    if (found === target) return target >= 10 ? "S+" : "S"
    if (rate >= 0.8) return "S"
    if (rate >= 0.6) return "A"
    if (rate >= 0.4) return "B"
    if (rate >= 0.2) return "C"
    return "D"
  })
}

describe("computeRank — thresholds", () => {
  test.each([5, 10, 15, 20])("every score of a %i-question session maps to the spec's rank", (target) => {
    const actual = Array.from({ length: target + 1 }, (_, found) => computeRank(found, target))
    expect(actual).toEqual(expectedRanks(target))
  })

  test("5-question session: one rank per correct answer", () => {
    expect([0, 1, 2, 3, 4, 5].map((found) => computeRank(found, 5))).toEqual(["D", "C", "B", "A", "S", "S"])
  })

  test("boundaries around 80% on 10 questions", () => {
    expect(computeRank(8, 10)).toBe("S")
    expect(computeRank(7, 10)).toBe("A")
  })

  test("boundaries around 20% on 20 questions", () => {
    expect(computeRank(4, 20)).toBe("C")
    expect(computeRank(3, 20)).toBe("D")
  })
})

describe("computeRank — S+ length rule", () => {
  test("a perfect 5-question session gets S, not S+", () => {
    expect(computeRank(5, 5)).toBe("S")
  })

  test.each([10, 15, 20])("a perfect %i-question session gets S+", (target) => {
    expect(computeRank(target, target)).toBe("S+")
  })
})

describe("computeRank — defensive inputs", () => {
  test("a zero target gives D rather than dividing by zero", () => {
    expect(computeRank(0, 0)).toBe("D")
  })

  test("found above target is capped at a perfect score", () => {
    expect(computeRank(12, 10)).toBe("S+")
  })
})

describe("computeRankFromOutcomes", () => {
  test("counts only 'found' outcomes", () => {
    expect(computeRankFromOutcomes(["found", "notFound", "found", "found", "notFound"], 5)).toBe("A")
  })
})

describe("isPerfectButTooShortForSPlus", () => {
  test("true only for a perfect session shorter than 10", () => {
    expect(isPerfectButTooShortForSPlus(5, 5)).toBe(true)
    expect(isPerfectButTooShortForSPlus(4, 5)).toBe(false)
    expect(isPerfectButTooShortForSPlus(10, 10)).toBe(false)
    expect(isPerfectButTooShortForSPlus(0, 0)).toBe(false)
  })
})

describe("rank labels", () => {
  test("every rank has its label, in order from highest to lowest", () => {
    expect(RANK_ORDER.map((rank) => `${rank} ${RANK_LABELS[rank]}`)).toEqual([
      "S+ Légendaire",
      "S Excellent",
      "A Solide",
      "B Encourageant",
      "C En progrès",
      "D Premiers pas",
    ])
  })
})
