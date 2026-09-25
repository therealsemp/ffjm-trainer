// React wiring around trainingSessionService — same pattern as
// ProfileContext/ThemeContext.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { trainingSessionService } from "./trainingSessionService"
import type { Tier } from "../types/question"
import type { QuestionOutcome, RankCounts, Stats, TrainingSession } from "../types/trainingSession"

interface TrainingSessionContextValue {
  session: TrainingSession | null
  sessionStats: Stats
  sessionOutcomes: QuestionOutcome[]
  globalStats: Stats
  // Lifetime number of completed sessions per rank (Story 2.7/1.5).
  rankCounts: RankCounts
  // Whether the active session reached its target question count (always
  // false for an unlimited session, or when there's no active session).
  sessionComplete: boolean
  startSession: (levels: Tier[], targetCount: number | null, includeWithoutDetailedCorrection: boolean) => void
  recordSkip: (tier: Tier) => void
  // Return whether that action completed the session, so the caller can
  // stop drawing new questions and show the recap instead.
  recordFound: (tier: Tier) => boolean
  recordNotFound: (tier: Tier) => boolean
  // Story 2.5 "start a new session": session + its own stats only.
  discardSession: () => void
  // Story 1.3 profile reset: session, its stats, and the lifetime stats
  // (per-rank counts included).
  resetTrainingData: () => void
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null)

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TrainingSession | null>(() => trainingSessionService.getActiveSession())
  const [sessionStats, setSessionStats] = useState<Stats>(() => trainingSessionService.getSessionStats())
  const [sessionOutcomes, setSessionOutcomes] = useState<QuestionOutcome[]>(() =>
    trainingSessionService.getSessionOutcomes(),
  )
  const [globalStats, setGlobalStats] = useState<Stats>(() => trainingSessionService.getGlobalStats())
  const [rankCounts, setRankCounts] = useState<RankCounts>(() => trainingSessionService.getRankCounts())

  const value = useMemo<TrainingSessionContextValue>(() => {
    function record(action: (tier: Tier) => void, tier: Tier): boolean {
      // Only the action that *crosses* the target completes the session —
      // one recorded on an already-complete session (shouldn't happen, the
      // question page redirects away, but cheap to guard) must not save its
      // rank a second time.
      const wasComplete =
        session !== null && trainingSessionService.isComplete(session, trainingSessionService.getSessionOutcomes().length)
      action(tier)
      const newOutcomes = trainingSessionService.getSessionOutcomes()
      setSessionStats(trainingSessionService.getSessionStats())
      setSessionOutcomes(newOutcomes)
      setGlobalStats(trainingSessionService.getGlobalStats())
      const completed =
        !wasComplete && session !== null && trainingSessionService.isComplete(session, newOutcomes.length)
      if (completed) {
        trainingSessionService.completeSession(session)
        setRankCounts(trainingSessionService.getRankCounts())
      }
      return completed
    }

    return {
      session,
      sessionStats,
      sessionOutcomes,
      globalStats,
      rankCounts,
      sessionComplete: session !== null && trainingSessionService.isComplete(session, sessionOutcomes.length),
      startSession: (levels, targetCount, includeWithoutDetailedCorrection) => {
        trainingSessionService.startSession(levels, targetCount, includeWithoutDetailedCorrection)
        setSession({ levels, targetCount, includeWithoutDetailedCorrection })
        setSessionStats(trainingSessionService.getSessionStats())
        setSessionOutcomes(trainingSessionService.getSessionOutcomes())
      },
      recordSkip: (tier) => {
        record(trainingSessionService.recordSkip, tier)
      },
      recordFound: (tier) => record(trainingSessionService.recordFound, tier),
      recordNotFound: (tier) => record(trainingSessionService.recordNotFound, tier),
      discardSession: () => {
        trainingSessionService.clearSession()
        setSession(null)
        setSessionStats(trainingSessionService.getSessionStats())
        setSessionOutcomes(trainingSessionService.getSessionOutcomes())
      },
      resetTrainingData: () => {
        trainingSessionService.clearSession()
        trainingSessionService.resetGlobalStats()
        setSession(null)
        setSessionStats(trainingSessionService.getSessionStats())
        setSessionOutcomes(trainingSessionService.getSessionOutcomes())
        setGlobalStats(trainingSessionService.getGlobalStats())
        setRankCounts(trainingSessionService.getRankCounts())
      },
    }
  }, [session, sessionStats, sessionOutcomes, globalStats, rankCounts])

  return <TrainingSessionContext.Provider value={value}>{children}</TrainingSessionContext.Provider>
}

export function useTrainingSession(): TrainingSessionContextValue {
  const context = useContext(TrainingSessionContext)
  if (!context) {
    throw new Error("useTrainingSession must be used within a TrainingSessionProvider")
  }
  return context
}
