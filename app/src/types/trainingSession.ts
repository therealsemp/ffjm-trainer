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

// Just the session's configuration (which levels it covers) — its
// counters live separately, see trainingSessionService.
export interface TrainingSession {
  levels: Tier[]
}
