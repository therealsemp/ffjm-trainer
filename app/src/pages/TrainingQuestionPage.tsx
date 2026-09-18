// Story 2.2 — question flow, with real content (statement/answer/
// correction) rendered via RichContent.

import { ChevronsRight, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "../components/Button"
import { RichContent } from "../components/RichContent"
import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"
import { useTrainingSession } from "../services/TrainingSessionContext"
import { PHASE_LABELS, type Question, type Tier } from "../types/question"

function SelfAssessmentButtons({ onFound, onNotFound }: { onFound: () => void; onNotFound: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={onFound} className="flex items-center gap-2">
        <ThumbsUp size={18} />
        J'avais trouvé
      </Button>
      <button
        type="button"
        onClick={onNotFound}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
      >
        <ThumbsDown size={18} />
        Je n'avais pas trouvé
      </button>
    </div>
  )
}

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
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {question.title && <h1 className="text-2xl font-bold">{question.title}</h1>}
          <span className="rounded-full border-2 border-brand-gold px-2.5 py-0.5 text-sm font-bold whitespace-nowrap">
            Niveau {question.tier}
          </span>
        </div>
        <p className="text-sm text-brand-muted">
          {question.year} · {PHASE_LABELS[question.phase]}
        </p>
      </div>

      <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
        <RichContent content={question.statement} basePath={basePath} />
      </div>

      {questionMetadataService.isAboveCM(question.tier) && (
        <details className="rounded-lg border-l-4 border-brand-gold bg-brand-gold/10 p-3 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <TriangleAlert size={16} />
            Règlement officiel FFJM sur le nombre de solutions
          </summary>
          <p className="mt-2">
            Attention&nbsp;! Pour qu'un problème soit complètement résolu, vous devez donner le nombre de ses
            solutions, et donner la solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une. Pour tous
            les problèmes susceptibles d'avoir plusieurs solutions, l'emplacement a été prévu pour écrire deux
            solutions (mais il se peut qu'il n'y en ait qu'une !)
          </p>
        </details>
      )}

      <div className="flex flex-wrap gap-3">
        {!revealed && (
          <Button type="button" onClick={() => setRevealed(true)}>
            Vérifier ma réponse
          </Button>
        )}
        <button
          type="button"
          onClick={handleSkip}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-brand-line px-4 py-2 font-semibold hover:bg-brand-surface"
        >
          Ignorer
          <ChevronsRight size={18} />
        </button>
      </div>

      {revealed && (
        <>
          <div className="flex flex-col gap-4 rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-4">
            {question.answer.type !== "open" && (
              <p className="text-lg">
                <span className="font-semibold">Réponse :</span> {question.answer.value}
              </p>
            )}
            <SelfAssessmentButtons onFound={handleFound} onNotFound={handleNotFound} />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
            <h2 className="text-lg font-bold">Explication détaillée</h2>
            <RichContent content={question.correction} basePath={basePath} />
            <SelfAssessmentButtons onFound={handleFound} onNotFound={handleNotFound} />
          </div>
        </>
      )}
    </main>
  )
}
