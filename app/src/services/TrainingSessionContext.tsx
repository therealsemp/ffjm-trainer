// React wiring around trainingSessionService — same pattern as
// ProfileContext/ThemeContext.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { trainingSessionService } from "./trainingSessionService"
import type { Tier } from "../types/question"
import type { Stats, TrainingSession } from "../types/trainingSession"

interface TrainingSessionContextValue {
  session: TrainingSession | null
  sessionStats: Stats
  globalStats: Stats
  startSession: (levels: Tier[]) => void
  recordSkip: (tier: Tier) => void
  recordFound: (tier: Tier) => void
  recordNotFound: (tier: Tier) => void
  // Story 2.5 "start a new session": session + its own stats only.
  discardSession: () => void
  // Story 1.3 profile reset: session, its stats, and the lifetime stats.
  resetTrainingData: () => void
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null)

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TrainingSession | null>(() => trainingSessionService.getActiveSession())
  const [sessionStats, setSessionStats] = useState<Stats>(() => trainingSessionService.getSessionStats())
  const [globalStats, setGlobalStats] = useState<Stats>(() => trainingSessionService.getGlobalStats())

  const value = useMemo<TrainingSessionContextValue>(() => {
    function record(action: (tier: Tier) => void, tier: Tier) {
      action(tier)
      setSessionStats(trainingSessionService.getSessionStats())
      setGlobalStats(trainingSessionService.getGlobalStats())
    }

    return {
      session,
      sessionStats,
      globalStats,
      startSession: (levels) => {
        trainingSessionService.startSession(levels)
        setSession({ levels })
        setSessionStats(trainingSessionService.getSessionStats())
      },
      recordSkip: (tier) => record(trainingSessionService.recordSkip, tier),
      recordFound: (tier) => record(trainingSessionService.recordFound, tier),
      recordNotFound: (tier) => record(trainingSessionService.recordNotFound, tier),
      discardSession: () => {
        trainingSessionService.clearSession()
        setSession(null)
        setSessionStats(trainingSessionService.getSessionStats())
      },
      resetTrainingData: () => {
        trainingSessionService.clearSession()
        trainingSessionService.resetGlobalStats()
        setSession(null)
        setSessionStats(trainingSessionService.getSessionStats())
        setGlobalStats(trainingSessionService.getGlobalStats())
      },
    }
  }, [session, sessionStats, globalStats])

  return <TrainingSessionContext.Provider value={value}>{children}</TrainingSessionContext.Provider>
}

export function useTrainingSession(): TrainingSessionContextValue {
  const context = useContext(TrainingSessionContext)
  if (!context) {
    throw new Error("useTrainingSession must be used within a TrainingSessionProvider")
  }
  return context
}
