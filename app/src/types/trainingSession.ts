import type { Tier } from "./question"

export interface TierStats {
  skipped: number
  found: number
  notFound: number
}

// Same shape used for a single session's counters and for the lifetime
// cumulative ones — see trainingSessionService for why they're stored
// under separate keys despite sharing this type.
export type Stats = Record<Tier, TierStats>

// The outcome of a single answered (not skipped) question, in the order
// they occurred — drives the session progress bar. Skipping is
// deliberately excluded: it neither advances nor counts toward the target.
export type QuestionOutcome = "found" | "notFound"

// Just the session's configuration (which levels it covers, and how many
// questions it runs for) — its counters live separately, see
// trainingSessionService.
export interface TrainingSession {
  levels: Tier[]
  // Number of questions to answer before the session is complete, or null
  // for no limit (the session runs until the user starts a new one).
  targetCount: number | null
  // Whether the draw pool includes questions with no detailed correction
  // (results-only source, see Question.correction) — off by default, since
  // those don't offer a worked explanation to learn from. See Story 2.1.
  // Optional so a session stored before this field existed still parses as
  // valid (same pattern as Profile.soundEnabled) — treat a missing value as
  // `false` wherever read.
  includeWithoutDetailedCorrection?: boolean
}
