// Story 2.2 — question flow. Metadata only for now (year/phase/tier/number)
// — rendering the real statement/answer content (markdown + KaTeX) is a
// separate, later lot; this one validates the draw/self-assessment loop.

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "../components/Button"
import { questionMetadataService } from "../services/questionMetadataService"
import { useTrainingSession } from "../services/TrainingSessionContext"
import type { QuestionMetadata, Tier } from "../types/question"

export function TrainingQuestionPage() {
  const { session, recordSkip, recordFound, recordNotFound } = useTrainingSession()
  const [question, setQuestion] = useState<QuestionMetadata | null>(null)
  const [revealed, setRevealed] = useState(false)

  async function drawNext(levels: Tier[]) {
    const tier = questionMetadataService.pickWeightedTier(levels)
    const next = await questionMetadataService.pickRandomQuestionInTier(tier)
    setQuestion(next)
    setRevealed(false)
  }

  useEffect(() => {
    if (session) void drawNext(session.levels)
    // Draw once on mount only — later draws are triggered explicitly by
    // the action handlers below, not by session/question changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!session) return <Navigate to="/entrainement/configuration" replace />
  if (!question) {
    return <main className="mx-auto max-w-lg px-4 py-8 text-brand-muted">Chargement de la question...</main>
  }

  function handleSkip() {
    recordSkip(question!.tier)
    void drawNext(session!.levels)
  }
  function handleFound() {
    recordFound(question!.tier)
    void drawNext(session!.levels)
  }
  function handleNotFound() {
    recordNotFound(question!.tier)
    void drawNext(session!.levels)
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Question</h1>

      <div className="flex flex-col gap-1 rounded-xl border border-brand-line bg-brand-surface p-4">
        <p>
          <span className="font-semibold">Édition :</span> {question.year} · {question.phase.toUpperCase()}
        </p>
        <p>
          <span className="font-semibold">Niveau :</span> {question.tier}
        </p>
        <p>
          <span className="font-semibold">Numéro :</span> {question.number}
        </p>
        <p className="mt-2 text-sm text-brand-muted">(Affichage de l'énoncé prévu dans un prochain lot.)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="cursor-pointer rounded-lg px-4 py-2 font-semibold hover:bg-brand-surface"
        >
          Passer
        </button>
        {!revealed && (
          <Button type="button" onClick={() => setRevealed(true)}>
            Voir la réponse et les explications
          </Button>
        )}
      </div>

      {revealed && (
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleFound}>
            J'ai trouvé
          </Button>
          <button
            type="button"
            onClick={handleNotFound}
            className="cursor-pointer rounded-lg px-4 py-2 font-semibold hover:bg-brand-surface"
          >
            Je n'ai pas trouvé
          </button>
        </div>
      )}
    </main>
  )
}
