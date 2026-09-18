import type { Tier } from "./question"

export interface TierStats {
  skipped: number
  found: number
  notFound: number
}

export interface TrainingSession {
  levels: Tier[]
  stats: Record<Tier, TierStats>
}
