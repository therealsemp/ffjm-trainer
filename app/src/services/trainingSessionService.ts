import { TIER_ORDER } from "./questionMetadataService"
import type { Tier } from "../types/question"
import type { QuestionOutcome, Stats, TierStats, TrainingSession } from "../types/trainingSession"
import { storage } from "./storage"

// Four independent keys, not one nested object: a session's own counters
// and the lifetime ones share the exact same shape (Stats) and the same
// increment logic, but have different reset triggers — starting a new
// session wipes SESSION_STATS_KEY/SESSION_OUTCOMES_KEY only, never
// GLOBAL_STATS_KEY, which only a profile reset clears.
const SESSION_KEY = "trainingSession"
const SESSION_STATS_KEY = "trainingSessionStats"
const SESSION_OUTCOMES_KEY = "trainingSessionOutcomes"
const SESSION_JUST_COMPLETED_KEY = "trainingSessionJustCompleted"
const GLOBAL_STATS_KEY = "trainingGlobalStats"

function isValidSession(value: unknown): value is TrainingSession {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<TrainingSession>
  const targetCount = candidate.targetCount
  return Array.isArray(candidate.levels) && (targetCount === null || typeof targetCount === "number")
}

function isValidOutcomes(value: unknown): value is QuestionOutcome[] {
  return Array.isArray(value)
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

function getSessionOutcomes(): QuestionOutcome[] {
  const stored = storage.get<QuestionOutcome[]>(SESSION_OUTCOMES_KEY)
  return isValidOutcomes(stored) ? stored : []
}

function appendOutcome(outcome: QuestionOutcome): void {
  storage.set(SESSION_OUTCOMES_KEY, [...getSessionOutcomes(), outcome] satisfies QuestionOutcome[])
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

  getSessionOutcomes,

  // Whether the session has reached its target question count — always
  // false for an unlimited (targetCount: null) session.
  isComplete(session: TrainingSession, outcomesCount: number): boolean {
    return session.targetCount !== null && outcomesCount >= session.targetCount
  },

  // Set the instant an action brings the session to its target (see
  // TrainingSessionContext), read once by the recap page to tell "just
  // finished" apart from "completed a while ago, reached this screen some
  // other way" — and cleared right away so it can't fire twice. A plain
  // storage flag rather than React Router navigation state: it's written
  // synchronously in the same call that completes the session, so there's
  // no dependency on render/navigation timing.
  getJustCompleted(): boolean {
    return storage.get<boolean>(SESSION_JUST_COMPLETED_KEY) === true
  },

  markJustCompleted(): void {
    storage.set(SESSION_JUST_COMPLETED_KEY, true)
  },

  clearJustCompleted(): void {
    storage.remove(SESSION_JUST_COMPLETED_KEY)
  },

  startSession(levels: Tier[], targetCount: number | null, includeWithoutDetailedCorrection: boolean): void {
    storage.set(SESSION_KEY, { levels, targetCount, includeWithoutDetailedCorrection } satisfies TrainingSession)
    storage.set(SESSION_STATS_KEY, createEmptyStats())
    storage.set(SESSION_OUTCOMES_KEY, [] satisfies QuestionOutcome[])
    storage.remove(SESSION_JUST_COMPLETED_KEY)
  },

  recordSkip(tier: Tier): void {
    recordAction(tier, "skipped")
  },

  recordFound(tier: Tier): void {
    recordAction(tier, "found")
    appendOutcome("found")
  },

  recordNotFound(tier: Tier): void {
    recordAction(tier, "notFound")
    appendOutcome("notFound")
  },

  // Story 2.5 "start a new session": discards the session and its own
  // counters — never the lifetime ones.
  clearSession(): void {
    storage.remove(SESSION_KEY)
    storage.remove(SESSION_STATS_KEY)
    storage.remove(SESSION_OUTCOMES_KEY)
    storage.remove(SESSION_JUST_COMPLETED_KEY)
  },

  // Only called from profile reset (Story 1.3) — lifetime stats belong to
  // the profile, not to any one session.
  resetGlobalStats(): void {
    storage.remove(GLOBAL_STATS_KEY)
  },
}
