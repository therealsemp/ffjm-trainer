// Stories 4.3 / 4.4 — the shared look of the "Mes favoris" and "Mes
// erreurs" pages: one row per question (title, edition, level, the list's
// own date, and the favorite bookmark). Everything shown comes from the
// lightweight manifest (titles included), so no question file is fetched.
// Entries whose question no longer exists in the data are dropped.

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { questionMetadataService } from "../services/questionMetadataService"
import { PHASE_LABELS, type QuestionMetadata } from "../types/question"
import { FavoriteButton } from "./FavoriteButton"

export interface QuestionListItem {
  questionId: string
  // Already worded for display, e.g. "Ajouté le 24/09/2026".
  dateLabel: string
}

interface QuestionListViewProps {
  items: QuestionListItem[]
  // Where a row leads: `${linkBase}/${questionId}` (Story 4.5).
  linkBase: string
  empty: ReactNode
}

export function QuestionListView({ items, linkBase, empty }: QuestionListViewProps) {
  // Manifest entries by id. Only ever grows: removing an item (a favorite
  // unbookmarked here) just stops rendering its row.
  const [questions, setQuestions] = useState<Map<string, QuestionMetadata> | null>(null)
  const idsKey = items.map((item) => item.questionId).join("|")

  useEffect(() => {
    let cancelled = false
    void questionMetadataService.getExistingByIds(idsKey === "" ? [] : idsKey.split("|")).then((existing) => {
      if (cancelled) return
      setQuestions((current) => {
        const next = new Map(current ?? [])
        for (const question of existing) next.set(question.id, question)
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [idsKey])

  const rows = useMemo(
    () =>
      questions
        ? items.flatMap((item) => {
            const question = questions.get(item.questionId)
            return question ? [{ item, question }] : []
          })
        : null,
    [items, questions],
  )

  if (!rows) return <p className="text-brand-muted">Chargement...</p>
  if (rows.length === 0) return <>{empty}</>

  return (
    <ul className="flex flex-col gap-2">
      {rows.map(({ item, question }) => (
        <li
          key={question.id}
          className="flex items-center gap-3 rounded-xl border border-brand-line bg-brand-surface py-2 pr-2 pl-4"
        >
          <Link to={`${linkBase}/${question.id}`} className="flex min-w-0 flex-1 flex-col gap-0.5 py-1 hover:underline">
            <span className="truncate font-semibold">{question.title ?? `Question ${question.number}`}</span>
            <span className="text-sm text-brand-muted">
              {question.year} · {PHASE_LABELS[question.phase]} · Question {question.number}
            </span>
            <span className="text-xs text-brand-muted">{item.dateLabel}</span>
          </Link>
          <span className="shrink-0 rounded-full border-2 border-brand-gold px-2.5 py-0.5 text-sm font-bold whitespace-nowrap">
            {question.tier}
          </span>
          <FavoriteButton questionId={question.id} />
        </li>
      ))}
    </ul>
  )
}
