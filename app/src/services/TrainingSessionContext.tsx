// React wiring around trainingSessionService — same pattern as
// ProfileContext/ThemeContext.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { trainingSessionService } from "./trainingSessionService"
import type { Tier } from "../types/question"
import type { TrainingSession } from "../types/trainingSession"

interface TrainingSessionContextValue {
  session: TrainingSession | null
  startSession: (levels: Tier[]) => void
  recordSkip: (tier: Tier) => void
  recordFound: (tier: Tier) => void
  recordNotFound: (tier: Tier) => void
}

const TrainingSessionContext = createContext<TrainingSessionContextValue | null>(null)

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TrainingSession | null>(() => trainingSessionService.getActiveSession())

  const value = useMemo<TrainingSessionContextValue>(
    () => ({
      session,
      startSession: (levels) => setSession(trainingSessionService.startSession(levels)),
      recordSkip: (tier) =>
        setSession((current) => (current ? trainingSessionService.recordSkip(current, tier) : current)),
      recordFound: (tier) =>
        setSession((current) => (current ? trainingSessionService.recordFound(current, tier) : current)),
      recordNotFound: (tier) =>
        setSession((current) => (current ? trainingSessionService.recordNotFound(current, tier) : current)),
    }),
    [session],
  )

  return <TrainingSessionContext.Provider value={value}>{children}</TrainingSessionContext.Provider>
}

export function useTrainingSession(): TrainingSessionContextValue {
  const context = useContext(TrainingSessionContext)
  if (!context) {
    throw new Error("useTrainingSession must be used within a TrainingSessionProvider")
  }
  return context
}
