// Story 3.1 — every available edition listed directly, one row per year,
// its phases as directly clickable links. No selector-and-confirm step:
// only combinations that actually exist in the data are ever shown.

import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageContainer } from "../components/PageContainer"
import { questionMetadataService, type Edition } from "../services/questionMetadataService"
import { PHASE_LABELS } from "../types/question"

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
            <div className="flex flex-wrap gap-2">
              {edition.phases.map((phase) => (
                <Link
                  key={phase}
                  to={`/archives/${edition.year}/${phase}/sommaire`}
                  className="rounded-full border-2 border-brand-gold px-4 py-1.5 font-semibold hover:bg-brand-gold/10"
                >
                  {PHASE_LABELS[phase]}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
