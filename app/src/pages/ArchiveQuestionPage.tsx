// Story 3.2 (navigation) + 3.3 (answer show/hide) + 3.4 (summary/jump).
// Route is /archives/:year/:phase/:number — the same component instance
// stays mounted across Previous/Next/summary-jump (only the params
// change), so `showAnswers` naturally persists across those, matching
// Story 3.3's "state applies to all following questions viewed" rule.

import { ChevronLeft, ChevronRight, ListOrdered, TriangleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { RichContent } from "../components/RichContent"
import { useProfile } from "../services/ProfileContext"
import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"
import { PHASE_LABELS, type Phase, type Question, type QuestionMetadata } from "../types/question"

export function ArchiveQuestionPage() {
  const { profile } = useProfile()
  const params = useParams<{ year: string; phase: string; number: string }>()
  const year = Number(params.year)
  const phase = params.phase as Phase
  const number = Number(params.number)

  const [editionQuestions, setEditionQuestions] = useState<QuestionMetadata[] | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    void questionMetadataService.getEditionQuestions(year, phase).then(setEditionQuestions)
  }, [year, phase])

  useEffect(() => {
    const metadata = editionQuestions?.find((q) => q.number === number)
    if (metadata) void questionService.getQuestion(metadata.id).then(setQuestion)
  }, [editionQuestions, number])

  if (!params.year || !params.phase || !params.number) return <Navigate to="/archives" replace />
  if (!editionQuestions) {
    return (
      <PageContainer wide>
        <p className="text-brand-muted">Chargement...</p>
      </PageContainer>
    )
  }
  if (editionQuestions.length === 0 || !editionQuestions.some((q) => q.number === number)) {
    return <Navigate to="/archives" replace />
  }
  // Comparing (rather than resetting `question` to null in an effect
  // whenever `number` changes) derives "is this the freshly-loaded
  // question" straight from render, with no extra state to keep in sync.
  if (!question || question.number !== number) {
    return (
      <PageContainer wide>
        <p className="text-brand-muted">Chargement de la question...</p>
      </PageContainer>
    )
  }

  const total = editionQuestions.length
  const basePath = `${import.meta.env.BASE_URL}data/${year}/${phase}`
  const outOfCategory = profile !== null && !question.categories.includes(profile.category)

  const navigation = (
    <div className="flex items-center justify-between">
      <div>
        {number > 1 && (
          <Link
            to={`/archives/${year}/${phase}/${number - 1}`}
            className="flex items-center gap-1 font-medium text-brand-blue hover:underline"
          >
            <ChevronLeft size={18} />
            Précédent
          </Link>
        )}
      </div>
      <div>
        {number < total && (
          <Link
            to={`/archives/${year}/${phase}/${number + 1}`}
            className="flex items-center gap-1 font-medium text-brand-blue hover:underline"
          >
            Suivant
            <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <PageContainer wide>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {question.title && <h1 className="text-2xl font-bold">{question.title}</h1>}
            <span className="rounded-full border-2 border-brand-gold px-2.5 py-0.5 text-sm font-bold whitespace-nowrap">
              Niveau {question.tier}
            </span>
          </div>
          <Link
            to={`/archives/${year}/${phase}/sommaire`}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-line px-3 py-1.5 text-sm font-medium hover:bg-brand-surface"
          >
            <ListOrdered size={16} />
            Sommaire
          </Link>
        </div>
        <p className="text-sm text-brand-muted">
          {year} · {PHASE_LABELS[phase]} · Question {number}/{total}
        </p>
      </div>

      {navigation}

      {outOfCategory && profile && (
        <p className="flex items-center gap-2 rounded-lg border-l-4 border-brand-danger bg-brand-danger/10 p-3 text-sm">
          <TriangleAlert size={16} />
          Cette question ne fait pas partie de ta catégorie ({profile.category}).
        </p>
      )}

      <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
        <RichContent content={question.statement} basePath={basePath} />
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 self-start">
        <input
          type="checkbox"
          checked={showAnswers}
          onChange={(event) => setShowAnswers(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            showAnswers ? "bg-brand-gold" : "bg-brand-muted/40"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              showAnswers ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
        <span className="font-semibold">Afficher les réponses</span>
      </label>

      {showAnswers && (
        <>
          {question.answer.value !== undefined && (
            <div className="rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-4">
              <p className="text-lg">
                <span className="font-semibold">Réponse :</span> {question.answer.value}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
            <h2 className="text-lg font-bold">Explication détaillée</h2>
            <RichContent content={question.correction} basePath={basePath} />
          </div>

          {navigation}
        </>
      )}
    </PageContainer>
  )
}
