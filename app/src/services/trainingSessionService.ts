import { TIER_ORDER } from "./questionMetadataService"
import type { Tier } from "../types/question"
import type { Stats, TierStats, TrainingSession } from "../types/trainingSession"
import { storage } from "./storage"

// Three independent keys, not one nested object: a session's own counters
// and the lifetime ones share the exact same shape (Stats) and the same
// increment logic, but have different reset triggers — starting a new
// session wipes SESSION_STATS_KEY only, never GLOBAL_STATS_KEY, which only
// a profile reset clears.
const SESSION_KEY = "trainingSession"
const SESSION_STATS_KEY = "trainingSessionStats"
const GLOBAL_STATS_KEY = "trainingGlobalStats"

function isValidSession(value: unknown): value is TrainingSession {
  if (!value || typeof value !== "object") return false
  return Array.isArray((value as Partial<TrainingSession>).levels)
}

function isValidStats(value: unknown): value is Stats {
  return typeof value === "object" && value !== null
}

function createEmptyStats(): Stats {
  const stats = {} as Stats
  for (const tier of TIER_ORDER) stats[tier] = { skipped: 0, found: 0, notFound: 0 }
  return stats
}

function readStats(key: string): Stats {
  const stored = storage.get<Stats>(key)
  return isValidStats(stored) ? stored : createEmptyStats()
}

function incrementStats(stats: Stats, tier: Tier, key: keyof TierStats): Stats {
  return { ...stats, [tier]: { ...stats[tier], [key]: stats[tier][key] + 1 } }
}

// Updates both the current session's counters and the lifetime ones in one
// call — there's only ever one trigger (an action on a question), so
// callers never have to remember to update the two separately.
function recordAction(tier: Tier, key: keyof TierStats): void {
  storage.set(SESSION_STATS_KEY, incrementStats(readStats(SESSION_STATS_KEY), tier, key))
  storage.set(GLOBAL_STATS_KEY, incrementStats(readStats(GLOBAL_STATS_KEY), tier, key))
}

export const trainingSessionService = {
  getActiveSession(): TrainingSession | null {
    const stored = storage.get<TrainingSession>(SESSION_KEY)
    return isValidSession(stored) ? stored : null
  },

  getSessionStats(): Stats {
    return readStats(SESSION_STATS_KEY)
  },

  getGlobalStats(): Stats {
    return readStats(GLOBAL_STATS_KEY)
  },

  startSession(levels: Tier[]): void {
    storage.set(SESSION_KEY, { levels } satisfies TrainingSession)
    storage.set(SESSION_STATS_KEY, createEmptyStats())
  },

  recordSkip(tier: Tier): void {
    recordAction(tier, "skipped")
  },

  recordFound(tier: Tier): void {
    recordAction(tier, "found")
  },

  recordNotFound(tier: Tier): void {
    recordAction(tier, "notFound")
  },

  // Story 2.5 "start a new session": discards the session and its own
  // counters — never the lifetime ones.
  clearSession(): void {
    storage.remove(SESSION_KEY)
    storage.remove(SESSION_STATS_KEY)
  },

  // Only called from profile reset (Story 1.3) — lifetime stats belong to
  // the profile, not to any one session.
  resetGlobalStats(): void {
    storage.remove(GLOBAL_STATS_KEY)
  },
}
