// Story 2.5 — resume an existing session, or start a new one.

import { Flame } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { StatsSummary } from "../components/StatsSummary"
import { useTrainingSession } from "../services/TrainingSessionContext"

export function TrainingEntryPage() {
  const { session, sessionStats, discardSession } = useTrainingSession()
  const navigate = useNavigate()

  if (!session) return <Navigate to="/entrainement/configuration" replace />

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

        <div className="flex flex-col gap-4 border-t border-brand-line pt-4">
          <h3 className="font-semibold">Statistiques de la session</h3>
          <StatsSummary stats={sessionStats} levels={session.levels} />
        </div>
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
