// Training statistics: the shared per-level view used by the account page
// (lifetime, Story 1.5), the in-session stats popup (Story 2.3) and the
// end-of-session recap (Story 2.6).
//
// Design choices: left-aligned, full content width; three equal-width stat
// tiles (success rate, found, not found) whose colored dots double as the
// legend, and a discreet line for answered/skipped totals; per-level bars
// keep absolute lengths (volume per level is part of the point), thin,
// fully rounded at both ends, with a 2px gap between the found/not-found
// segments, over a faint track that fills only the bar column (every track
// ends at the same right edge); the "found / answered" value sits in its
// own right-aligned column, outside the track (tabular figures, so the
// column lines up). Skipped questions stay out of the per-level bars (Story
// 2.3's display rule).

import { TIER_ORDER } from "../services/questionMetadataService"
import type { Tier } from "../types/question"
import type { Stats, TierStats } from "../types/trainingSession"

const FOUND_COLOR = "var(--color-status-good)"
const NOT_FOUND_COLOR = "var(--color-status-warning)"

function answered(counts: TierStats): number {
  return counts.found + counts.notFound
}

function StatTile({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-brand-line bg-brand-surface px-3 py-2">
      <span className="text-xl font-semibold">{value}</span>
      <span className="flex items-center gap-1.5 truncate text-sm text-brand-muted">
        {color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />}
        {label}
      </span>
    </div>
  )
}

function TierRow({ tier, counts, maxAnswered }: { tier: Tier; counts: TierStats; maxAnswered: number }) {
  const total = answered(counts)
  const ratio = maxAnswered > 0 ? total / maxAnswered : 0

  return (
    <div className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3">
      <span className="text-sm font-semibold">{tier}</span>
      {/* Track: fills only the bar column (never under the value column),
          so every row's track ends at the same right edge. */}
      <div className="flex h-2.5 items-center rounded-full bg-brand-muted/15">
        <div
          data-ratio={ratio}
          className="flex h-full gap-0.5 overflow-hidden rounded-full"
          style={{ width: `${ratio * 100}%` }}
        >
          {counts.found > 0 && (
            <div
              title={`Trouvées : ${counts.found}`}
              className="h-full"
              style={{ flexGrow: counts.found, backgroundColor: FOUND_COLOR }}
            />
          )}
          {counts.notFound > 0 && (
            <div
              title={`Non trouvées : ${counts.notFound}`}
              className="h-full"
              style={{ flexGrow: counts.notFound, backgroundColor: NOT_FOUND_COLOR }}
            />
          )}
        </div>
      </div>
      <span className="text-right text-sm whitespace-nowrap text-brand-muted tabular-nums">
        {counts.found} / {total}
      </span>
    </div>
  )
}

interface StatsSummaryProps {
  stats: Stats
  // When given (a session's own levels: popup and recap), exactly those
  // rows are shown, even with nothing answered yet. Otherwise
  // (lifetime stats), only levels with at least one answer get a row.
  levels?: Tier[]
}

export function StatsSummary({ stats, levels }: StatsSummaryProps) {
  const tiers = levels ?? TIER_ORDER.filter((tier) => answered(stats[tier]) > 0)
  const totals = TIER_ORDER.reduce(
    (acc, tier) => ({
      skipped: acc.skipped + stats[tier].skipped,
      found: acc.found + stats[tier].found,
      notFound: acc.notFound + stats[tier].notFound,
    }),
    { skipped: 0, found: 0, notFound: 0 },
  )
  const answeredTotal = totals.found + totals.notFound
  const maxAnswered = Math.max(0, ...tiers.map((tier) => answered(stats[tier])))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          value={answeredTotal > 0 ? `${Math.round((totals.found / answeredTotal) * 100)} %` : "-"}
          label="Réussite"
        />
        <StatTile value={String(totals.found)} label={totals.found > 1 ? "Trouvées" : "Trouvée"} color={FOUND_COLOR} />
        <StatTile
          value={String(totals.notFound)}
          label={totals.notFound > 1 ? "Non trouvées" : "Non trouvée"}
          color={NOT_FOUND_COLOR}
        />
      </div>
      <p className="text-sm text-brand-muted">
        {answeredTotal} {answeredTotal > 1 ? "questions répondues" : "question répondue"}, {totals.skipped}{" "}
        {totals.skipped > 1 ? "passées" : "passée"}
      </p>

      {tiers.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {tiers.map((tier) => (
            <TierRow key={tier} tier={tier} counts={stats[tier]} maxAnswered={maxAnswered} />
          ))}
        </div>
      )}
    </div>
  )
}
