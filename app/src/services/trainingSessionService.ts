import type { Tier } from "../types/question"
import type { TierStats, TrainingSession } from "../types/trainingSession"
import { storage } from "./storage"

const SESSION_KEY = "trainingSession"

const TIERS: Tier[] = ["CE", "CM", "C1", "C2", "L1/GP", "L2/HC"]

function isValidSession(value: unknown): value is TrainingSession {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<TrainingSession>
  return Array.isArray(candidate.levels) && typeof candidate.stats === "object" && candidate.stats !== null
}

function createEmptyStats(): Record<Tier, TierStats> {
  const stats = {} as Record<Tier, TierStats>
  for (const tier of TIERS) stats[tier] = { skipped: 0, found: 0, notFound: 0 }
  return stats
}

function updateStats(session: TrainingSession, tier: Tier, key: keyof TierStats): TrainingSession {
  const updated: TrainingSession = {
    ...session,
    stats: {
      ...session.stats,
      [tier]: { ...session.stats[tier], [key]: session.stats[tier][key] + 1 },
    },
  }
  storage.set(SESSION_KEY, updated)
  return updated
}

export const trainingSessionService = {
  getActiveSession(): TrainingSession | null {
    const stored = storage.get<TrainingSession>(SESSION_KEY)
    return isValidSession(stored) ? stored : null
  },

  // Story 2.5 will decide *when* this replaces an existing session
  // (resume vs. start new) — this lot always calls it directly.
  startSession(levels: Tier[]): TrainingSession {
    const session: TrainingSession = { levels, stats: createEmptyStats() }
    storage.set(SESSION_KEY, session)
    return session
  },

  recordSkip(session: TrainingSession, tier: Tier): TrainingSession {
    return updateStats(session, tier, "skipped")
  },

  recordFound(session: TrainingSession, tier: Tier): TrainingSession {
    return updateStats(session, tier, "found")
  },

  recordNotFound(session: TrainingSession, tier: Tier): TrainingSession {
    return updateStats(session, tier, "notFound")
  },

  clearSession(): void {
    storage.remove(SESSION_KEY)
  },
}
