// Story 3.2 (navigation) + 3.3 (answer show/hide) + 3.4 (summary/jump).
// Route is /archives/:year/:phase/:number — the same component instance
// stays mounted across Previous/Next/summary-jump (only the params
// change), so `showAnswers` naturally persists across those, matching
// Story 3.3's "state applies to all following questions viewed" rule.

import { ListOrdered } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { OutOfCategoryWarning } from "../components/OutOfCategoryWarning"
import { PageContainer } from "../components/PageContainer"
import { PrevNextNav } from "../components/PrevNextNav"
import { QuestionConsultation } from "../components/QuestionConsultation"
import { QuestionHeader } from "../components/QuestionHeader"
import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"
import { PHASE_LABELS, type Phase, type Question, type QuestionMetadata } from "../types/question"

export function ArchiveQuestionPage() {
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

  const navigation = (
    <PrevNextNav
      previousTo={number > 1 ? `/archives/${year}/${phase}/${number - 1}` : undefined}
      nextTo={number < total ? `/archives/${year}/${phase}/${number + 1}` : undefined}
    />
  )

  return (
    <PageContainer wide>
      <QuestionHeader
        question={question}
        subtitle={`${year} · ${PHASE_LABELS[phase]} · Question ${number}/${total}`}
        actions={
          <Link
            to={`/archives/${year}/${phase}/sommaire`}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-line px-3 py-1.5 text-sm font-medium hover:bg-brand-surface"
          >
            <ListOrdered size={16} />
            Sommaire
          </Link>
        }
      />

      {navigation}

      <OutOfCategoryWarning question={question} />

      <QuestionConsultation
        question={question}
        basePath={basePath}
        showAnswers={showAnswers}
        onShowAnswersChange={setShowAnswers}
        afterAnswers={navigation}
      />
    </PageContainer>
  )
}
