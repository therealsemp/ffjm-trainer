// Story 2.7 — the end-of-session rank display: badge (letter put forward,
// label below), one dot per answered question explaining the letter, a
// discreet skipped counter, and the "try a longer session" hint for a
// perfect 5-question session. Purely presentational (everything comes in
// through props, nothing read from storage), so the dev gallery can render
// every case directly.

import type { CSSProperties } from "react"
import { computeRank, isPerfectButTooShortForSPlus, MIN_TARGET_FOR_S_PLUS, RANK_LABELS } from "../services/sessionRank"
import type { QuestionOutcome } from "../types/trainingSession"
import { RankBadge } from "./RankBadge"

interface SessionRankCardProps {
  // The session's answered questions, in order (skips excluded).
  outcomes: QuestionOutcome[]
  target: number
  skipped: number
}

export function SessionRankCard({ outcomes, target, skipped }: SessionRankCardProps) {
  const found = outcomes.filter((outcome) => outcome === "found").length
  const notFound = outcomes.length - found
  const rank = computeRank(found, target)

  return (
    <section className="rank-anim flex flex-col items-center gap-4 rounded-2xl border border-brand-line bg-brand-surface px-4 py-8 text-center">
      <RankBadge rank={rank} />

      <div className="rank-fade-up flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-widest text-brand-muted uppercase">Rang obtenu</p>
        <p className="font-heading text-3xl font-bold">{RANK_LABELS[rank]}</p>
        <p className="text-brand-muted">
          {found} {found > 1 ? "trouvées" : "trouvée"} sur {target}
        </p>
      </div>

      {/* Fixed-width rows rather than free wrapping: rows of 5 on narrow
          screens, 10 from `sm` up (a 5-question session stays one row of
          5). The grid itself is centered (w-fit + mx-auto) while a
          shorter last row (e.g. 15 = 10 + 5) stays left-aligned under the
          first one. */}
      <div
        role="img"
        aria-label={`Réponses : ${found} ${found > 1 ? "trouvées" : "trouvée"}, ${notFound} non ${notFound > 1 ? "trouvées" : "trouvée"}`}
        className={`mx-auto grid w-fit gap-2 ${target > 5 ? "grid-cols-5 sm:grid-cols-10" : "grid-cols-5"}`}
      >
        {outcomes.map((outcome, index) => (
          <span
            key={index}
            className="rank-dot h-3.5 w-3.5 rounded-full"
            style={
              {
                backgroundColor: outcome === "found" ? "var(--color-status-good)" : "var(--color-status-warning)",
                "--i": index,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {skipped > 0 && (
        <p className="text-sm text-brand-muted">
          {skipped} {skipped > 1 ? "questions passées" : "question passée"}
        </p>
      )}

      {isPerfectButTooShortForSPlus(found, target) && (
        <p className="rank-fade-up max-w-sm text-sm">
          Les sessions d'au moins {MIN_TARGET_FOR_S_PLUS} questions permettent de débloquer des rangs supplémentaires.
        </p>
      )}
    </section>
  )
}
