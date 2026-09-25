// Story 2.5 — resume an existing session, or start a new one.

import { Flame } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { SessionProgressBar } from "../components/SessionProgressBar"
import { useTrainingSession } from "../services/TrainingSessionContext"

export function TrainingEntryPage() {
  const { session, sessionOutcomes, sessionComplete, discardSession } = useTrainingSession()
  const navigate = useNavigate()

  if (!session) return <Navigate to="/entrainement/configuration" replace />
  // A completed session is never offered for resuming — the recap
  // (TrainingRecapPage) is only reached right after finishing (see
  // TrainingQuestionPage), not by navigating back here later.
  if (sessionComplete) return <Navigate to="/entrainement/configuration" replace />

  function handleNewSession() {
    discardSession()
    navigate("/entrainement/configuration")
  }

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Reprendre l'entraînement ?</h1>

      <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Flame className="text-brand-gold" size={20} />
            Session en cours
          </h2>
          <Button to="/entrainement/question">Reprendre</Button>
        </div>
        <p className="text-brand-muted">Niveaux : {session.levels.join(", ")}</p>
        {/* Kept compact on purpose (Story 2.5): just where the session
            stands, with the same progress bar as the question screen — the
            detailed stats stay one tap away once resumed (Story 2.3). */}
        <p className="text-brand-muted">
          Progression :{" "}
          {session.targetCount !== null
            ? `${sessionOutcomes.length} / ${session.targetCount} questions`
            : `${sessionOutcomes.length} ${sessionOutcomes.length > 1 ? "questions répondues" : "question répondue"} (sans limite)`}
        </p>
        {session.targetCount !== null && (
          <SessionProgressBar outcomes={sessionOutcomes} target={session.targetCount} />
        )}
      </div>

      <button
        type="button"
        onClick={handleNewSession}
        className="cursor-pointer self-start rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
      >
        Démarrer une nouvelle session
      </button>
    </PageContainer>
  )
}
