// Shared question header (training, archives, list consultation): title,
// level badge and favorite bookmark (Story 4.2), an optional control on the
// right (session stats, edition summary...), and a subtitle line (edition,
// position...) supplied by each screen.

import type { ReactNode } from "react"
import type { Question } from "../types/question"
import { FavoriteButton } from "./FavoriteButton"

interface QuestionHeaderProps {
  question: Question
  subtitle: ReactNode
  actions?: ReactNode
}

export function QuestionHeader({ question, subtitle, actions }: QuestionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {question.title && <h1 className="text-2xl font-bold">{question.title}</h1>}
          <span className="rounded-full border-2 border-brand-gold px-2.5 py-0.5 text-sm font-bold whitespace-nowrap">
            Niveau {question.tier}
          </span>
          <FavoriteButton questionId={question.id} />
        </div>
        {actions}
      </div>
      <p className="text-sm text-brand-muted">{subtitle}</p>
    </div>
  )
}
