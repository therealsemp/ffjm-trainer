// Story 3.1 — every available edition listed directly, one row per year.
// All 3 phases are always shown, in a fixed 3-column grid, so every year
// lines up the same way regardless of which phases it actually has data
// for — a phase with no data is greyed out and non-clickable rather than
// omitted (which used to leave a ragged, wrapping row of pills).

import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { questionMetadataService, PHASE_ORDER, type Edition } from "../services/questionMetadataService"
import type { Phase } from "../types/question"

// Short labels for this page only (space is tight across 3 fixed
// columns) — PHASE_LABELS' full words ("Quarts de finale") are kept as-is
// for prose contexts elsewhere (e.g. "2024 · Demi-finale · Question 3/16").
const PHASE_SHORT_LABELS: Record<Phase, string> = {
  qf: "1/4 Finale",
  sf: "1/2 Finale",
  fn: "Finale",
}

export function ArchiveSelectionPage() {
  const [editions, setEditions] = useState<Edition[] | null>(null)

  useEffect(() => {
    void questionMetadataService.getAvailableEditions().then(setEditions)
  }, [])

  return (
    <PageContainer gap="gap-6">
      <h1 className="text-3xl font-bold">Consulter les archives</h1>

      {!editions && <p className="text-brand-muted">Chargement...</p>}
      {editions && editions.length === 0 && <p className="text-brand-muted">Aucune archive disponible.</p>}

      <div className="flex flex-col gap-6">
        {editions?.map((edition) => (
          <div key={edition.year} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 font-heading text-3xl font-light text-brand-muted">
              <CalendarDays size={22} />
              {edition.year}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {PHASE_ORDER.map((phase) =>
                edition.phases.includes(phase) ? (
                  <Link
                    key={phase}
                    to={`/archives/${edition.year}/${phase}/sommaire`}
                    className="rounded-full border-2 border-brand-gold px-3 py-1.5 text-center font-semibold hover:bg-brand-gold/10"
                  >
                    {PHASE_SHORT_LABELS[phase]}
                  </Link>
                ) : (
                  <span
                    key={phase}
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-full border-2 border-brand-line px-3 py-1.5 text-center font-semibold text-brand-muted"
                  >
                    {PHASE_SHORT_LABELS[phase]}
                  </span>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
