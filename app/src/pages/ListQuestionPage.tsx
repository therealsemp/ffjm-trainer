// Story 4.5 — consulting a question from "Mes favoris" or "Mes erreurs".
// Not the archive screen: same display blocks, but navigation follows the
// list. Route is /favoris/:questionId or /erreurs/:questionId, and the same
// component instance stays mounted across Previous/Next (only the param
// changes), so both the "show answers" toggle and the list's frozen order
// (captured once at mount) persist while browsing. Re-entering from the
// list page (or reloading) mounts it afresh, from the list as it is then.

import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { OutOfCategoryWarning } from "../components/OutOfCategoryWarning"
import { PageContainer } from "../components/PageContainer"
import { PrevNextNav } from "../components/PrevNextNav"
import { QuestionConsultation } from "../components/QuestionConsultation"
import { QuestionHeader } from "../components/QuestionHeader"
import { useQuestionLists } from "../services/QuestionListsContext"
import { questionMetadataService } from "../services/questionMetadataService"
import { questionService } from "../services/questionService"
import { PHASE_LABELS, type Question } from "../types/question"

export type QuestionListKind = "favorites" | "mistakes"

const LIST_CONFIG: Record<QuestionListKind, { path: string; title: string; positionLabel: string }> = {
  favorites: { path: "/favoris", title: "Mes favoris", positionLabel: "Favori" },
  mistakes: { path: "/erreurs", title: "Mes erreurs", positionLabel: "Erreur" },
}

export function ListQuestionPage({ kind }: { kind: QuestionListKind }) {
  const { questionId } = useParams<{ questionId: string }>()
  const { favorites, mistakes } = useQuestionLists()
  const config = LIST_CONFIG[kind]

  // Frozen at mount: removing the displayed favorite mustn't shift the
  // position or where Previous/Next lead (Story 4.5, Scenario 4).
  const [listIds] = useState(() => (kind === "favorites" ? favorites : mistakes).map((entry) => entry.questionId))
  // The frozen list minus questions no longer in the data, resolved once.
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    void questionMetadataService
      .getExistingByIds(listIds)
      .then((existing) => setOrderedIds(existing.map((metadata) => metadata.id)))
  }, [listIds])

  const index = orderedIds && questionId ? orderedIds.indexOf(questionId) : -1

  useEffect(() => {
    if (index >= 0 && questionId) void questionService.getQuestion(questionId).then(setQuestion)
  }, [index, questionId])

  if (!orderedIds) {
    return (
      <PageContainer wide>
        <p className="text-brand-muted">Chargement...</p>
      </PageContainer>
    )
  }
  if (index < 0) return <Navigate to={config.path} replace />
  if (!question || question.id !== questionId) {
    return (
      <PageContainer wide>
        <p className="text-brand-muted">Chargement de la question...</p>
      </PageContainer>
    )
  }

  const total = orderedIds.length
  const basePath = `${import.meta.env.BASE_URL}data/${question.year}/${question.phase}`
  const navigation = (
    <PrevNextNav
      previousTo={index > 0 ? `${config.path}/${orderedIds[index - 1]}` : undefined}
      nextTo={index < total - 1 ? `${config.path}/${orderedIds[index + 1]}` : undefined}
    />
  )

  return (
    <PageContainer wide>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={config.path} className="flex items-center gap-1 font-medium text-brand-blue hover:underline">
          <ArrowLeft size={18} />
          {config.title}
        </Link>
        <span className="text-sm font-semibold text-brand-muted">
          {config.positionLabel} {index + 1} / {total}
        </span>
      </div>

      <QuestionHeader
        question={question}
        subtitle={
          <Link to={`/archives/${question.year}/${question.phase}/${question.number}`} className="hover:underline">
            {question.year} · {PHASE_LABELS[question.phase]} · Question {question.number}
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
