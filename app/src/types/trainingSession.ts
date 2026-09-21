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
}
