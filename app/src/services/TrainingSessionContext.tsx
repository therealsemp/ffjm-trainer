// React wiring around trainingSessionService — same pattern as
// ProfileContext/ThemeContext.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { trainingSessionService } from "./trainingSessionService"
import type { Tier } from "../types/question"
import type { QuestionOutcome, Stats, TrainingSession } from "../types/trainingSession"

interface TrainingSessionContextValue {
  session: TrainingSession | null
  sessionStats: Stats
  sessionOutcomes: QuestionOutcome[]
  globalStats: Stats
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
  // Story 1.3 profile reset: session, its stats, and the lifetime stats.
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

  const value = useMemo<TrainingSessionContextValue>(() => {
    function record(action: (tier: Tier) => void, tier: Tier): boolean {
      action(tier)
      const newOutcomes = trainingSessionService.getSessionOutcomes()
      setSessionStats(trainingSessionService.getSessionStats())
      setSessionOutcomes(newOutcomes)
      setGlobalStats(trainingSessionService.getGlobalStats())
      const completed = session !== null && trainingSessionService.isComplete(session, newOutcomes.length)
      if (completed) trainingSessionService.markJustCompleted()
      return completed
    }

    return {
      session,
      sessionStats,
      sessionOutcomes,
      globalStats,
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
      },
    }
  }, [session, sessionStats, sessionOutcomes, globalStats])

  return <TrainingSessionContext.Provider value={value}>{children}</TrainingSessionContext.Provider>
}

export function useTrainingSession(): TrainingSessionContextValue {
  const context = useContext(TrainingSessionContext)
  if (!context) {
    throw new Error("useTrainingSession must be used within a TrainingSessionProvider")
  }
  return context
}
