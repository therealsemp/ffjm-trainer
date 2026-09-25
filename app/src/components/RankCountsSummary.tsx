// Story 1.5 — lifetime number of completed sessions per rank: letter-only
// chips, highest rank first, only for ranks obtained at least once. Renders
// nothing when no session has been ranked yet.

import { RANK_ORDER } from "../services/sessionRank"
import type { RankCounts } from "../types/trainingSession"
import { RankBadge } from "./RankBadge"

export function RankCountsSummary({ counts }: { counts: RankCounts }) {
  const obtained = RANK_ORDER.filter((rank) => (counts[rank] ?? 0) > 0)
  if (obtained.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Rangs obtenus</h3>
      <ul className="flex flex-wrap gap-2">
        {obtained.map((rank) => {
          const count = counts[rank] ?? 0
          return (
            <li
              key={rank}
              className="flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface py-1 pr-3 pl-1"
            >
              <RankBadge rank={rank} size="small" />
              <span className="text-sm font-semibold">
                {count} {count > 1 ? "sessions" : "session"}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
