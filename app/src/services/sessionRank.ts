// Story 2.7 — pure rank computation for a completed targeted session. No
// storage or React here: trainingSessionService saves the per-rank counts,
// SessionRankCard displays the result.

import type { QuestionOutcome, Rank } from "../types/trainingSession"

// Highest first — also the display order for per-rank counts (Story 1.5).
export const RANK_ORDER: Rank[] = ["S+", "S", "A", "B", "C", "D"]

export const RANK_LABELS: Record<Rank, string> = {
  "S+": "Légendaire",
  S: "Excellent",
  A: "Solide",
  B: "Encourageant",
  C: "En progrès",
  D: "Premiers pas",
}

// Used as a CSS class suffix (`rank-splus`...) — "S+" isn't a valid class
// name character-wise, hence the explicit mapping.
export const RANK_SLUGS: Record<Rank, string> = {
  "S+": "splus",
  S: "s",
  A: "a",
  B: "b",
  C: "c",
  D: "d",
}

// A perfect session shorter than this gets S instead of S+.
export const MIN_TARGET_FOR_S_PLUS = 10

// Indexed by the number of whole fifths of the target found (0 to 4); 5/5
// (a perfect session) is handled separately because of the S+ length rule.
const RANK_BY_FIFTHS: Rank[] = ["D", "C", "B", "A", "S"]

// Thresholds are 20% steps of `found / target`. Computed in integers
// (found * 5 vs target) rather than with a float ratio, so a boundary like
// 8/10 = 80% can never land a hair below its threshold.
export function computeRank(found: number, target: number): Rank {
  if (target <= 0) return "D"
  const fifths = Math.floor((Math.min(found, target) * 5) / target)
  if (fifths >= 5) return target >= MIN_TARGET_FOR_S_PLUS ? "S+" : "S"
  return RANK_BY_FIFTHS[fifths]
}

export function computeRankFromOutcomes(outcomes: QuestionOutcome[], target: number): Rank {
  return computeRank(outcomes.filter((outcome) => outcome === "found").length, target)
}

// True exactly when the only thing between this session and S+ was its
// length — drives the "try a longer session" encouragement.
export function isPerfectButTooShortForSPlus(found: number, target: number): boolean {
  return target > 0 && found >= target && target < MIN_TARGET_FOR_S_PLUS
}
