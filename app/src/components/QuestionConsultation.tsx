// Shared consultation body (archives, Story 3.3, and list consultation,
// Story 4.5): statement, then the "show answers" toggle revealing the
// short answer and the detailed correction. The toggle's state is owned by
// the screen, so it can persist across Previous/Next. `afterAnswers` is
// rendered below the revealed answers (e.g. a second navigation bar).

import type { ReactNode } from "react"
import type { Question } from "../types/question"
import { RichContent } from "./RichContent"

interface QuestionConsultationProps {
  question: Question
  basePath: string
  showAnswers: boolean
  onShowAnswersChange: (showAnswers: boolean) => void
  afterAnswers?: ReactNode
}

export function QuestionConsultation({
  question,
  basePath,
  showAnswers,
  onShowAnswersChange,
  afterAnswers,
}: QuestionConsultationProps) {
  return (
    <>
      <div className="rounded-xl border border-brand-line bg-brand-surface p-4">
        <RichContent content={question.statement} basePath={basePath} />
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 self-start">
        <input
          type="checkbox"
          checked={showAnswers}
          onChange={(event) => onShowAnswersChange(event.target.checked)}
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

          {question.correction && (
            <div className="flex flex-col gap-4 rounded-xl border border-brand-line bg-brand-surface p-4">
              <h2 className="text-lg font-bold">Explication détaillée</h2>
              <RichContent content={question.correction} basePath={basePath} />
            </div>
          )}

          {afterAnswers}
        </>
      )}
    </>
  )
}
