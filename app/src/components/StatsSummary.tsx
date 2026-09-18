import { TIER_ORDER } from "../services/questionMetadataService"
import type { Tier } from "../types/question"
import type { Stats, TierStats } from "../types/trainingSession"

interface StatsSummaryProps {
  stats: Stats
  // When given (a session's own levels), only those rows are shown, even
  // at zero. Otherwise (lifetime stats), only tiers with any activity —
  // showing all 6 at zero for a profile that never trained isn't useful.
  levels?: Tier[]
}

// Status colors (found/not found), plus the neutral "skipped" — see
// index.css for why plain green/orange was rejected (colorblind-unsafe).
const SEGMENTS = [
  { key: "skipped", label: "Ignorées", color: "var(--color-brand-muted)" },
  { key: "found", label: "Trouvées", color: "var(--color-status-good)" },
  { key: "notFound", label: "Non trouvées", color: "var(--color-status-warning)" },
] as const

function TierBar({ tier, counts, maxTotal }: { tier: Tier; counts: TierStats; maxTotal: number }) {
  const total = counts.skipped + counts.found + counts.notFound
  const barWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0
  const visibleSegments = SEGMENTS.filter((segment) => counts[segment.key] > 0)

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 font-heading font-bold">{tier}</span>
      <div className="h-4 flex-1">
        {total > 0 && (
          <div className="flex h-full gap-0.5" style={{ width: `${barWidthPercent}%` }}>
            {visibleSegments.map((segment) => (
              <div
                key={segment.key}
                title={`${segment.label} : ${counts[segment.key]}`}
                className="h-full"
                style={{ width: `${(counts[segment.key] / total) * 100}%`, backgroundColor: segment.color }}
              />
            ))}
          </div>
        )}
      </div>
      <span className="w-24 shrink-0 text-right text-sm text-brand-muted whitespace-nowrap">
        {counts.skipped} · {counts.found} · {counts.notFound}
      </span>
    </div>
  )
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

  const maxTotal = Math.max(0, ...tiers.map((tier) => stats[tier].skipped + stats[tier].found + stats[tier].notFound))

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
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-muted">
            {SEGMENTS.map((segment) => (
              <span key={segment.key} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {tiers.map((tier) => (
              <TierBar key={tier} tier={tier} counts={stats[tier]} maxTotal={maxTotal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
