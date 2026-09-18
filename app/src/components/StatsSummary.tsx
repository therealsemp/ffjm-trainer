import { TIER_ORDER } from "../services/questionMetadataService"
import type { Tier } from "../types/question"
import type { Stats } from "../types/trainingSession"

interface StatsSummaryProps {
  stats: Stats
  // When given (a session's own levels), only those rows are shown, even
  // at zero. Otherwise (lifetime stats), only tiers with any activity —
  // showing all 6 at zero for a profile that never trained isn't useful.
  levels?: Tier[]
}

export function StatsSummary({ stats, levels }: StatsSummaryProps) {
  const tiers = levels ?? TIER_ORDER.filter((tier) => {
    const tierStats = stats[tier]
    return tierStats.skipped + tierStats.found + tierStats.notFound > 0
  })

  const totals = tiers.reduce(
    (acc, tier) => ({
      skipped: acc.skipped + stats[tier].skipped,
      found: acc.found + stats[tier].found,
      notFound: acc.notFound + stats[tier].notFound,
    }),
    { skipped: 0, found: 0, notFound: 0 },
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold">{totals.skipped}</p>
          <p className="text-sm text-brand-muted">Ignorées</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totals.found}</p>
          <p className="text-sm text-brand-muted">Trouvées</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totals.notFound}</p>
          <p className="text-sm text-brand-muted">Non trouvées</p>
        </div>
      </div>

      {tiers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier} className="flex flex-col gap-2 rounded-lg border border-brand-line p-3">
              <p className="font-heading font-bold">{tier}</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-brand-muted">Ignorées</span>
                  <span>{stats[tier].skipped}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-brand-muted">Trouvées</span>
                  <span>{stats[tier].found}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-brand-muted">Non trouvées</span>
                  <span>{stats[tier].notFound}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
