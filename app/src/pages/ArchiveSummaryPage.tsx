// Story 3.4 — edition summary, listing every question's title and level,
// each a direct link to that question (Story 3.2). Titles are in the
// lightweight manifest, so no question file is fetched here.

import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { questionMetadataService } from "../services/questionMetadataService"
import { PHASE_LABELS, type Phase, type QuestionMetadata } from "../types/question"

export function ArchiveSummaryPage() {
  const params = useParams<{ year: string; phase: string }>()
  const year = Number(params.year)
  const phase = params.phase as Phase

  const [editionQuestions, setEditionQuestions] = useState<QuestionMetadata[] | null>(null)

  useEffect(() => {
    void questionMetadataService.getEditionQuestions(year, phase).then(setEditionQuestions)
  }, [year, phase])

  if (!params.year || !params.phase) return <Navigate to="/archives" replace />
  if (!editionQuestions) {
    return (
      <PageContainer>
        <p className="text-brand-muted">Chargement...</p>
      </PageContainer>
    )
  }
  if (editionQuestions.length === 0) return <Navigate to="/archives" replace />

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold">Sommaire</h1>
      <p className="text-brand-muted">
        {year} · {PHASE_LABELS[phase]}
      </p>

      <div className="flex flex-col gap-1">
        {editionQuestions.map((q) => (
          <Link
            key={q.number}
            to={`/archives/${year}/${phase}/${q.number}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-brand-surface"
          >
            <span className="w-6 shrink-0 text-brand-muted">{q.number}</span>
            <span className="flex-1 truncate">{q.title ?? q.id}</span>
            <span className="shrink-0 rounded-full border-2 border-brand-gold px-2.5 py-0.5 text-sm font-bold">
              {q.tier}
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
