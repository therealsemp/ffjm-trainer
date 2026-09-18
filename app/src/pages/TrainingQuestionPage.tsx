// Story 2.2 — question flow, with real content (statement/answer/
// correction) rendered via RichContent.

import { ThumbsDown, ThumbsUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "../components/Button"
import { RichContent } from "../components/RichContent"
import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"
import { useTrainingSession } from "../services/TrainingSessionContext"
import type { Question, Tier } from "../types/question"

export function TrainingQuestionPage() {
  const { session, recordSkip, recordFound, recordNotFound } = useTrainingSession()
  const [question, setQuestion] = useState<Question | null>(null)
  const [revealed, setRevealed] = useState(false)

  async function drawNext(levels: Tier[]) {
    const tier = questionMetadataService.pickWeightedTier(levels)
    const metadata = await questionMetadataService.pickRandomQuestionInTier(tier)
    const full = await questionService.getQuestion(metadata.id)
    setQuestion(full)
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
    return <main className="mx-auto max-w-3xl px-4 py-8 text-brand-muted">Chargement de la question...</main>
  }

  const basePath = `${import.meta.env.BASE_URL}data/${question.year}/${question.phase}`

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
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <p className="text-sm text-brand-muted">
        {question.year} · {question.phase.toUpperCase()} · Niveau {question.tier}
      </p>

      <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
        {questionMetadataService.isAboveCM(question.tier) && (
          <p className="border-l-4 border-brand-gold bg-brand-gold/10 p-3 text-sm">
            Pour qu'un problème soit complètement résolu, tu dois donner le nombre de ses solutions, et donner la
            solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une.
          </p>
        )}
        <RichContent content={question.statement} basePath={basePath} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="cursor-pointer rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
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
        <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
          {question.answer.type !== "open" && (
            <p>
              <span className="font-semibold">Réponse :</span> {question.answer.value}
            </p>
          )}

          <RichContent content={question.correction} basePath={basePath} />

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleFound} className="flex items-center gap-2">
              <ThumbsUp size={18} />
              J'avais trouvé
            </Button>
            <button
              type="button"
              onClick={handleNotFound}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
            >
              <ThumbsDown size={18} />
              Je n'avais pas trouvé
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
